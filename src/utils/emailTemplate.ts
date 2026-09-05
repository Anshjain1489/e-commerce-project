import { Order } from '../types';
import { BRAND } from '../constants';

export interface OrderEmailOptions {
  includeWebLink?: boolean;
  appUrl?: string;
  notes?: string;
}

/**
 * Escapes HTML special characters to prevent injection
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates a clean, client-compatible, responsive HTML email template
 * for Majanya Ji Men's Ethnic Wear order confirmation receipts.
 */
export function generateOrderReceiptHtml(
  order: Order,
  options: OrderEmailOptions = {}
): string {
  const orderRef = order.id || (order as any).orderId || 'ORD-0';
  const customerName =
    order.shippingAddress?.fullName ||
    order.customerName ||
    'Valued Patron';
  const customerEmail =
    order.customerEmail ||
    order.email ||
    order.shippingAddress?.email ||
    'customer@example.com';
  const customerPhone =
    order.customerPhone ||
    order.phone ||
    order.shippingAddress?.phone ||
    '+91';

  const orderDate = order.createdAt
    ? new Date(order.createdAt)
    : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const estimatedDeliveryDate = new Date(orderDate.getTime() + 4 * 86400000);
  const formattedDelivery = estimatedDeliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const items: any[] = order.items || (order as any).products || [];
  const subtotal = order.subtotal ?? (order as any).subtotalAmount ?? 0;
  const shipping = order.shippingCharge ?? order.shipping ?? 0;
  const discount = order.discount ?? 0;
  const grandTotal =
    order.total ?? (order as any).totalAmount ?? subtotal - discount + shipping;

  const paymentMethodLabel =
    order.paymentMethod === 'razorpay' ||
    order.paymentMethod === 'Online (Razorpay)'
      ? 'Paid Online (Razorpay Secure)'
      : 'Cash on Delivery (Pay upon arrival)';

  const paymentStatusLabel =
    order.paymentStatus === 'Paid' ||
    order.paymentMethod === 'razorpay' ||
    order.paymentMethod === 'Online (Razorpay)'
      ? 'Payment Confirmed'
      : 'Cash to be Collected';

  const rawStatus = (order.status || (order as any).orderStatus || 'Confirmed')
    .toString()
    .toUpperCase();

  const numericCode = orderRef.replace(/\D/g, '') || '92841';
  const trackingNumber = order.trackingNumber || `BLUEDART-${numericCode}IN`;

  const address = order.shippingAddress || {
    fullName: customerName,
    address: 'Atelier Pick-up',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pinCode: '452006',
    phone: customerPhone,
    email: customerEmail,
  };

  const fullStreetAddress = [
    (address as any).addressLine1,
    (address as any).addressLine2,
    (address as any).address,
    (address as any).street,
  ]
    .filter(Boolean)
    .join(', ');

  const whatsappInquiryUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
    `Hello Siddhant Ji, I have received the email receipt for Order #${orderRef}. Please share any tailoring updates.`
  )}`;

  // Generate Items Rows HTML
  const itemsHtml = items
    .map((item: any) => {
      const prod = item.product || item;
      const itemName = escapeHtml(
        prod?.name || item.productName || "Handcrafted Men's Ethnic Wear"
      );
      const itemSize = escapeHtml(item.size || item.selectedSize || 'L');
      const itemColor = escapeHtml(
        typeof item.color === 'object'
          ? item.color?.name
          : item.color || 'Royal Classic'
      );
      const qty = item.quantity || 1;
      const price = prod?.price || item.price || 0;
      const lineTotal = price * qty;
      const imageUrl =
        prod?.images?.[0] ||
        item.productImage ||
        'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=300';

      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #F0ECE4;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="72" valign="top" style="padding-right: 14px;">
                  <img src="${imageUrl}" alt="${itemName}" width="68" height="85" style="display: block; width: 68px; height: 85px; object-fit: cover; border-radius: 8px; border: 1px solid #E8E2D6;" />
                </td>
                <td valign="top" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1E1E1E; line-height: 1.3;">${itemName}</p>
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #666666;">
                    Size: <strong style="color: #5A1A1A;">${itemSize}</strong> &nbsp;|&nbsp; Shade: <strong style="color: #1E1E1E;">${itemColor}</strong>
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #888888;">
                    Qty: <strong style="color: #1E1E1E;">${qty}</strong> &times; &#8377;${price.toLocaleString('en-IN')}
                  </p>
                </td>
                <td width="90" valign="top" align="right" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #5A1A1A;">&#8377;${lineTotal.toLocaleString('en-IN')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Order Confirmation Receipt #${orderRef} - ${BRAND.name}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid-column { width: 100% !important; display: block !important; padding-right: 0 !important; padding-bottom: 16px !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #FAF7F2;">
  <center style="width: 100%; background-color: #FAF7F2;">
    <!-- Container Card -->
    <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EADBCE; box-shadow: 0 4px 18px rgba(90, 26, 26, 0.06);">
      
      <!-- ================= HEADER SECTION ================= -->
      <tr>
        <td style="background-color: #5A1A1A; border-top: 5px solid #C9A227; padding: 32px 28px 26px 28px; text-align: center;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <!-- Royal Monogram / Brand Title -->
                <p style="margin: 0 0 4px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; color: #FAF7F2; letter-spacing: 0.18em; text-transform: uppercase;">
                  ${BRAND.name}
                </p>
                <p style="margin: 0 0 10px 0; font-size: 10px; font-weight: 600; color: #C9A227; letter-spacing: 0.28em; text-transform: uppercase;">
                  ${BRAND.subtitle} &bull; INDORE ATELIER
                </p>
                <div style="width: 50px; height: 1px; background-color: #C9A227; margin: 0 auto 12px auto;"></div>
                <p style="margin: 0; font-size: 11px; color: #E8D7C8; letter-spacing: 0.05em; font-style: italic;">
                  &ldquo;Celebrate Every Tradition in Style&rdquo;
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ================= ORDER CONFIRMATION BANNER ================= -->
      <tr>
        <td class="mobile-padding" style="padding: 28px 36px 20px 36px; background-color: #FFFFFF; text-align: center; border-bottom: 1px solid #F0ECE4;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background-color: #EBF7EE; border: 1.5px solid #28A745; text-align: center; margin-bottom: 14px; font-size: 20px; color: #28A745;">
                  &#10003;
                </div>
                <h1 style="margin: 0 0 6px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; color: #1E1E1E;">
                  Order Confirmed &amp; Receipt
                </h1>
                <p style="margin: 0; font-size: 13px; color: #555555; line-height: 1.5;">
                  Namaste, <strong>${escapeHtml(customerName)}</strong>! We have received your order. Our master tailors at the Indore atelier have initiated the hand-crafting and quality check for your bespoke ethnic wear.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ================= ORDER METADATA BADGE BAR ================= -->
      <tr>
        <td class="mobile-padding" style="padding: 16px 36px; background-color: #FAF7F2; border-bottom: 1px solid #EADBCE;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="fluid-column" width="50%" valign="top" style="font-size: 12px; color: #666666;">
                <p style="margin: 0 0 3px 0; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #8C7B6B;">Order Reference</p>
                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; font-family: Courier, monospace; color: #5A1A1A;">#${escapeHtml(orderRef)}</p>

                <p style="margin: 0 0 3px 0; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #8C7B6B;">Order Date &amp; Time</p>
                <p style="margin: 0; font-size: 12px; font-weight: 600; color: #1E1E1E;">${formattedDate} &bull; ${formattedTime}</p>
              </td>
              <td class="fluid-column" width="50%" valign="top" style="font-size: 12px; color: #666666;">
                <p style="margin: 0 0 3px 0; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #8C7B6B;">Payment Method</p>
                <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #1E1E1E;">
                  ${escapeHtml(paymentMethodLabel)}
                </p>

                <p style="margin: 0 0 3px 0; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #8C7B6B;">Est. Delivery Target</p>
                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #28A745;">${formattedDelivery}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ================= ITEMS SUMMARY TABLE ================= -->
      <tr>
        <td class="mobile-padding" style="padding: 24px 36px 12px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-bottom: 12px; border-bottom: 2px solid #5A1A1A;">
                <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #5A1A1A;">
                  Garment Summary (${items.length} ${items.length === 1 ? 'Item' : 'Items'})
                </span>
              </td>
              <td align="right" style="padding-bottom: 12px; border-bottom: 2px solid #5A1A1A;">
                <span style="font-size: 11px; font-weight: 600; color: #888888; text-transform: uppercase;">Amount</span>
              </td>
            </tr>

            <!-- Line Items -->
            ${itemsHtml}

          </table>
        </td>
      </tr>

      <!-- ================= PRICE BREAKDOWN SECTION ================= -->
      <tr>
        <td class="mobile-padding" style="padding: 10px 36px 24px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF7F2; border-radius: 10px; padding: 16px 20px; border: 1px solid #EADBCE;">
            <tr>
              <td style="font-size: 13px; color: #666666; padding-bottom: 6px;">Garment Subtotal</td>
              <td align="right" style="font-size: 13px; font-weight: 600; color: #1E1E1E; padding-bottom: 6px;">&#8377;${subtotal.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #666666; padding-bottom: 6px;">Express Nationwide Shipping &amp; Royal Packing</td>
              <td align="right" style="font-size: 13px; font-weight: 600; color: #28A745; padding-bottom: 6px;">
                ${shipping === 0 ? 'FREE' : `&#8377;${shipping.toLocaleString('en-IN')}`}
              </td>
            </tr>
            ${
              discount > 0
                ? `
            <tr>
              <td style="font-size: 13px; color: #C9A227; padding-bottom: 6px;">Artisan Festivity Savings ${order.couponCode ? `(${escapeHtml(order.couponCode)})` : ''}</td>
              <td align="right" style="font-size: 13px; font-weight: 600; color: #C9A227; padding-bottom: 6px;">-&#8377;${discount.toLocaleString('en-IN')}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding-top: 10px; border-top: 1px solid #D6C9BC; font-size: 15px; font-weight: 700; color: #5A1A1A;">
                Total Amount Paid
              </td>
              <td align="right" style="padding-top: 10px; border-top: 1px solid #D6C9BC; font-size: 18px; font-weight: 700; color: #5A1A1A;">
                &#8377;${grandTotal.toLocaleString('en-IN')}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 6px; font-size: 10px; color: #888888; text-align: right;">
                (All taxes, hand-finishing, and luxury dust bag packaging included)
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ================= SHIPPING & COURIER DETAILS ================= -->
      <tr>
        <td class="mobile-padding" style="padding: 12px 36px 24px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #F0ECE4; border-radius: 12px; overflow: hidden;">
            <tr>
              <td class="fluid-column" width="50%" valign="top" style="padding: 18px; background-color: #FFFFFF; border-right: 1px solid #F0ECE4;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #5A1A1A; text-transform: uppercase; letter-spacing: 0.1em;">
                  Delivery Address
                </p>
                <p style="margin: 0 0 2px 0; font-size: 13px; font-weight: 700; color: #1E1E1E;">${escapeHtml(address.fullName)}</p>
                <p style="margin: 0 0 2px 0; font-size: 12px; color: #555555; line-height: 1.4;">
                  ${escapeHtml(fullStreetAddress || address.address || 'Address provided at checkout')}
                </p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #555555;">
                  ${escapeHtml(address.city)}, ${escapeHtml(address.state)} - ${escapeHtml(address.pinCode)}
                </p>
                <p style="margin: 0; font-size: 11px; color: #777777;">
                  Contact Phone: <strong style="color: #1E1E1E;">${escapeHtml(address.phone || customerPhone)}</strong>
                </p>
              </td>
              <td class="fluid-column" width="50%" valign="top" style="padding: 18px; background-color: #FAF7F2;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #5A1A1A; text-transform: uppercase; letter-spacing: 0.1em;">
                  Courier &amp; Tracking
                </p>
                <p style="margin: 0 0 3px 0; font-size: 13px; font-weight: 600; color: #1E1E1E;">Blue Dart Express Air</p>
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #666666;">
                  AWB Number: <span style="font-family: Courier, monospace; font-weight: 700; color: #5A1A1A;">${escapeHtml(trackingNumber)}</span>
                </p>
                <p style="margin: 0; font-size: 11px; color: #555555; line-height: 1.4;">
                  Direct tracking will be activated once the parcel is scanned out from the Indore dispatch terminal.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ================= ARTISAN PROMISE & WHATSAPP SUPPORT ================= -->
      <tr>
        <td class="mobile-padding" style="padding: 0 36px 28px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FCFBF9; border: 1px dashed #C9A227; border-radius: 12px; padding: 18px 20px;">
            <tr>
              <td>
                <p style="margin: 0 0 6px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: #5A1A1A;">
                  A Note from Master Craftsman Siddhant Jain
                </p>
                <p style="margin: 0 0 14px 0; font-size: 12px; color: #555555; line-height: 1.6; font-style: italic;">
                  &ldquo;Each garment is handcrafted with strict attention to zari tension, seam allowance, and steam finishing. Should you require any sleeve alteration, festive event styling, or urgent dispatch assistance, I am directly available on WhatsApp.&rdquo;
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-radius: 6px; background-color: #25D366; text-align: center;">
                      <a href="${whatsappInquiryUrl}" target="_blank" style="background: #25D366; border: 1px solid #20BA59; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 12px; font-weight: 700; text-decoration: none; padding: 10px 18px; color: #FFFFFF; border-radius: 6px; display: inline-block;">
                        Connect on WhatsApp (+91 70074 57920) &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ================= ATELIER FOOTER ================= -->
      <tr>
        <td style="background-color: #1E1E1E; padding: 28px 36px; text-align: center; color: #A8A8A8; font-size: 11px; line-height: 1.6;">
          <p style="margin: 0 0 6px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: #FAF7F2; letter-spacing: 0.12em; text-transform: uppercase;">
            ${BRAND.fullName}
          </p>
          <p style="margin: 0 0 12px 0; font-size: 11px; color: #C9A227;">
            Indore Atelier: ${BRAND.address.full}
          </p>
          <p style="margin: 0 0 12px 0; color: #888888;">
            Customer Care: <a href="${BRAND.phoneLink}" style="color: #FAF7F2; text-decoration: none;">${BRAND.phone}</a> &bull; Email: <a href="mailto:${BRAND.supportEmail}" style="color: #FAF7F2; text-decoration: none;">${BRAND.supportEmail}</a>
          </p>
          <div style="width: 40px; height: 1px; background-color: #333333; margin: 12px auto;"></div>
          <p style="margin: 0 0 6px 0; color: #777777; font-size: 10px;">
            7-Day Complimentary Exchange Guarantee for sizing and alterations. Please keep luxury tags intact.
          </p>
          <p style="margin: 0; color: #555555; font-size: 10px;">
            &copy; 2026 ${BRAND.name}. All rights reserved. Handcrafted exclusively in Madhya Pradesh, India.
          </p>
        </td>
      </tr>

    </table>
    <!-- End Container Card -->

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 16px auto 0 auto; max-width: 600px;">
      <tr>
        <td align="center" style="font-size: 10px; color: #999999; line-height: 1.4;">
          This official confirmation receipt was generated for ${escapeHtml(customerEmail)} upon completing order #${escapeHtml(orderRef)}.
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}
