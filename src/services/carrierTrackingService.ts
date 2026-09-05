import { CarrierTrackingData, Order } from '../types';
import { resolveCarrierStatus } from '../utils/carrierTrackingResolver';

const CACHE_TTL_MS = 60 * 1000; // 1 minute live cache
const trackingCache: Map<string, { data: CarrierTrackingData; timestamp: number }> = new Map();

/**
 * Fetches real-time shipping carrier status for a given tracking ID (AWB)
 */
export async function fetchCarrierStatus(
  trackingId: string,
  order?: Partial<Order>,
  forceRefresh: boolean = false
): Promise<CarrierTrackingData> {
  const cleanId = (trackingId || '').trim();
  if (!cleanId) {
    throw new Error('Valid Tracking ID is required');
  }

  // Check in-memory cache unless forceRefresh
  const cached = trackingCache.get(cleanId);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams();
    if (order?.courier) params.set('courier', order.courier);
    if (order?.orderId || order?.id) params.set('orderId', (order.orderId || order.id)!);
    if (order?.customerName) params.set('customerName', order.customerName);
    if (order?.orderStatus) params.set('orderStatus', order.orderStatus);
    if (order?.status) params.set('status', String(order.status));
    if (order?.shippingAddress?.city) params.set('city', order.shippingAddress.city);
    if (order?.shippingAddress?.state) params.set('state', order.shippingAddress.state);
    if (order?.shippingAddress?.pinCode) params.set('pinCode', order.shippingAddress.pinCode);
    if (order?.estimatedDelivery) params.set('estimatedDelivery', order.estimatedDelivery);
    if (order?.dispatchDate) params.set('dispatchDate', order.dispatchDate);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/tracking/${encodeURIComponent(cleanId)}${queryStr}`);

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const result: CarrierTrackingData = {
          trackingId: data.trackingId,
          trackingNumber: data.trackingId,
          carrier: data.carrier,
          carrierCode: data.carrierCode,
          serviceType: data.serviceType || 'Air Express Cargo Priority',
          status: data.status,
          statusCategory: data.statusCategory,
          currentLocation: data.currentLocation,
          originCity: data.originCity,
          destinationCity: data.destinationCity,
          estimatedDelivery: data.estimatedDelivery,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          checkpoints: data.checkpoints || [],
          deliveryAssociate: data.deliveryAssociate,
          pod: data.pod,
          trackingUrl: data.trackingUrl,
          isLive: true,
        };

        trackingCache.set(cleanId, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  } catch (err) {
    console.warn(`[CarrierTracking] Failed to fetch live tracking via API for ${cleanId}, using client resolver:`, err);
  }

  // Graceful client-side fallback
  const fallback = resolveCarrierStatus({
    trackingId: cleanId,
    courier: order?.courier,
    orderId: order?.orderId || order?.id,
    customerName: order?.customerName,
    orderStatus: order?.orderStatus,
    status: order?.status,
    shippingAddress: order?.shippingAddress,
    deliveryExecutive: order?.deliveryExecutive,
    pod: order?.pod,
    dispatchDate: order?.dispatchDate,
    estimatedDelivery: order?.estimatedDelivery,
    createdAt: order?.createdAt,
  });

  trackingCache.set(cleanId, { data: fallback, timestamp: Date.now() });
  return fallback;
}

/**
 * Batch fetches shipping carrier statuses for multiple orders
 */
export async function batchFetchCarrierStatuses(
  orders: Order[],
  forceRefresh: boolean = false
): Promise<Record<string, CarrierTrackingData>> {
  const validOrders = orders.filter((o) => o.trackingId || o.trackingNumber);
  const results: Record<string, CarrierTrackingData> = {};

  const ordersToQuery: Order[] = [];

  for (const ord of validOrders) {
    const tid = (ord.trackingId || ord.trackingNumber)!.trim();
    const cached = trackingCache.get(tid);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      results[tid] = cached.data;
    } else {
      ordersToQuery.push(ord);
    }
  }

  if (ordersToQuery.length === 0) {
    return results;
  }

  try {
    const response = await fetch('/api/tracking/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orders: ordersToQuery.map((o) => ({
          trackingId: o.trackingId || o.trackingNumber,
          courier: o.courier,
          orderId: o.orderId || o.id,
          customerName: o.customerName,
          orderStatus: o.orderStatus,
          status: o.status,
          shippingAddress: o.shippingAddress,
          deliveryExecutive: o.deliveryExecutive,
          pod: o.pod,
          dispatchDate: o.dispatchDate,
          estimatedDelivery: o.estimatedDelivery,
          createdAt: o.createdAt,
        })),
      }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.trackingData) {
        Object.entries(json.trackingData).forEach(([tid, val]) => {
          const item = val as CarrierTrackingData;
          results[tid] = item;
          trackingCache.set(tid, { data: item, timestamp: Date.now() });
        });
        return results;
      }
    }
  } catch (err) {
    console.warn('[CarrierTracking] Batch fetch API error, resolving locally:', err);
  }

  // Fallback for remaining items
  for (const ord of ordersToQuery) {
    const tid = (ord.trackingId || ord.trackingNumber)!.trim();
    const resolved = resolveCarrierStatus({
      trackingId: tid,
      courier: ord.courier,
      orderId: ord.orderId || ord.id,
      customerName: ord.customerName,
      orderStatus: ord.orderStatus,
      status: ord.status,
      shippingAddress: ord.shippingAddress,
      deliveryExecutive: ord.deliveryExecutive,
      pod: ord.pod,
      dispatchDate: ord.dispatchDate,
      estimatedDelivery: ord.estimatedDelivery,
      createdAt: ord.createdAt,
    });
    results[tid] = resolved;
    trackingCache.set(tid, { data: resolved, timestamp: Date.now() });
  }

  return results;
}
