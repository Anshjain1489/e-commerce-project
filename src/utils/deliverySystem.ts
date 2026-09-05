import { Order, DeliveryExecutive, ProofOfDelivery } from '../types';
import { BRAND } from '../constants';

export interface CourierPartnerInfo {
  id: string;
  name: string;
  shortName: string;
  prefix: string;
  trackingBaseUrl: string;
  estimatedTransitDays: string;
  themeColor: string;
  textColor: string;
  codSupported: boolean;
  contactNumber: string;
  website: string;
}

export const COURIER_PARTNERS: CourierPartnerInfo[] = [
  {
    id: 'bluedart',
    name: 'Blue Dart Express',
    shortName: 'Blue Dart',
    prefix: 'BLUEDART',
    trackingBaseUrl: 'https://www.bluedart.com/tracking?trackNumber=',
    estimatedTransitDays: '1-2 Days (Priority Air)',
    themeColor: '#002B49',
    textColor: '#FFFFFF',
    codSupported: true,
    contactNumber: '1860 233 1234',
    website: 'https://www.bluedart.com',
  },
  {
    id: 'delhivery',
    name: 'Delhivery Luxury Express',
    shortName: 'Delhivery',
    prefix: 'DLV',
    trackingBaseUrl: 'https://www.delhivery.com/track/package/',
    estimatedTransitDays: '2-3 Days (Surface Express)',
    themeColor: '#E4002B',
    textColor: '#FFFFFF',
    codSupported: true,
    contactNumber: '0124 6719500',
    website: 'https://www.delhivery.com',
  },
  {
    id: 'dtdc',
    name: 'DTDC Premium Express',
    shortName: 'DTDC',
    prefix: 'DTDC',
    trackingBaseUrl: 'https://www.dtdc.in/tracking/tracking_results.asp?pin=',
    estimatedTransitDays: '2-4 Days',
    themeColor: '#1A365D',
    textColor: '#FFFFFF',
    codSupported: true,
    contactNumber: '080 2536 5032',
    website: 'https://www.dtdc.in',
  },
  {
    id: 'shiprocket',
    name: 'Shiprocket Multi-Courier',
    shortName: 'Shiprocket',
    prefix: 'SRKT',
    trackingBaseUrl: 'https://shiprocket.co/tracking/',
    estimatedTransitDays: '2-3 Days',
    themeColor: '#7C3AED',
    textColor: '#FFFFFF',
    codSupported: true,
    contactNumber: '011 4118 7000',
    website: 'https://shiprocket.co',
  },
  {
    id: 'ekart',
    name: 'Ekart Logistics',
    shortName: 'Ekart',
    prefix: 'EKT',
    trackingBaseUrl: 'https://ekartlogistics.com/shipmenttrack/',
    estimatedTransitDays: '2-4 Days',
    themeColor: '#2563EB',
    textColor: '#FFFFFF',
    codSupported: true,
    contactNumber: '1800 208 9898',
    website: 'https://ekartlogistics.com',
  },
  {
    id: 'indiapost',
    name: 'India Post Speed Post',
    shortName: 'Speed Post',
    prefix: 'EP',
    trackingBaseUrl: 'https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx?trackNumber=',
    estimatedTransitDays: '3-5 Days (Government Guaranteed)',
    themeColor: '#DC2626',
    textColor: '#FFFFFF',
    codSupported: true,
    contactNumber: '1800 266 6868',
    website: 'https://www.indiapost.gov.in',
  },
  {
    id: 'majanya_local',
    name: 'Majanya Ji Local Express (Indore Dedicated)',
    shortName: 'Majanya Local',
    prefix: 'MJN-IND',
    trackingBaseUrl: '',
    estimatedTransitDays: 'Same Day / Next Day (Direct Atelier Dispatch)',
    themeColor: '#5A1A1A',
    textColor: '#FAF7F2',
    codSupported: true,
    contactNumber: '+91 7067299101',
    website: 'https://majanyaji.com',
  },
];

