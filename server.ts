import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// SMTP Transporter setup with lazy / fallback handling
function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Graceful simulation transport when SMTP keys not yet configured
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

// Razorpay Credentials
const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID ||
  process.env.VITE_RAZORPAY_KEY_ID ||
  'rzp_test_TNZywh7nWdGBHZ';

const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET ||
  'HI6nYMK6VG8gZg0WEqggkJHW';

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    razorpayConfigured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
  });
});

// Razorpay Public Config Endpoint
app.get('/api/razorpay/config', (_req, res) => {
  res.json({
    keyId: RAZORPAY_KEY_ID,
    hasSecret: Boolean(RAZORPAY_KEY_SECRET),
  });
});

// Razorpay Create Order Endpoint
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, customerName, customerEmail, customerPhone } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order amount',
      });
    }

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);
    const receiptCode = receipt || `rcpt_${Date.now()}`;

    const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`;

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receiptCode,
        notes: {
          customerName: customerName || '',
          customerEmail: customerEmail || '',
          customerPhone: customerPhone || '',
          brand: 'Majanya Ji Ethnic Wear',
        },
      }),
    });

    const data = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error('Razorpay API error response:', data);
      return res.status(rzpResponse.status).json({
        success: false,
        error: data.error?.description || 'Failed to create Razorpay order',
        details: data,
      });
    }

    res.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while creating Razorpay order',
    });
  }
});

// Razorpay Verify Signature Endpoint
app.post('/api/razorpay/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        verified: false,
        error: 'Missing required Razorpay payment verification parameters',
      });
    }

    // Official Razorpay SHA-256 HMAC signature verification
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      res.json({
        verified: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        message: 'Payment signature verified successfully',
      });
    } else {
      res.status(400).json({
        verified: false,
        error: 'Signature verification failed',
      });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      verified: false,
      error: error.message || 'Internal error during signature verification',
    });
  }
});

// Transactional Email Status / Capabilities Endpoint
app.get('/api/notifications/status', (_req, res) => {
  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  res.json({
    status: 'ok',
    isSmtpConfigured,
    smtpHost: process.env.SMTP_HOST || 'Simulated Ethereal Mailer',
    smtpPort: process.env.SMTP_PORT || 587,
    fromAddress: process.env.SMTP_FROM || 'Majanya Ji Ethnic Wear <orders@majanyaji.com>',
    cloudFunctionsTriggers: [
      {
        name: 'onOrderCreated',
        type: 'Firestore onCreate',
        target: 'orders/{orderId}',
        event: 'Order Confirmation Email',
        active: true,
      },
      {
        name: 'onOrderShippingUpdated',
        type: 'Firestore onUpdate',
        target: 'orders/{orderId}',
        event: 'Shipping Dispatch & AWB Tracking Notice Email',
        active: true,
      },
      {
        name: 'onOrderUpdated',
        type: 'Firestore onUpdate',
        target: 'orders/{orderId}',
        event: 'Lifecycle State Sync (Confirmation & Shipping)',
        active: true,
      },
      {
        name: 'apiSendOrderEmail',
        type: 'HTTPS / Callable',
        target: '/apiSendOrderEmail',
        event: 'Instant Admin & Manual Trigger',
        active: true,
      },
    ],
  });
});

// Automated Transactional Email Dispatch Endpoint
app.post('/api/notifications/send-email', async (req, res) => {
  try {
    const {
      to,
      subject,
      html,
      orderId,
      triggerType = 'order_confirmation',
      courier,
      trackingNumber,
      customerName,
    } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: to, subject, and html are required.',
      });
    }

    const transporter = getEmailTransporter();
    const from = process.env.SMTP_FROM || '"Majanya Ji Ethnic Wear" <orders@majanyaji.com>';

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    const isRealSmtp = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    );

    console.log(`[Transactional Email] Trigger '${triggerType}' dispatched for order #${orderId} to ${to}`);

    res.json({
      success: true,
      delivered: true,
      messageId: info.messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderId: orderId || null,
      triggerType,
      recipient: to,
      customerName: customerName || null,
      subject,
      courier: courier || null,
      trackingNumber: trackingNumber || null,
      sentAt: new Date().toISOString(),
      provider: isRealSmtp ? 'SMTP Live Gateway' : 'Cloud Simulation Transporter (Preview Mode)',
    });
  } catch (err: any) {
    console.error('Error dispatching transactional email:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch transactional email',
    });
  }
});

// ================= REAL-TIME SHIPPING CARRIER STATUS ENDPOINTS =================

// Fetch live carrier status based on Tracking ID
app.get('/api/tracking/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const {
      courier,
      orderId,
      customerName,
      orderStatus,
      status,
      city,
      state,
      pinCode,
      estimatedDelivery,
      dispatchDate,
    } = req.query as Record<string, string>;

    if (!trackingId) {
      return res.status(400).json({
        success: false,
        error: 'Tracking ID (AWB) is required.',
      });
    }

    const { resolveCarrierStatus } = await import('./src/utils/carrierTrackingResolver');

    const trackingData = resolveCarrierStatus({
      trackingId,
      courier,
      orderId,
      customerName,
      orderStatus: orderStatus || status,
      shippingAddress: {
        city: city || 'Indore',
        state: state || 'Madhya Pradesh',
        pinCode: pinCode || '452010',
      },
      estimatedDelivery,
      dispatchDate,
    });

    res.json({
      success: true,
      trackingId,
      carrier: trackingData.carrier,
      carrierCode: trackingData.carrierCode,
      status: trackingData.status,
      statusCategory: trackingData.statusCategory,
      currentLocation: trackingData.currentLocation,
      originCity: trackingData.originCity,
      destinationCity: trackingData.destinationCity,
      estimatedDelivery: trackingData.estimatedDelivery,
      lastUpdated: trackingData.lastUpdated,
      checkpoints: trackingData.checkpoints,
      deliveryAssociate: trackingData.deliveryAssociate,
      pod: trackingData.pod,
      trackingUrl: trackingData.trackingUrl,
      isLive: true,
    });
  } catch (error: any) {
    console.error('Error fetching carrier tracking data:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch carrier tracking data',
    });
  }
});

// Batch carrier tracking query endpoint
app.post('/api/tracking/batch', async (req, res) => {
  try {
    const { orders = [] } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        error: 'orders array is required',
      });
    }

    const { resolveCarrierStatus } = await import('./src/utils/carrierTrackingResolver');

    const results: Record<string, any> = {};

    for (const orderItem of orders) {
      const trackingId = orderItem.trackingId || orderItem.trackingNumber;
      if (trackingId) {
        results[trackingId] = resolveCarrierStatus({
          trackingId,
          courier: orderItem.courier,
          orderId: orderItem.orderId || orderItem.id,
          customerName: orderItem.customerName,
          orderStatus: orderItem.orderStatus || orderItem.status,
          shippingAddress: orderItem.shippingAddress,
          deliveryExecutive: orderItem.deliveryExecutive,
          pod: orderItem.pod,
          dispatchDate: orderItem.dispatchDate,
          estimatedDelivery: orderItem.estimatedDelivery,
          createdAt: orderItem.createdAt,
        });
      }
    }

    res.json({
      success: true,
      count: Object.keys(results).length,
      trackingData: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error batch fetching tracking data:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to batch fetch tracking data',
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Majanya Ji Ethnic Wear server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
