import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineString, defineInt } from 'firebase-functions/params';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// SMTP Parameter Definitions (Configurable via Firebase CLI / Cloud Functions environment)
const smtpHostParam = defineString('SMTP_HOST', { default: 'smtp.gmail.com' });
const smtpPortParam = defineInt('SMTP_PORT', { default: 587 });
const smtpUserParam = defineString('SMTP_USER', { default: '' });
const smtpPassParam = defineString('SMTP_PASS', { default: '' });
const smtpFromParam = defineString('SMTP_FROM', {
  default: '"Majanya Ji Ethnic Wear" <orders@majanyaji.com>',
});
const smtpSecureParam = defineString('SMTP_SECURE', { default: 'false' });

// Brand Constants
const BRAND = {
  name: 'Majanya Ji',
  fullName: "Majanya Ji Men's Ethnic Wear",
  tagline: 'Royal Heritage Attire Handcrafted in Indore',
  supportEmail: 'orders@majanyaji.com',
  supportPhone: '+91 70074 57920',
  atelierAddress: '54, Sarafa Bazaar / MG Road Heritage District, Indore, Madhya Pradesh 452006',
  portalUrl: 'https://majanyaji.com',
};

/**
 * Resolves active SMTP settings from Firebase params or process.env
 */
export function getSmtpSettings() {
  const host = process.env.SMTP_HOST || smtpHostParam.value();
  const port = Number(process.env.SMTP_PORT || smtpPortParam.value()) || 587;
  const user = process.env.SMTP_USER || smtpUserParam.value();
  const pass = process.env.SMTP_PASS || smtpPassParam.value();
  const from =
    process.env.SMTP_FROM ||
    smtpFromParam.value() ||
    `"${BRAND.name}" <${BRAND.supportEmail}>`;
  const secure =
    (process.env.SMTP_SECURE || smtpSecureParam.value()) === 'true' || port === 465;

  const isConfigured = Boolean(host && user && pass);

  return {
    host,
    port,
    user,
    pass,
    from,
    secure,
    isConfigured,
  };
}

/**
 * Configure and initialize Nodemailer Transporter using configured SMTP settings.
 * Falls back safely to a mock JSON/logging transport if credentials are not yet supplied,
 * preventing cloud function crashes during initialization.
 */
export function createTransporter() {
  const settings = getSmtpSettings();

  if (settings.isConfigured) {
    console.log(
      `[SMTP] Initializing live Nodemailer transport via ${settings.host}:${settings.port} (User: ${settings.user}, Secure: ${settings.secure})`
    );
    return nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.user,
        pass: settings.pass,
      },
    });
  }

  console.log(
    '[SMTP] Credentials not fully configured in environment; initializing development simulation transporter.'
  );
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

/**
 * Escapes HTML characters
 */
function escapeHtml(text: any): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates Luxury Order Confirmation HTML Email
 */