export const DEFAULT_DELIVERY_EXECUTIVES: DeliveryExecutive[] = [
  {
    id: 'exec-1',
    name: 'Rahul Sharma',
    phone: '+91 98261 44520',
    vehicleNumber: 'MP-09-EA-4129 (Honda Activa)',
    agency: 'Majanya Ji Fleet (Central Indore)',
    activeOrdersCount: 3,
  },
  {
    id: 'exec-2',
    name: 'Vikram Patel',
    phone: '+91 97555 81234',
    vehicleNumber: 'MP-09-BY-8832 (Bajaj Pulsar)',
    agency: 'Majanya Ji Fleet (Vijay Nagar Hub)',
    activeOrdersCount: 2,
  },
  {
    id: 'exec-3',
    name: 'Amit Solanki',
    phone: '+91 98930 19283',
    vehicleNumber: 'MP-09-ZX-1044 (TVS Jupiter)',
    agency: 'Majanya Ji Fleet (Palhar Nagar / 60 Ft)',
    activeOrdersCount: 1,
  },
];

export const ORIGIN_HUBS = [
  'Majanya Ji Flagship Atelier (323, Palhar Nagar, 60 Feet Road, Indore - 452006)',
  'Majanya Central Dispatch Facility (Scheme No. 54, Vijay Nagar, Indore - 452010)',
  'Majanya Airport Cargo Sorting Gate (Indore Aerodrome Hub - 452005)',
];

/**
 * Generate standard AWB tracking number
 */
export function generateAwb(courierId: string, orderId: string): string {
  const courier = COURIER_PARTNERS.find((c) => c.id === courierId) || COURIER_PARTNERS[0];
  const digits = (orderId || '').replace(/\D/g, '') || Math.floor(10000 + Math.random() * 90000).toString();
  const randomSuffix = Math.floor(100 + Math.random() * 899).toString();
  return `${courier.prefix}-${digits}${randomSuffix}IN`;
}

/**
 * Generate direct URL to courier's live tracking web portal
 */
export function getCourierTrackingUrl(courierNameOrId?: string, trackingNumber?: string): string {
  if (!trackingNumber) return '';
  const searchKey = (courierNameOrId || '').toLowerCase();
  const partner = COURIER_PARTNERS.find(
    (c) =>
      searchKey.includes(c.id.toLowerCase()) ||
      searchKey.includes(c.shortName.toLowerCase()) ||
      searchKey.includes(c.name.toLowerCase())
  );

  if (partner && partner.trackingBaseUrl) {
    return `${partner.trackingBaseUrl}${encodeURIComponent(trackingNumber)}`;
  }
  // Default to Google Courier search or Blue Dart
  return `https://www.google.com/search?q=${encodeURIComponent(`${courierNameOrId || 'courier'} tracking ${trackingNumber}`)}`;
}

/**
 * Pincode Serviceability Intelligence for Indian addresses
 */
export interface PincodeServiceabilityResult {
  pincode: string;
  serviceable: boolean;
  zone: 'Local Indore' | 'Madhya Pradesh Central' | 'Metro Hub' | 'Tier 1 & 2' | 'Special / Pan India';
  estimatedTransitDays: number;
  deliveryRange: string;
  codAvailable: boolean;
  expressAvailable: boolean;
  recommendedCourier: string;
  destinationHub: string;
  notes: string;
}

