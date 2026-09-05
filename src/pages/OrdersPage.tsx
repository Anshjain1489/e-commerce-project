import React, { useState, useMemo } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MessageCircle,
  ArrowRight,
  MapPin,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  ShoppingBag,
  ExternalLink,
  Mail,
  FileText,
  Navigation,
  RefreshCw,
  Sparkles,
  Smartphone,
  Bell,
  Star,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants';
import { Order, OrderNotification, Product } from '../types';
import { OrderTrackingTimeline } from '../components/orders/OrderTrackingTimeline';
import { OrderEmailReceiptModal } from '../components/orders/OrderEmailReceiptModal';
import { OrderNotificationModal } from '../components/orders/OrderNotificationModal';
import { WriteReviewModal } from '../components/reviews/WriteReviewModal';
import { CarrierAwbLookupModal } from '../components/orders/CarrierAwbLookupModal';
import { buildOrderStatusNotification } from '../utils/notificationSystem';
import { useRealtimeOrdersTracking } from '../hooks/useRealtimeOrdersTracking';

interface OrdersPageProps {
  onNavigate: (path: string) => void;
}

type OrderFilterType = 'all' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { orders, products, reviews, sendCustomOrderNotification } = useShop();
  const { user } = useAuth();
  const {
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
  } = useRealtimeOrdersTracking();

  const [activeFilter, setActiveFilter] = useState<OrderFilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<OrderNotification | null>(null);
  const [reviewingProduct, setReviewingProduct] = useState<{ product: Product; orderId: string } | null>(null);
  const [isSyncingGlobal, setIsSyncingGlobal] = useState<boolean>(false);
  const [isAwbModalOpen, setIsAwbModalOpen] = useState<boolean>(false);

  // If logged in, filter user orders or show all orders for admin / demo
  const userOrders = useMemo(() => {
    const safeOrders = Array.isArray(liveOrders) && liveOrders.length > 0 ? liveOrders : (Array.isArray(orders) ? orders : []);
    return user
      ? safeOrders.filter((o) => !o?.userId || o.userId === user.id || user.role === 'admin')
      : safeOrders;
  }, [liveOrders, orders, user]);

  // Compute status counts for filter badges
  const counts = useMemo(() => {
    let processing = 0;
    let shipped = 0;
    let outForDelivery = 0;
    let delivered = 0;
    let cancelled = 0;

    userOrders.forEach((o) => {
      const st = (o.status || (o as any).orderStatus || 'pending').toString().toLowerCase();
      if (st.includes('cancel')) {
        cancelled++;
      } else if (st.includes('deliver') && !st.includes('out')) {
        delivered++;
      } else if (
        st.includes('out for delivery') ||
        st.includes('out_for_delivery') ||
        st.includes('outfordelivery')
      ) {
        outForDelivery++;
      } else if (st.includes('ship') || st.includes('transit')) {
        shipped++;
      } else {
        processing++;
      }
    });

    return {
      all: userOrders.length,
      processing,
      shipped,
      out_for_delivery: outForDelivery,
      delivered,
      cancelled,
    };
  }, [userOrders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return userOrders.filter((o) => {
      const st = (o.status || (o as any).orderStatus || 'pending').toString().toLowerCase();
      const orderId = (o.id || (o as any).orderId || '').toString().toLowerCase();
      const customerName = (o.customerName || '').toLowerCase();
      const city = (o.shippingAddress?.city || '').toLowerCase();

      // Status filter
      if (activeFilter === 'processing') {
        const isProc = !st.includes('cancel') && !st.includes('deliver') && !st.includes('ship') && !st.includes('out');
        if (!isProc) return false;
      } else if (activeFilter === 'shipped') {
        const isShip = (st.includes('ship') || st.includes('transit')) && !st.includes('out');
        if (!isShip) return false;
      } else if (activeFilter === 'out_for_delivery') {
        const isOut =
          st.includes('out for delivery') ||
          st.includes('out_for_delivery') ||
          st.includes('outfordelivery');
        if (!isOut) return false;
      } else if (activeFilter === 'delivered') {
        const isDel = st.includes('deliver') && !st.includes('out');
        if (!isDel) return false;
      } else if (activeFilter === 'cancelled') {
        if (!st.includes('cancel')) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = orderId.includes(q);
        const matchesCustomer = customerName.includes(q);
        const matchesCity = city.includes(q);
        const items = o.items || (o as any).products || [];
        const matchesItem = items.some((item: any) => {
          const name = (item.product?.name || item.productName || '').toLowerCase();
          return name.includes(q);
        });

        return matchesId || matchesCustomer || matchesCity || matchesItem;
      }

      return true;
    });
  }, [userOrders, activeFilter, searchQuery]);

  const handleGlobalSync = async () => {
    setIsSyncingGlobal(true);
    await refreshAll();
    setIsSyncingGlobal(false);
  };

  const getStatusBadge = (rawStatus: string) => {
    const st = (rawStatus || 'pending').toString().toLowerCase();
    if (st.includes('cancel')) {
      return (
        <span className="bg-red-50 text-red-700 border border-red-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          Cancelled
        </span>
      );
    }
    if (st.includes('deliver') && !st.includes('out')) {
      return (
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Delivered
        </span>
      );
    }
    if (st.includes('out for delivery') || st.includes('out_for_delivery') || st.includes('outfordelivery')) {
      return (
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
          Out for Delivery
        </span>
      );
    }
    if (st.includes('ship') || st.includes('transit')) {
      return (
        <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <Truck className="w-3 h-3 text-[#C9A227]" />
          Shipped • In Transit
        </span>
      );
    }
    if (st.includes('process') || st.includes('pack')) {
      return (
        <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <Package className="w-3 h-3 text-[#C9A227]" />
          Processing & Quality Check
        </span>
      );
    }
    return (
      <span className="bg-blue-50 text-blue-800 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        Order Confirmed
      </span>
    );
  };

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-8 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                Atelier Orders & Tracking
              </span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1E1E]">
              My Orders & Dispatches
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live real-time monitoring: Processing, Shipped, Out for Delivery, and Delivered milestones
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/shop')}
              className="px-4 py-2 bg-[#5A1A1A] hover:bg-[#431313] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Explore Catalog</span>
            </button>
          </div>
        </div>

        {/* ================= REAL-TIME DISPATCH MONITOR BANNER ================= */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-[#C9A227]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 text-[#5A1A1A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-sm font-bold text-[#1E1E1E]">
                  Real-Time Carrier Radar & Tracking
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isLiveConnected
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLiveConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {isLiveConnected ? 'Firestore Real-Time Sync Active' : 'Live Carrier Gateway Active'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isSyncing
                  ? 'Fetching live carrier status and linehaul waypoints...'
                  : `Real-time carrier tracking connected to Firestore 'orders' collection • Last verified: ${
                      lastSyncedAt
                        ? lastSyncedAt.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : 'Just now'
                    }`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <button
              type="button"
              onClick={() => setIsAwbModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5A1A1A] hover:bg-[#431313] text-[#FAF7F2] text-xs font-semibold rounded-lg transition-colors shadow-xs"
              title="Track any consignment AWB"
            >
              <Search className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Track Any AWB</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                setIsSyncingGlobal(true);
                await refreshAll();
                setIsSyncingGlobal(false);
              }}
              disabled={isSyncingGlobal || isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE1] text-[#5A1A1A] border border-[#C9A227]/40 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              title="Ping Blue Dart, Delhivery, DTDC & Speed Post for status updates"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#C9A227] ${
                  isSyncingGlobal || isSyncing ? 'animate-spin' : ''
                }`}
              />
              <span>{isSyncingGlobal || isSyncing ? 'Syncing...' : 'Sync All Carriers'}</span>
            </button>
          </div>
        </div>

        {/* ================= SEARCH & STATUS FILTER TABS ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 bg-white rounded-xl border border-gray-200 shadow-xs overflow-x-auto gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-[#5A1A1A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>All Orders</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('processing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'processing'
                  ? 'bg-[#5A1A1A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>Processing</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'processing' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {counts.processing}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('shipped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'shipped'
                  ? 'bg-[#5A1A1A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>Shipped</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'shipped' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {counts.shipped}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('out_for_delivery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'out_for_delivery'
                  ? 'bg-[#5A1A1A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>Out for Delivery</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'out_for_delivery' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 font-bold'
                }`}
              >
                {counts.out_for_delivery}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'delivered'
                  ? 'bg-[#5A1A1A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <span>Delivered</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'delivered' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {counts.delivered}
              </span>
            </button>

            {counts.cancelled > 0 && (
              <button
                onClick={() => setActiveFilter('cancelled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeFilter === 'cancelled'
                    ? 'bg-[#5A1A1A] text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <span>Cancelled</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeFilter === 'cancelled' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {counts.cancelled}
                </span>
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, City..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ================= ORDER CARDS LIST ================= */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#C9A227]/30 shadow-sm max-w-md mx-auto my-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-1" />
            <h3 className="font-cinzel text-lg font-bold text-[#1E1E1E] mb-2">
              {searchQuery ? 'No Matching Orders' : 'No Orders In This Category'}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              {searchQuery
                ? `No orders matching "${searchQuery}". Clear your search or try another order reference.`
                : activeFilter !== 'all'
                ? `You have no ${activeFilter.replace(/_/g, ' ')} orders at present.`
                : "You haven't placed any orders yet. Explore our handcrafted royal collection."}
            </p>
            {searchQuery || activeFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/shop')}
                className="px-6 py-2.5 bg-[#5A1A1A] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const orderRef = order.id || (order as any).orderId || 'ORD-0';
              const rawStatus = order.status || (order as any).orderStatus || 'pending';
              const totalAmount = order.total ?? (order as any).totalAmount ?? 0;
              const items = Array.isArray(order.items)
                ? order.items
                : Array.isArray((order as any).products)
                ? (order as any).products
                : [];

              const trackingId =
                order.trackingId ||
                order.trackingNumber ||
                `BLUEDART-${orderRef.replace(/\D/g, '') || '58402'}IN`;
              const carrierData = carrierStatuses[trackingId];

              const whatsappUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
                `Hello Siddhant Ji, I am inquiring about my order #${orderRef}. Please share updates regarding dispatch and delivery.`
              )}`;

              return (
                <div
                  key={orderRef || index}
                  className="bg-white rounded-2xl p-5 sm:p-7 border border-[#C9A227]/30 shadow-xs transition-all hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Order Reference
                      </span>
                      <span className="font-mono font-bold text-sm text-[#5A1A1A]">#{orderRef}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Order Date
                      </span>
                      <span className="font-semibold text-gray-800">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Carrier & AWB
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-semibold text-gray-800">
                          {carrierData?.carrier || order.courier || 'Blue Dart'}:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            lookupTrackingAwb(trackingId);
                            setIsAwbModalOpen(true);
                          }}
                          className="font-mono text-xs text-[#5A1A1A] font-bold hover:underline flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#C9A227]/30"
                          title="Click to view live carrier route & telemetry"
                        >
                          <span>{trackingId}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-[#C9A227]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Total Amount
                      </span>
                      <span className="font-bold text-[#5A1A1A] text-sm">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">
                        Current Status
                      </span>
                      {getStatusBadge(rawStatus)}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          lookupTrackingAwb(trackingId);
                          setIsAwbModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5A1A1A] text-[#FAF7F2] hover:bg-[#431313] font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                        title="Open live carrier radar & waypoint map"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Track AWB</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const latestNotif =
                            order.notifications && order.notifications.length > 0
                              ? order.notifications[0]
                              : buildOrderStatusNotification(order, order.orderStatus || 'Confirmed');
                          setSelectedNotification(latestNotif);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] text-[#5A1A1A] border border-[#C9A227]/40 hover:bg-[#F3ECE1] font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                        title="View Automated SMS & Email Alerts"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Alerts</span>
                        {order.notifications && order.notifications.length > 0 && (
                          <span className="w-4 h-4 bg-[#5A1A1A] text-white rounded-full text-[10px] flex items-center justify-center font-mono">
                            {order.notifications.length}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] text-[#5A1A1A] border border-[#C9A227]/40 hover:bg-[#F3ECE1] font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                        title="View & Download Email Receipt"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Receipt</span>
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold rounded-lg text-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* ================= ORDER TRACKING VISUAL TRACKER ================= */}
                  <OrderTrackingTimeline
                    order={{
                      ...order,
                      trackingId,
                      trackingNumber: trackingId,
                    }}
                    carrierData={carrierData}
                    onRefreshCarrier={() => refreshCarrierStatus(trackingId, order)}
                    isRefreshingCarrier={isSyncing}
                    defaultExpanded={index === 0 && !rawStatus.toString().toLowerCase().includes('deliver')}
                  />

                  {/* Items in Order */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Purchased Garments ({items.length})
                    </h5>

                    <div className="divide-y divide-gray-50">
                      {items.map((item: any, idx: number) => {
                        const prod = item.product || item;
                        const itemImg =
                          prod?.images?.[0] ||
                          item.productImage ||
                          'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=600';
                        const itemName = prod?.name || item.productName || 'Handcrafted Ethnic Wear';
                        const itemSize = item.size || item.selectedSize || 'L';
                        const colorName =
                          typeof item.color === 'object' ? item.color?.name : item.color || 'Standard';
                        const qty = item.quantity || 1;
                        const price = prod?.price || item.price || 0;

                        // Match or construct product object for review modal
                        const matchingProd: Product = products.find(
                          (p) =>
                            p.id === (item.productId || item.id) ||
                            p.name.toLowerCase() === itemName.toLowerCase()
                        ) || {
                          id: item.productId || item.id || `kp-custom-${idx}`,
                          name: itemName,
                          slug: itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                          categoryId: 'open-jodhpuri',
                          categoryName: 'Royal Ethnic',
                          description: 'Handcrafted royal ensemble tailored in Indore.',
                          price: price || 6999,
                          originalPrice: Math.round((price || 6999) * 1.3),
                          discount: 25,
                          images: [itemImg],
                          sizes: [itemSize],
                          colors: [{ name: colorName, hex: '#5A1A1A' }],
                          fabric: 'Pure Silk',
                          stock: 12,
                          rating: 5,
                          reviewCount: 1,
                          featured: false,
                        };

                        const existingReview = reviews.find(
                          (r) =>
                            (r.productId === matchingProd.id ||
                              r.productName?.toLowerCase() === itemName.toLowerCase()) &&
                            (r.orderId === orderRef || (user && r.customerEmail === user.email))
                        );

                        return (
                          <div
                            key={item.id || idx}
                            className="py-2.5 flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200/60">
                                <img
                                  src={itemImg}
                                  alt={itemName}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 line-clamp-1">{itemName}</h4>
                                <p className="text-gray-500 text-[11px] mt-0.5">
                                  Size: <strong className="text-gray-700">{itemSize}</strong> • Shade:{' '}
                                  <strong className="text-gray-700">{colorName}</strong> • Qty: {qty}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="font-bold text-gray-800 text-right">
                                ₹{(price * qty).toLocaleString('en-IN')}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setReviewingProduct({ product: matchingProd, orderId: orderRef })
                                }
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border flex items-center gap-1 transition-all ${
                                  existingReview
                                    ? 'bg-amber-50 text-[#8B6E16] border-amber-300 hover:bg-amber-100'
                                    : 'bg-white hover:bg-[#5A1A1A] text-[#5A1A1A] hover:text-white border-[#5A1A1A]/40 shadow-2xs'
                                }`}
                                title={existingReview ? 'Update your review' : 'Rate & Review this purchased item'}
                              >
                                <Star
                                  className={`w-3 h-3 ${
                                    existingReview ? 'fill-[#C9A227] text-[#C9A227]' : 'text-[#C9A227]'
                                  }`}
                                />
                                <span>{existingReview ? `Rated ${existingReview.rating}★` : 'Review Item'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Address and Payment summary */}
                  {order.shippingAddress && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C9A227] shrink-0" />
                        <span>
                          Shipping to:{' '}
                          <strong className="text-gray-800">{order.shippingAddress.fullName}</strong> (
                          {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                          {order.shippingAddress.pinCode})
                        </span>
                      </span>
                      <span className="text-[#C9A227] font-semibold uppercase tracking-wider text-[10px]">
                        {order.paymentMethod === 'razorpay' ||
                        order.paymentMethod === 'Online (Razorpay)'
                          ? 'Paid Online'
                          : 'Cash on Delivery'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Email Receipt Modal */}
      <OrderEmailReceiptModal
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        order={selectedReceiptOrder}
      />

      {/* Automated Order Notification Alert Modal */}
      <OrderNotificationModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
        onResend={(channel) => {
          if (selectedNotification?.orderId) {
            sendCustomOrderNotification(selectedNotification.orderId, channel);
          }
        }}
      />
      {/* Write Product Review Modal */}
      {reviewingProduct && (
        <WriteReviewModal
          isOpen={!!reviewingProduct}
          onClose={() => setReviewingProduct(null)}
          product={reviewingProduct.product}
          orderId={reviewingProduct.orderId}
        />
      )}

      {/* Real-time Carrier AWB Tracking Modal */}
      <CarrierAwbLookupModal
        isOpen={isAwbModalOpen}
        onClose={() => setIsAwbModalOpen(false)}
        activeData={activeAwbLookup}
        isLoading={isLookupLoading}
        onLookup={lookupTrackingAwb}
      />
    </div>
  );
};