function generateOrderConfirmationHtml(orderId: string, orderData: any): string {
  const customerName =
    orderData.shippingAddress?.fullName ||
    orderData.customerName ||
    'Valued Patron';
  const customerEmail =
    orderData.customerEmail ||
    orderData.email ||
    orderData.shippingAddress?.email ||
    'customer';
  const total = Number(orderData.total ?? orderData.totalAmount ?? 0);
  const items: any[] = orderData.items || orderData.products || [];
  const paymentMethod = orderData.paymentMethod || 'Cash on Delivery';
  const address = orderData.shippingAddress || {};
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const itemsRows = items
    .map((item) => {
      const name = escapeHtml(item.product?.name || item.name || item.productName || "Men's Royal Ethnic Outfit");
      const size = escapeHtml(item.size || item.selectedSize || 'L');
      const qty = item.quantity || 1;
      const price = Number(item.price || item.product?.price || 0);
      const lineTotal = price * qty;
      const img = item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=200';

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #F0ECE4;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="60" valign="top" style="padding-right: 12px;">
                  <img src="${img}" alt="${name}" width="56" height="70" style="display:block; object-fit:cover; border-radius:6px; border:1px solid #EADBCE;" />
                </td>
                <td valign="top" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #1E1E1E;">${name}</p>
                  <p style="margin: 0 0 2px 0; font-size: 11px; color: #666666;">Size: <strong style="color: #5A1A1A;">${size}</strong> &bull; Qty: ${qty}</p>
                  <p style="margin: 0; font-size: 11px; color: #888888;">Unit Price: &#8377;${price.toLocaleString('en-IN')}</p>
                </td>
                <td width="90" valign="top" align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #5A1A1A;">&#8377;${lineTotal.toLocaleString('en-IN')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order Confirmation #${escapeHtml(orderId)}</title>
  <style>
    body { margin: 0; padding: 24px 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E1E1E; }
    .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #EADBCE; }
    .brand-bar { background-color: #5A1A1A; padding: 28px 24px; text-align: center; }
    .gold-accent { color: #C9A227; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand-bar">
      <h1 style="margin: 0 0 6px 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 0.14em; color: #FAF7F2; text-transform: uppercase;">
        ${BRAND.name}
      </h1>
      <p style="margin: 0; font-size: 11px; letter-spacing: 0.2em; color: #C9A227; text-transform: uppercase;">
        Indore Atelier &bull; Royal Ethnic Wear
      </p>
    </div>

    <div style="padding: 28px 32px;">
      <div style="background-color: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 14px; font-weight: 700; color: #065F46;">Order Confirmed & Atelier Handcrafting Scheduled</span>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">Order #${escapeHtml(orderId)} &bull; ${formattedDate}</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 18px 0;">
        Namaste <strong>${escapeHtml(customerName)}</strong>,<br/>
        Thank you for choosing ${BRAND.name}. Your bespoke ensemble has been queued with our master tailors in our Indore workshop. We ensure high craftsmanship, luxury fabrics, and steam-finished packaging.
      </p>

      <h3 style="font-family: Georgia, serif; font-size: 15px; color: #5A1A1A; border-bottom: 1px solid #EADBCE; padding-bottom: 6px; margin: 20px 0 12px 0;">
        Order Breakdown
      </h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${itemsRows}
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
        <tr>
          <td style="font-size: 13px; color: #555555; padding: 4px 0;">Payment Method:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #1E1E1E;">${escapeHtml(paymentMethod)}</td>
        </tr>
        <tr>
          <td style="font-size: 15px; font-weight: 700; color: #5A1A1A; padding-top: 8px; border-top: 1px dashed #EADBCE;">Total Payable:</td>
          <td align="right" style="font-size: 18px; font-weight: 700; color: #5A1A1A; padding-top: 8px; border-top: 1px dashed #EADBCE;">&#8377;${total.toLocaleString('en-IN')}</td>
        </tr>
      </table>

      <div style="background: #FDFBF7; border: 1px solid #EADBCE; border-radius: 8px; padding: 14px 16px; margin-top: 22px;">
        <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #5A1A1A; text-transform: uppercase;">Shipping Destination</p>
        <p style="margin: 0 0 2px 0; font-size: 12px; font-weight: 600; color: #1E1E1E;">${escapeHtml(address.fullName || customerName)}</p>
        <p style="margin: 0 0 2px 0; font-size: 12px; color: #555555;">${escapeHtml(address.address || '')}, ${escapeHtml(address.city || '')}, ${escapeHtml(address.state || '')} - ${escapeHtml(address.pinCode || '')}</p>
        <p style="margin: 0; font-size: 12px; color: #555555;">Phone: ${escapeHtml(address.phone || orderData.phone || 'Provided')}</p>
      </div>

      <div style="margin-top: 24px; padding: 16px; background-color: #FAF7F2; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #5A1A1A;">Need Sizing Alterations or Urgent Dispatch?</p>
        <p style="margin: 0 0 10px 0; font-size: 11px; color: #666666;">Master Artisan Siddhant Jain is directly reachable on WhatsApp.</p>
        <a href="https://wa.me/917007457920" style="display:inline-block; background:#25D366; color:#FFFFFF; font-size:12px; font-weight:700; text-decoration:none; padding:8px 16px; border-radius:6px;">
          WhatsApp Direct: +91 70074 57920
        </a>
      </div>
    </div>

    <div style="background-color: #1E1E1E; padding: 20px 24px; text-align: center; color: #999999; font-size: 10px; line-height: 1.6;">
      <p style="margin: 0 0 4px 0; color: #C9A227; font-weight: 600;">${BRAND.fullName}</p>
      <p style="margin: 0 0 4px 0;">${BRAND.atelierAddress}</p>
      <p style="margin: 0;">Automated notification dispatched to ${escapeHtml(customerEmail)}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates Luxury Shipping & Dispatch Update HTML Email
 */
function generateShippingUpdateHtml(orderId: string, orderData: any): string {
  const customerName =
    orderData.shippingAddress?.fullName ||
    orderData.customerName ||
    'Valued Patron';
  const courier = orderData.courier || 'Blue Dart Express';
  const awb = orderData.trackingNumber || `BLUEDART-${orderId.replace(/\D/g, '') || '98213'}IN`;
  const estimatedDelivery = orderData.estimatedDelivery || '2 - 3 Business Days';
  const status = orderData.orderStatus || 'Shipped';

  let courierUrl = 'https://www.bluedart.com/tracking';
  if (courier.toLowerCase().includes('delhivery')) courierUrl = `https://www.delhivery.com/track/package/${awb}`;
  else if (courier.toLowerCase().includes('dtdc')) courierUrl = `https://www.dtdc.in/tracking/shipment-tracking.asp?refNo=${awb}`;
  else if (courier.toLowerCase().includes('shadowfax')) courierUrl = `https://tracker.shadowfax.in/#/track?awb=${awb}`;
  else if (courier.toLowerCase().includes('xpressbees')) courierUrl = `https://www.xpressbees.com/shipment/tracking?awb=${awb}`;
  else courierUrl = `https://www.bluedart.com/tracking?numbers=${awb}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Shipping Update: Order #${escapeHtml(orderId)}</title>
  <style>
    body { margin: 0; padding: 24px 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E1E1E; }
    .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #EADBCE; }
    .brand-bar { background-color: #5A1A1A; padding: 24px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand-bar">
      <h1 style="margin: 0 0 6px 0; font-family: Georgia, serif; font-size: 22px; letter-spacing: 0.14em; color: #FAF7F2; text-transform: uppercase;">
        ${BRAND.name}
      </h1>
      <p style="margin: 0; font-size: 11px; letter-spacing: 0.2em; color: #C9A227; text-transform: uppercase;">
        Shipment Dispatch Notice
      </p>
    </div>

    <div style="padding: 28px 32px;">
      <div style="background-color: #EFF6FF; border: 1px solid #3B82F6; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 14px; font-weight: 700; color: #1D4ED8;">En Route: Your Royal Outfit is ${escapeHtml(status)}</span>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #2563EB;">Order #${escapeHtml(orderId)} &bull; Handed over to ${escapeHtml(courier)}</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
        Namaste <strong>${escapeHtml(customerName)}</strong>,<br/>
        Great news! Your tailored outfit has completed steam finishing and quality inspection. It has been securely sealed in a royal dust jacket and dispatched via our priority express linehaul partner.
      </p>

      <div style="background: #FDFBF7; border: 1px solid #C9A227; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-bottom: 10px; font-size: 12px; color: #666666;">Courier Partner:</td>
            <td align="right" style="padding-bottom: 10px; font-size: 13px; font-weight: 700; color: #1E1E1E;">${escapeHtml(courier)}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px; font-size: 12px; color: #666666;">AWB Tracking ID:</td>
            <td align="right" style="padding-bottom: 10px; font-family: monospace; font-size: 14px; font-weight: 700; color: #5A1A1A;">${escapeHtml(awb)}</td>
          </tr>
          <tr>
            <td style="font-size: 12px; color: #666666;">Expected Arrival:</td>
            <td align="right" style="font-size: 13px; font-weight: 700; color: #047857;">${escapeHtml(estimatedDelivery)}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 16px; padding-top: 14px; border-top: 1px dashed #EADBCE;">
          <a href="${courierUrl}" target="_blank" style="display:inline-block; background:#5A1A1A; color:#FFFFFF; font-size:12px; font-weight:700; text-decoration:none; padding:10px 24px; border-radius:6px;">
            Track Live Shipment &rarr;
          </a>
        </div>
      </div>

      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px 16px; font-size: 12px; color: #555555; line-height: 1.5;">
        <strong style="color: #1E1E1E;">Delivery Tip:</strong> Please ensure your registered mobile number is reachable on the day of delivery for the courier OTP verification.
      </div>
    </div>

    <div style="background-color: #1E1E1E; padding: 20px 24px; text-align: center; color: #999999; font-size: 10px; line-height: 1.6;">
      <p style="margin: 0 0 4px 0; color: #C9A227; font-weight: 600;">${BRAND.fullName}</p>
      <p style="margin: 0 0 4px 0;">${BRAND.atelierAddress} &bull; Support: ${BRAND.supportPhone}</p>
      <p style="margin: 0;">Automated shipping dispatch trigger</p>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// CORE HELPER: sendOrderConfirmationEmail
// Dispatches luxury HTML receipt via Nodemailer using configured SMTP settings
// and records telemetry & notifications in Firestore.
// ============================================================================
export async function sendOrderConfirmationEmail(
  orderId: string,
  orderData: any,
  orderDocRef?: admin.firestore.DocumentReference,
  options?: { force?: boolean; sourceTrigger?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Prevent duplicate confirmation emails unless explicitly forced
  if (orderData.emailConfirmationSent && !options?.force) {
    console.log(`[Order Confirmation] Order #${orderId} has already received a confirmation email. Skipping.`);
    return { success: true, messageId: 'already_sent' };
  }

  const recipientEmail =
    orderData.customerEmail ||
    orderData.email ||
    orderData.shippingAddress?.email ||
    orderData.userEmail;

  if (!recipientEmail) {
    const errorMsg = `[Order Confirmation] Order #${orderId} has no recipient email address. Skipping email.`;
    console.warn(errorMsg);
    return { success: false, error: errorMsg };
  }

  const smtpSettings = getSmtpSettings();
  const transporter = createTransporter();
  const htmlContent = generateOrderConfirmationHtml(orderId, orderData);
  const subject = `Order Confirmed: #${orderId} - ${BRAND.fullName}`;

  console.log(
    `[Order Confirmation] Triggered via ${options?.sourceTrigger || 'Firestore'}. Dispatching confirmation email for #${orderId} to ${recipientEmail} via SMTP (${smtpSettings.host || 'simulation'})...`
  );

  try {
    const fromAddress = smtpSettings.from;
    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    const messageId = info.messageId || `local_${Date.now()}`;
    console.log(
      `[Order Confirmation] Order #${orderId} confirmation email successfully sent. Message ID: ${messageId}`
    );

    // Update the order document with email confirmation status & audit records
    if (orderDocRef) {
      await orderDocRef.update({
        emailConfirmationSent: true,
        emailConfirmationSentAt: admin.firestore.FieldValue.serverTimestamp(),
        lastEmailDispatched: {
          type: 'order_confirmation',
          subject,
          recipient: recipientEmail,
          timestamp: new Date().toISOString(),
          messageId,
          smtpHost: smtpSettings.host || 'simulation',
          triggerSource: options?.sourceTrigger || 'Firestore_Trigger',
        },
      });

      // Write to orders/{orderId}/notifications audit subcollection
      await orderDocRef.collection('notifications').add({
        type: 'order_confirmation',
        subject,
        recipient: recipientEmail,
        status: 'Delivered',
        channel: 'email',
        messageId,
        smtpHost: smtpSettings.host || 'simulation',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Mirror to top-level 'mail' collection (compatible with Firebase Trigger Email extension)
    try {
      await db.collection('mail').add({
        to: recipientEmail,
        message: {
          subject,
          html: htmlContent,
        },
        orderId,
        triggerType: 'order_confirmation',
        dispatchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch {
      // Non-critical mirror fallback
    }

    return { success: true, messageId };
  } catch (error: any) {
    console.error(`[Order Confirmation] Error dispatching email for Order #${orderId}:`, error);
    return { success: false, error: error.message || 'Error sending confirmation email' };
  }
}

// ============================================================================
// CORE HELPER: sendOrderShippingUpdateEmail
// Dispatches luxury HTML dispatch notice via Nodemailer using configured SMTP settings
// and records tracking telemetry & notifications in Firestore.
// ============================================================================
export async function sendOrderShippingUpdateEmail(
  orderId: string,
  orderData: any,
  orderDocRef?: admin.firestore.DocumentReference,
  options?: { force?: boolean; sourceTrigger?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const currentTracking = orderData.trackingNumber || orderData.awb || '';

  // Idempotency: don't re-send if already sent for this tracking number unless forced
  if (
    orderData.shippingEmailSentFor === currentTracking &&
    currentTracking &&
    !options?.force
  ) {
    console.log(
      `[Shipping Update] Email already dispatched for Order #${orderId} with AWB ${currentTracking}. Skipping.`
    );
    return { success: true, messageId: 'already_sent' };
  }

  const recipientEmail =
    orderData.customerEmail ||
    orderData.email ||
    orderData.shippingAddress?.email ||
    orderData.userEmail;

  if (!recipientEmail) {
    const errorMsg = `[Shipping Update] Order #${orderId} has no recipient email address for shipping update.`;
    console.warn(errorMsg);
    return { success: false, error: errorMsg };
  }

  const smtpSettings = getSmtpSettings();
  const transporter = createTransporter();
  const htmlContent = generateShippingUpdateHtml(orderId, orderData);
  const courier = orderData.courier || 'Blue Dart Express';
  const awb = currentTracking || `BLUEDART-${orderId.replace(/\D/g, '') || '98213'}IN`;
  const subject = `Dispatched! Your Majanya Ji Order #${orderId} is on the way (${courier} - ${awb})`;

  console.log(
    `[Shipping Update] Triggered via ${options?.sourceTrigger || 'Firestore'}. Dispatching shipping email for #${orderId} (AWB: ${awb}, Courier: ${courier}) to ${recipientEmail} via SMTP (${smtpSettings.host || 'simulation'})...`
  );

  try {
    const fromAddress = smtpSettings.from;
    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    const messageId = info.messageId || `local_${Date.now()}`;
    console.log(
      `[Shipping Update] Order #${orderId} shipping update email dispatched successfully. Message ID: ${messageId}`
    );

    if (orderDocRef) {
      await orderDocRef.update({
        shippingEmailSent: true,
        shippingEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        shippingEmailSentFor: currentTracking || awb,
        lastEmailDispatched: {
          type: 'shipping_update',
          subject,
          recipient: recipientEmail,
          timestamp: new Date().toISOString(),
          awb: currentTracking || awb,
          courier,
          messageId,
          smtpHost: smtpSettings.host || 'simulation',
          triggerSource: options?.sourceTrigger || 'Firestore_Trigger',
        },
      });

      await orderDocRef.collection('notifications').add({
        type: 'shipping_update',
        subject,
        recipient: recipientEmail,
        status: 'Delivered',
        channel: 'email',
        awb: currentTracking || awb,
        courier,
        messageId,
        smtpHost: smtpSettings.host || 'simulation',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Mirror to top-level 'mail' collection (compatible with Firebase Trigger Email extension)
    try {
      await db.collection('mail').add({
        to: recipientEmail,
        message: {
          subject,
          html: htmlContent,
        },
        orderId,
        triggerType: 'shipping_update',
        awb: currentTracking || awb,
        courier,
        dispatchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch {
      // Non-critical mirror fallback
    }

    return { success: true, messageId };
  } catch (error: any) {
    console.error(`[Shipping Update] Failed to send shipping email for #${orderId}:`, error);
    return { success: false, error: error.message || 'Failed sending shipping update email' };
  }
}

// ============================================================================
// TRIGGER 1: onOrderCreated (Firestore document creation in 'orders/{orderId}')
// ============================================================================
export const onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with order creation event');
    return;
  }

  const orderData = snapshot.data();
  const orderId = event.params.orderId;

  console.log(`[onOrderCreated] New order document created: orders/${orderId}`);
  await sendOrderConfirmationEmail(orderId, orderData, snapshot.ref, {
    sourceTrigger: 'onOrderCreated',
  });
});

// ============================================================================
// TRIGGER 2: onOrderShippingUpdated
// Listens to 'orders' document status updates and triggers a 'Shipping Update'
// email to the customer using the configured SMTP settings.
// ============================================================================
export const onOrderShippingUpdated = onDocumentUpdated('orders/{orderId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  const orderId = event.params.orderId;

  if (!beforeData || !afterData) return;

  const previousStatus = String(beforeData.orderStatus || beforeData.status || '').toLowerCase();
  const currentStatus = String(afterData.orderStatus || afterData.status || '').toLowerCase();
  const previousTracking = beforeData.trackingNumber || beforeData.awb || '';
  const currentTracking = afterData.trackingNumber || afterData.awb || '';

  // Trigger conditions:
  // 1. Order status transitioned to 'shipped', 'out_for_delivery', 'in_transit', or 'delivered'
  // 2. Tracking number / AWB was assigned or modified while in shipped/in-transit state
  // 3. Resend shipping email flag was toggled
  const statusBecameShipped =
    (currentStatus === 'shipped' && previousStatus !== 'shipped') ||
    (currentStatus === 'out_for_delivery' && previousStatus !== 'out_for_delivery') ||
    (currentStatus === 'in_transit' && previousStatus !== 'in_transit') ||
    (currentStatus === 'delivered' && previousStatus !== 'delivered');

  const trackingAddedOrChanged = Boolean(
    currentTracking &&
    currentTracking !== previousTracking &&
    (currentStatus === 'shipped' ||
      currentStatus === 'in_transit' ||
      currentStatus === 'out_for_delivery' ||
      currentStatus === 'delivered')
  );

  const resendFlagToggled = Boolean(
    (afterData.requestShippingEmail && !beforeData.requestShippingEmail) ||
    (afterData.resendShippingEmail && !beforeData.resendShippingEmail) ||
    (afterData.sendShippingUpdateEmail && !beforeData.sendShippingUpdateEmail)
  );

  if (statusBecameShipped || trackingAddedOrChanged || resendFlagToggled) {
    console.log(
      `[onOrderShippingUpdated] Detected shipping update for Order #${orderId} (Status: '${previousStatus}' -> '${currentStatus}', Tracking: '${previousTracking}' -> '${currentTracking}'). Triggering Nodemailer via SMTP...`
    );

    await sendOrderShippingUpdateEmail(orderId, afterData, event.data?.after.ref, {
      force: resendFlagToggled,
      sourceTrigger: 'onOrderShippingUpdated',
    });
  }
});

// Export alias for deployment convenience
export const onOrderShippingUpdate = onOrderShippingUpdated;

// ============================================================================
// TRIGGER 3: onOrderUpdated (Firestore document updates in 'orders/{orderId}')
// Comprehensive lifecycle update listener handling both order confirmation
// and shipping updates.
// ============================================================================
export const onOrderUpdated = onDocumentUpdated('orders/{orderId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  const orderId = event.params.orderId;

  if (!beforeData || !afterData) return;

  const previousStatus = String(beforeData.orderStatus || beforeData.status || '').toLowerCase();
  const currentStatus = String(afterData.orderStatus || afterData.status || '').toLowerCase();
  const previousPaymentStatus = String(beforeData.paymentStatus || '').toLowerCase();
  const currentPaymentStatus = String(afterData.paymentStatus || '').toLowerCase();

  // --------------------------------------------------------------------------
  // 1. ORDER CONFIRMATION TRIGGER ON UPDATE
  // --------------------------------------------------------------------------
  const statusBecameConfirmed =
    (currentStatus === 'confirmed' && previousStatus !== 'confirmed') ||
    (currentStatus === 'placed' && previousStatus !== 'placed');

  const paymentBecamePaid =
    (currentPaymentStatus === 'paid' && previousPaymentStatus !== 'paid') ||
    (currentPaymentStatus === 'completed' && previousPaymentStatus !== 'completed');

  const resendFlagToggled = Boolean(
    (afterData.requestConfirmationEmail && !beforeData.requestConfirmationEmail) ||
    (afterData.resendConfirmationEmail && !beforeData.resendConfirmationEmail) ||
    (afterData.sendConfirmationEmail && !beforeData.sendConfirmationEmail)
  );

  const unconfirmedOrderNeedsEmail =
    !afterData.emailConfirmationSent &&
    currentStatus !== 'cancelled' &&
    currentStatus !== 'refunded';

  if (statusBecameConfirmed || paymentBecamePaid || resendFlagToggled || unconfirmedOrderNeedsEmail) {
    console.log(
      `[onOrderUpdated] Order #${orderId} qualifies for confirmation email trigger (Status: '${previousStatus}' -> '${currentStatus}', Payment: '${previousPaymentStatus}' -> '${currentPaymentStatus}').`
    );

    await sendOrderConfirmationEmail(orderId, afterData, event.data?.after.ref, {
      force: resendFlagToggled,
      sourceTrigger: 'onOrderUpdated_order_confirmation',
    });
  }

  // --------------------------------------------------------------------------
  // 2. SHIPPING UPDATE TRIGGER ON UPDATE
  // --------------------------------------------------------------------------
  const previousTracking = beforeData.trackingNumber || beforeData.awb || '';
  const currentTracking = afterData.trackingNumber || afterData.awb || '';
  const becameShipped =
    (currentStatus === 'shipped' && previousStatus !== 'shipped') ||
    (currentStatus === 'out_for_delivery' && previousStatus !== 'out_for_delivery');
  const trackingAdded = Boolean(
    currentTracking && currentTracking !== previousTracking && (currentStatus === 'shipped' || currentStatus === 'out_for_delivery')
  );

  if (becameShipped || trackingAdded) {
    await sendOrderShippingUpdateEmail(orderId, afterData, event.data?.after.ref, {
      sourceTrigger: 'onOrderUpdated_shipping_update',
    });
  }
});

// ============================================================================
// HTTP / CALLABLE API: sendOrderEmailManual
// Allows manual invocation or testing from the Admin Dashboard
// ============================================================================
export const apiSendOrderEmail = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const { orderId, orderData, triggerType = 'order_confirmation' } = req.body;

    if (!orderId || !orderData) {
      res.status(400).json({ error: 'Missing orderId or orderData payload.' });
      return;
    }

    const recipientEmail =
      orderData.customerEmail ||
      orderData.email ||
      orderData.shippingAddress?.email ||
      BRAND.supportEmail;

    if (triggerType === 'shipping_update') {
      const result = await sendOrderShippingUpdateEmail(orderId, orderData, undefined, {
        force: true,
        sourceTrigger: 'apiSendOrderEmail',
      });

      res.json({
        ...result,
        orderId,
        recipient: recipientEmail,
        triggerType,
      });
      return;
    }

    // Default: Order confirmation email
    const result = await sendOrderConfirmationEmail(orderId, orderData, undefined, {
      force: true,
      sourceTrigger: 'apiSendOrderEmail',
    });

    res.json({
      ...result,
      orderId,
      recipient: recipientEmail,
      triggerType,
    });
  } catch (error: any) {
    console.error('Error in apiSendOrderEmail:', error);
    res.status(500).json({ error: error.message || 'Internal error dispatching email' });
  }
});

// ============================================================================
// HTTP API: apiVerifySmtp
// Verifies SMTP connectivity and credentials
// ============================================================================
export const apiVerifySmtp = onRequest({ cors: true }, async (_req, res) => {
  const settings = getSmtpSettings();
  const transporter = createTransporter();

  try {
    if (settings.isConfigured) {
      await transporter.verify();
      res.json({
        success: true,
        status: 'connected',
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        user: settings.user,
        message: `SMTP connection established successfully to ${settings.host}`,
      });
    } else {
      res.json({
        success: true,
        status: 'simulation_ready',
        host: settings.host,
        port: settings.port,
        message: 'SMTP credentials pending configuration; simulation fallback ready.',
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: 'error',
      error: err.message || 'SMTP connection verification failed',
    });
  }
});
