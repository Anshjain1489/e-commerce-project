import { CarrierTrackingData, CarrierCheckpoint, DeliveryExecutive, ProofOfDelivery } from '../types';
import { COURIER_PARTNERS, getCourierTrackingUrl, DEFAULT_DELIVERY_EXECUTIVES } from './deliverySystem';

/**
 * Resolves courier partner info from tracking ID or carrier name
 */
export function resolveCarrierInfo(trackingId: string, courierName?: string) {
  const tid = (trackingId || '').toUpperCase().trim();
  const cName = (courierName || '').toLowerCase().trim();

  let matched = COURIER_PARTNERS.find((c) => tid.startsWith(c.prefix.toUpperCase()));

  if (!matched && cName) {
    matched = COURIER_PARTNERS.find(
      (c) =>
        cName.includes(c.id.toLowerCase()) ||
        cName.includes(c.shortName.toLowerCase()) ||
        cName.includes(c.name.toLowerCase())
    );
  }

  return matched || COURIER_PARTNERS[0]; // Defaults to Blue Dart Express
}

/**
 * Generates carrier tracking telemetry based on tracking ID, courier, and order data
 */
export function resolveCarrierStatus(params: {
  trackingId: string;
  courier?: string;
  orderId?: string;
  customerName?: string;
  orderStatus?: string;
  status?: string;
  shippingAddress?: {
    fullName?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
  deliveryExecutive?: DeliveryExecutive;
  pod?: ProofOfDelivery;
  dispatchDate?: string;
  deliveredAt?: string;
  serviceType?: string;
  estimatedDelivery?: string;
  createdAt?: string;
}): CarrierTrackingData {
  const {
    trackingId,
    courier,
    orderId = 'ORD-0',
    customerName = 'Esteemed Patron',
    shippingAddress,
    deliveryExecutive,
    pod,
    dispatchDate,
    estimatedDelivery,
    createdAt,
  } = params;

  const partner = resolveCarrierInfo(trackingId, courier);
  const rawStatus = (params.orderStatus || params.status || 'pending').toString().toLowerCase().trim();

  let statusCategory: CarrierTrackingData['statusCategory'] = 'processing';
  let statusText = 'Processing & Quality Inspection';

  if (rawStatus.includes('cancel')) {
    statusCategory = 'cancelled';
    statusText = 'Shipment Cancelled';
  } else if (rawStatus.includes('deliver') && !rawStatus.includes('out')) {
    statusCategory = 'delivered';
    statusText = 'Delivered & Verified';
  } else if (
    rawStatus.includes('out for delivery') ||
    rawStatus.includes('out_for_delivery') ||
    rawStatus.includes('outfordelivery')
  ) {
    statusCategory = 'out_for_delivery';
    statusText = 'Out for Delivery';
  } else if (rawStatus.includes('ship') || rawStatus.includes('transit') || rawStatus.includes('dispatch')) {
    statusCategory = 'shipped';
    statusText = 'In Transit';
  } else if (rawStatus.includes('confirm')) {
    statusCategory = 'confirmed';
    statusText = 'Order Confirmed';
  } else {
    statusCategory = 'processing';
    statusText = 'Tailoring & Quality Verification';
  }

  const destinationCity = shippingAddress?.city || 'Indore';
  const destinationState = shippingAddress?.state || 'MP';
  const pinCode = shippingAddress?.pinCode || '452010';

  const orderTime = createdAt ? new Date(createdAt).getTime() : Date.now() - 48 * 3600000;
  const orderDateObj = new Date(orderTime);

  const formatCheckpointTime = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const checkpoints: CarrierCheckpoint[] = [];

  // Stage 1: Order placed & Confirmed
  checkpoints.push({
    id: `cp-1-${trackingId}`,
    timestamp: formatCheckpointTime(orderDateObj),
    location: 'Majanya Ji Atelier (Indore Central)',
    status: 'Order Placed & Payment Acknowledged',
    description: `Bespoke royal garment manifest registered with ${partner.name}. Order #${orderId} verified.`,
    completed: true,
    stage: 1,
  });

  // Stage 2: Processing & Packaging
  const procTime = new Date(orderTime + 16 * 3600000);
  const isProcComplete = statusCategory !== 'confirmed' && statusCategory !== 'cancelled';
  checkpoints.push({
    id: `cp-2-${trackingId}`,
    timestamp: isProcComplete ? formatCheckpointTime(procTime) : 'In Queue',
    location: 'Atelier Quality Assurance Lab, Indore',
    status: isProcComplete ? 'Finished & Royal Dust Box Sealed' : 'Artisan Tailoring & Hand Embroidery',
    description: isProcComplete
      ? 'Garment passed 12-point craftsmanship inspection, steam-pressed, and packed with garment protector.'
      : 'Artisans executing precision zardozi embroidery and tailoring.',
    completed: isProcComplete,
    stage: 2,
  });

  // Stage 3: Shipped & In Transit
  const shipTime = dispatchDate ? new Date(dispatchDate) : new Date(orderTime + 32 * 3600000);
  const isShipComplete = ['shipped', 'out_for_delivery', 'delivered'].includes(statusCategory);
  checkpoints.push({
    id: `cp-3-${trackingId}`,
    timestamp: isShipComplete ? formatCheckpointTime(shipTime) : 'Scheduled for Carrier Handover',
    location: `${partner.name} Indore Central Sorting Facility (Air Cargo Gateway)`,
    status: isShipComplete ? `Handed Over to ${partner.shortName}` : 'Awaiting Manifest Handover',
    description: isShipComplete
      ? `Package scanned at origin hub. Waybill AWB #${trackingId} generated. Linehaul express transit active.`
      : `Courier pickup scheduled for AWB #${trackingId}.`,
    completed: isShipComplete,
    stage: 3,
  });

  // Intermediate Transit Milestone (if shipped or further)
  if (isShipComplete) {
    const transitTime = new Date(shipTime.getTime() + 18 * 3600000);
    checkpoints.push({
      id: `cp-3b-${trackingId}`,
      timestamp: formatCheckpointTime(transitTime),
      location: `${destinationCity} Apex Logistics Center`,
      status: `Arrived at Destination Hub (${destinationCity})`,
      description: `Consignment de-bagged and sorted at ${destinationCity} delivery unit. Ready for last-mile assignment.`,
      completed: ['out_for_delivery', 'delivered'].includes(statusCategory),
      stage: 3,
    });
  }

  // Stage 4: Out for Delivery
  const outTime = new Date(shipTime.getTime() + 36 * 3600000);
  const isOutComplete = ['out_for_delivery', 'delivered'].includes(statusCategory);
  const executive = deliveryExecutive || DEFAULT_DELIVERY_EXECUTIVES[0];
  checkpoints.push({
    id: `cp-4-${trackingId}`,
    timestamp: isOutComplete ? formatCheckpointTime(outTime) : 'Pending Last-Mile Dispatch',
    location: `${destinationCity} Delivery Hub (${pinCode})`,
    status: isOutComplete
      ? `Out for Doorstep Delivery with ${executive.name}`
      : 'Awaiting Doorstep Delivery Run',
    description: isOutComplete
      ? `Dispatched with associate ${executive.name} (${executive.agency || partner.name} • ${executive.vehicleNumber}). Contact: ${executive.phone}.`
      : `Scheduled for delivery to ${destinationCity} address.`,
    completed: isOutComplete,
    stage: 4,
  });

  // Stage 5: Delivered
  const deliveredTime = pod?.deliveredAt
    ? new Date(pod.deliveredAt)
    : params.deliveredAt
    ? new Date(params.deliveredAt)
    : new Date(outTime.getTime() + 4 * 3600000);
  const isDelivered = statusCategory === 'delivered';
  checkpoints.push({
    id: `cp-5-${trackingId}`,
    timestamp: isDelivered ? formatCheckpointTime(deliveredTime) : 'Target Doorstep Delivery',
    location: `${shippingAddress?.fullName || customerName}'s Address (${destinationCity}, ${destinationState})`,
    status: isDelivered ? 'Successfully Delivered' : 'Delivery Anticipated',
    description: isDelivered
      ? pod
        ? `Delivered to ${pod.receiverName} (${pod.relation}). OTP verified by delivery rider.`
        : `Handed over safely to recipient. Signed delivery receipt archived.`
      : `Expected delivery slot: 10:00 AM - 7:00 PM.`,
    completed: isDelivered,
    stage: 5,
  });

  // Determine current location string
  let currentLocation = 'Majanya Ji Indore Atelier';
  if (statusCategory === 'delivered') {
    currentLocation = `Delivered at ${destinationCity}, ${destinationState}`;
  } else if (statusCategory === 'out_for_delivery') {
    currentLocation = `En route in ${destinationCity} (${destinationCity} Central)`;
  } else if (statusCategory === 'shipped') {
    currentLocation = `${partner.shortName} Linehaul Transit (${destinationCity} Gateway)`;
  } else if (statusCategory === 'processing') {
    currentLocation = 'Indore Quality Hub (Bespoke Atelier)';
  }

  const targetDeliveryDate = estimatedDelivery || '2-3 Business Days';

  return {
    trackingId,
    trackingNumber: trackingId,
    carrier: partner.name,
    carrierCode: partner.id,
    carrierLogo: partner.themeColor,
    serviceType: partner.estimatedTransitDays,
    status: statusText,
    statusCategory,
    currentLocation,
    originCity: 'Indore, Madhya Pradesh',
    destinationCity: `${destinationCity}, ${destinationState}`,
    destinationPincode: pinCode,
    estimatedDelivery: targetDeliveryDate,
    lastUpdated: new Date().toISOString(),
    checkpoints,
    deliveryAssociate: statusCategory === 'out_for_delivery' || statusCategory === 'delivered' ? executive : undefined,
    pod: isDelivered ? pod : undefined,
    trackingUrl: getCourierTrackingUrl(partner.name, trackingId),
    isLive: true,
  };
}
