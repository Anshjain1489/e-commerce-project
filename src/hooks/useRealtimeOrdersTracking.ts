import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order, CarrierTrackingData } from '../types';
import { useShop } from '../context/ShopContext';
import { batchFetchCarrierStatuses, fetchCarrierStatus } from '../services/carrierTrackingService';

export interface UseRealtimeOrdersTrackingReturn {
  liveOrders: Order[];
  carrierStatuses: Record<string, CarrierTrackingData>;
  isLiveConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  refreshCarrierStatus: (trackingId: string, order?: Order) => Promise<CarrierTrackingData | null>;
  refreshAll: () => Promise<void>;
  lookupTrackingAwb: (trackingId: string) => Promise<CarrierTrackingData | null>;
  activeAwbLookup: CarrierTrackingData | null;
  setActiveAwbLookup: (data: CarrierTrackingData | null) => void;
  isLookupLoading: boolean;
}

export function useRealtimeOrdersTracking(): UseRealtimeOrdersTrackingReturn {
  const { orders: contextOrders } = useShop();

  const [liveOrders, setLiveOrders] = useState<Order[]>(() => contextOrders || []);
  const [carrierStatuses, setCarrierStatuses] = useState<Record<string, CarrierTrackingData>>({});
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [activeAwbLookup, setActiveAwbLookup] = useState<CarrierTrackingData | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState<boolean>(false);

  const hasSeededRef = useRef<boolean>(false);

  // 1. Listen to Firestore 'orders' collection in real time
  useEffect(() => {
    if (!db) {
      console.info('[OrderTracking] Firestore not configured. Operating in local live mode.');
      setLiveOrders(contextOrders);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      const ordersCol = collection(db, 'orders');

      unsubscribe = onSnapshot(
        ordersCol,
        (snapshot: QuerySnapshot<DocumentData>) => {
          setIsLiveConnected(true);
          const firestoreOrders: Order[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const orderId = docSnap.id || data.orderId || data.id;

            // Normalize fields ensuring trackingId and trackingNumber exist
            const trackingId = data.trackingId || data.trackingNumber || `BLUEDART-${orderId.replace(/\D/g, '') || '58402'}IN`;
            const trackingNumber = data.trackingNumber || trackingId;

            firestoreOrders.push({
              ...data,
              id: orderId,
              orderId,
              trackingId,
              trackingNumber,
              orderStatus: data.orderStatus || data.status || 'Confirmed',
              status: (data.status || data.orderStatus || 'confirmed').toString().toLowerCase(),
            } as Order);
          });

          if (firestoreOrders.length > 0) {
            // Sort newest first
            firestoreOrders.sort((a, b) => {
              const timeA = new Date(a.createdAt || 0).getTime();
              const timeB = new Date(b.createdAt || 0).getTime();
              return timeB - timeA;
            });

            // Merge with local orders so user doesn't lose locally generated or mock demo orders
            const orderMap = new Map<string, Order>();
            firestoreOrders.forEach((o) => {
              const key = (o.orderId || o.id)!.toLowerCase();
              orderMap.set(key, o);
            });

            contextOrders.forEach((co) => {
              const key = (co.orderId || co.id || '').toLowerCase();
              if (!orderMap.has(key)) {
                orderMap.set(key, co);
              }
            });

            const merged = Array.from(orderMap.values()).sort((a, b) => {
              const timeA = new Date(a.createdAt || 0).getTime();
              const timeB = new Date(b.createdAt || 0).getTime();
              return timeB - timeA;
            });

            setLiveOrders(merged);
          } else {
            // Firestore collection is empty, use context orders and seed them to Firestore
            setLiveOrders(contextOrders);

            if (!hasSeededRef.current && contextOrders.length > 0) {
              hasSeededRef.current = true;
              contextOrders.forEach((co) => {
                const docId = co.orderId || co.id || `ORD-${Date.now()}`;
                const trackingId = co.trackingId || co.trackingNumber || `BLUEDART-${docId.replace(/\D/g, '') || '84920'}IN`;
                try {
                  setDoc(
                    doc(db, 'orders', docId),
                    {
                      ...co,
                      trackingId,
                      trackingNumber: co.trackingNumber || trackingId,
                      seededAt: new Date().toISOString(),
                    },
                    { merge: true }
                  ).catch(() => {});
                } catch {
                  // Fallback
                }
              });
            }
          }
        },
        (error) => {
          console.warn('[OrderTracking] Firestore onSnapshot warning, falling back to local state:', error);
          setIsLiveConnected(false);
          setLiveOrders(contextOrders);
        }
      );
    } catch (err) {
      console.warn('[OrderTracking] Error initializing Firestore subscription:', err);
      setIsLiveConnected(false);
      setLiveOrders(contextOrders);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [contextOrders]);

  // 2. Fetch Carrier Statuses for all live orders whenever liveOrders changes
  useEffect(() => {
    let isCancelled = false;

    async function updateCarrierStatuses() {
      if (!liveOrders || liveOrders.length === 0) return;

      setIsSyncing(true);
      try {
        const results = await batchFetchCarrierStatuses(liveOrders, false);
        if (!isCancelled) {
          setCarrierStatuses((prev) => ({ ...prev, ...results }));
          setLastSyncedAt(new Date());
        }
      } catch (err) {
        console.error('[OrderTracking] Error batch fetching carrier statuses:', err);
      } finally {
        if (!isCancelled) {
          setIsSyncing(false);
        }
      }
    }

    updateCarrierStatuses();

    return () => {
      isCancelled = true;
    };
  }, [liveOrders]);

  // 3. Refresh carrier status for a specific tracking ID
  const refreshCarrierStatus = useCallback(
    async (trackingId: string, order?: Order): Promise<CarrierTrackingData | null> => {
      const cleanTid = (trackingId || '').trim();
      if (!cleanTid) return null;

      try {
        const targetOrder = order || liveOrders.find((o) => (o.trackingId || o.trackingNumber) === cleanTid);
        const data = await fetchCarrierStatus(cleanTid, targetOrder, true);
        setCarrierStatuses((prev) => ({ ...prev, [cleanTid]: data }));
        setLastSyncedAt(new Date());
        return data;
      } catch (err) {
        console.error(`[OrderTracking] Failed to refresh tracking for ${cleanTid}:`, err);
        return null;
      }
    },
    [liveOrders]
  );

  // 4. Global manual refresh for all active consignments
  const refreshAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      const results = await batchFetchCarrierStatuses(liveOrders, true);
      setCarrierStatuses(results);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('[OrderTracking] Failed to refresh all tracking:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [liveOrders]);

  // 5. Lookup any arbitrary tracking ID / AWB entered by user
  const lookupTrackingAwb = useCallback(
    async (trackingId: string): Promise<CarrierTrackingData | null> => {
      const cleanTid = (trackingId || '').trim();
      if (!cleanTid) return null;

      setIsLookupLoading(true);
      try {
        const matchingOrder = liveOrders.find(
          (o) =>
            (o.trackingId || o.trackingNumber || '').toLowerCase() === cleanTid.toLowerCase() ||
            (o.orderId || o.id || '').toLowerCase() === cleanTid.toLowerCase()
        );

        const data = await fetchCarrierStatus(
          matchingOrder?.trackingId || matchingOrder?.trackingNumber || cleanTid,
          matchingOrder,
          true
        );

        setActiveAwbLookup(data);
        return data;
      } catch (err) {
        console.error('[OrderTracking] Error during tracking lookup:', err);
        return null;
      } finally {
        setIsLookupLoading(false);
      }
    },
    [liveOrders]
  );

  return {
    liveOrders,
    carrierStatuses,
    isLiveConnected,
    isSyncing,
    lastSyncedAt,
    refreshCarrierStatus,
    refreshAll,
    lookupTrackingAwb,
    activeAwbLookup,
    setActiveAwbLookup,
    isLookupLoading,
  };
}