export function checkPincodeServiceability(pincode: string): PincodeServiceabilityResult {
  const cleanPin = (pincode || '').trim().replace(/\D/g, '');

  if (cleanPin.length !== 6) {
    return {
      pincode: cleanPin,
      serviceable: false,
      zone: 'Special / Pan India',
      estimatedTransitDays: 5,
      deliveryRange: '4-6 Business Days',
      codAvailable: false,
      expressAvailable: false,
      recommendedCourier: 'India Post Speed Post',
      destinationHub: 'Unverified Hub',
      notes: 'Pincode must be a 6-digit Indian postal code.',
    };
  }

  // Local Indore: Starts with 452
  if (cleanPin.startsWith('452')) {
    return {
      pincode: cleanPin,
      serviceable: true,
      zone: 'Local Indore',
      estimatedTransitDays: 1,
      deliveryRange: 'Same-Day or 24 Hours',
      codAvailable: true,
      expressAvailable: true,
      recommendedCourier: 'Majanya Ji Local Express (Indore Dedicated)',
      destinationHub: 'Indore Central Delivery Hub',
      notes: 'Direct Atelier Dispatch: Hand-delivered in protective garment cover with try-on assistance available.',
    };
  }

  // Madhya Pradesh / Ujjain / Bhopal: Starts with 450 - 489
  const prefix2 = parseInt(cleanPin.slice(0, 2), 10);
  if (prefix2 >= 45 && prefix2 <= 48) {
    return {
      pincode: cleanPin,
      serviceable: true,
      zone: 'Madhya Pradesh Central',
      estimatedTransitDays: 2,
      deliveryRange: '1-2 Business Days',
      codAvailable: true,
      expressAvailable: true,
      recommendedCourier: 'Blue Dart Express',
      destinationHub: 'Bhopal / Ujjain Transit Sorting Center',
      notes: 'Fast state connectivity via daily express surface & air network.',
    };
  }

  // Major Metros: Delhi (11), Mumbai (40), Kolkata (70), Chennai (60), Bengaluru (56), Hyderabad (50), Ahmedabad (38)
  const metroPrefixes = [11, 40, 70, 60, 56, 50, 38];
  if (metroPrefixes.includes(prefix2)) {
    return {
      pincode: cleanPin,
      serviceable: true,
      zone: 'Metro Hub',
      estimatedTransitDays: 2,
      deliveryRange: '2-3 Business Days',
      codAvailable: true,
      expressAvailable: true,
      recommendedCourier: 'Blue Dart Express (Air Cargo)',
      destinationHub: 'Metro Regional Airport Gateway',
      notes: 'Direct air-cargo connectivity with priority morning out-for-delivery slot.',
    };
  }

  // Standard Pan-India Tier 1/2
  return {
    pincode: cleanPin,
    serviceable: true,
    zone: 'Tier 1 & 2',
    estimatedTransitDays: 3,
    deliveryRange: '3-4 Business Days',
    codAvailable: true,
    expressAvailable: false,
    recommendedCourier: 'Delhivery Luxury Express',
    destinationHub: 'State Capital Apex Hub',
    notes: 'Covered under guaranteed door-to-door insurance with OTP delivery verification.',
  };
}

/**
 * Generate customer WhatsApp direct delivery update message
 */
export function generateCustomerWhatsAppDeliveryMsg(
  order: Order,
  type: 'dispatched' | 'out_for_delivery' | 'delivered'
): string {
  const customerName = order.customerName || 'Esteemed Patron';
  const orderId = order.orderId || order.id || 'ORDER';
  const courier = order.courier || 'Blue Dart Express';
  const trackingNumber = order.trackingNumber || 'Tracking Pending';
  const city = order.shippingAddress?.city || 'Your city';

  if (type === 'dispatched') {
    return `Namaste ${customerName} Ji! 🙏
Exciting news! Your bespoke Majanya Ji order #${orderId} has been carefully steam-pressed, quality checked, and DISPATCHED via ${courier}.

📦 AWB Tracking Number: ${trackingNumber}
📍 Destination: ${city}
🗓️ Estimated Delivery: ${order.estimatedDelivery || '2-3 Business Days'}

Track your royal ensemble live on our website or reply here for any assistance!
Warm regards,
Siddhant Jain | Majanya Ji Men's Ethnic Wear`;
  }

  if (type === 'out_for_delivery') {
    const executive = order.deliveryExecutive?.name
      ? `Delivery Associate: ${order.deliveryExecutive.name} (${order.deliveryExecutive.phone})`
      : `Courier: ${courier}`;

    return `Namaste ${customerName} Ji! 🚚
Your Majanya Ji order #${orderId} is OUT FOR DELIVERY today!

${executive}
📦 AWB: ${trackingNumber}
💵 Payment Method: ${order.paymentMethod || 'Prepaid'} ${
      order.paymentStatus === 'Cash on Delivery' || order.paymentMethod === 'Cash on Delivery'
        ? `(Please keep ₹${(order.totalAmount || order.total || 0).toLocaleString('en-IN')} ready)`
        : '(Already Paid ✅)'
    }

Please ensure someone is available to receive your luxury ethnic attire.
Thank you for choosing Majanya Ji!`;
  }

  return `Namaste ${customerName} Ji! ✨
Your Majanya Ji order #${orderId} has been DELIVERED successfully!

We hope you cherish your royal handcrafted ensemble as much as our master artisans enjoyed tailoring it for you. 
If you need any complimentary alterations or festive styling advice, master tailor Siddhant Jain is always at your service.

Have an unforgettable celebration! 🎉
Team Majanya Ji Men's Ethnic Wear`;
}
