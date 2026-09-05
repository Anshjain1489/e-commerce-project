import React, { useState, useMemo } from 'react';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  Printer,
  MapPin,
  User,
  Phone,
  ShieldCheck,
  AlertCircle,
  Calendar,
  DollarSign,
  Copy,
  Check,
  MessageCircle,
  RotateCcw,
  Compass,
  FileText,
  QrCode,
  Sparkles,
  X,
  ChevronRight,
  Send,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import { Order, DeliveryExecutive, ProofOfDelivery } from '../../types';
import { useToast } from '../../context/ToastContext';
import { BRAND } from '../../constants';
import {
  COURIER_PARTNERS,
  DEFAULT_DELIVERY_EXECUTIVES,
  ORIGIN_HUBS,
  generateAwb,
  getCourierTrackingUrl,
  checkPincodeServiceability,
  generateCustomerWhatsAppDeliveryMsg,
} from '../../utils/deliverySystem';

interface AdminDeliveryTabProps {
  orders: Order[];
  onDispatchShipment: (
    orderId: string,
    details: {
      courier: string;
      trackingNumber: string;
      estimatedDelivery: string;
      dispatchDate?: string;
      originHub?: string;
      deliveryExecutive?: DeliveryExecutive;
      packageWeightKg?: number;
      deliveryNotes?: string;
      suppressAlert?: boolean;
    }
  ) => Promise<void>;
  onMarkOutForDelivery: (
    orderId: string,
    deliveryExecutive?: DeliveryExecutive,
    notes?: string
  ) => Promise<void>;
  onRecordDelivered: (orderId: string, pod: ProofOfDelivery) => Promise<void>;
  onRescheduleDelivery: (orderId: string, reason: string) => void;
}

export const AdminDeliveryTab: React.FC<AdminDeliveryTabProps> = ({
  orders,
  onDispatchShipment,
  onMarkOutForDelivery,
  onRecordDelivered,
  onRescheduleDelivery,
}) => {
  const { showToast } = useToast();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'shipped' | 'out_for_delivery' | 'delivered' | 'rescheduled'>('all');
  const [courierFilter, setCourierFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cod' | 'prepaid'>('all');
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Active Modals
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [outForDeliveryOrder, setOutForDeliveryOrder] = useState<Order | null>(null);
  const [podOrder, setPodOrder] = useState<Order | null>(null);
  const [rescheduleOrder, setRescheduleOrder] = useState<Order | null>(null);
  const [shippingLabelOrder, setShippingLabelOrder] = useState<Order | null>(null);
  const [showPincodeChecker, setShowPincodeChecker] = useState(false);
  const [showFleetModal, setShowFleetModal] = useState(false);

  // Dispatch Form State
  const [selectedCourier, setSelectedCourier] = useState<string>('bluedart');
  const [customAwb, setCustomAwb] = useState<string>('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<string>('');
  const [originHub, setOriginHub] = useState<string>(ORIGIN_HUBS[0]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [packageWeightKg, setPackageWeightKg] = useState<number>(1.2);
  const [dispatchNotes, setDispatchNotes] = useState<string>('Luxury Men’s Ethnic Wear. Steam-pressed. Handle with delicate care.');
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);

  // POD Form State
  const [podReceiverName, setPodReceiverName] = useState('');
  const [podRelation, setPodRelation] = useState<ProofOfDelivery['relation']>('Self');
  const [podOtpVerified, setPodOtpVerified] = useState(true);
  const [podRemarks, setPodRemarks] = useState('');
  const [isSubmittingPod, setIsSubmittingPod] = useState(false);

  // Reschedule Form State
  const [rescheduleReason, setRescheduleReason] = useState('Customer requested evening delivery slot');

  // Pincode Checker State
  const [pincodeQuery, setPincodeQuery] = useState('452010');
  const [pincodeResult, setPincodeResult] = useState<any>(null);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const id = (o.orderId || o.id || '').toLowerCase();
      const name = (o.customerName || '').toLowerCase();
      const phone = (o.customerPhone || o.shippingAddress?.phone || '').toLowerCase();
      const city = (o.shippingAddress?.city || '').toLowerCase();
      const pincode = (o.shippingAddress?.pinCode || '').toLowerCase();
      const tracking = (o.trackingNumber || '').toLowerCase();
      const courier = (o.courier || '').toLowerCase();
      const orderStatus = (o.orderStatus || o.status || 'pending').toLowerCase();

      // Search match
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          id.includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          pincode.includes(q) ||
          tracking.includes(q) ||
          courier.includes(q);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter === 'pending') {
        if (orderStatus !== 'pending' && orderStatus !== 'confirmed' && orderStatus !== 'processing') {
          return false;
        }
      } else if (statusFilter === 'shipped') {
        if (orderStatus !== 'shipped') return false;
      } else if (statusFilter === 'out_for_delivery') {
        if (!orderStatus.includes('out') && !orderStatus.includes('delivery')) return false;
      } else if (statusFilter === 'delivered') {
        if (orderStatus !== 'delivered') return false;
      } else if (statusFilter === 'rescheduled') {
        if (!o.rescheduledReason) return false;
      }

      // Courier filter
      if (courierFilter !== 'all') {
        if (!courier.includes(courierFilter.toLowerCase())) return false;
      }

      // Payment filter
      if (paymentFilter === 'cod') {
        if (o.paymentMethod !== 'Cash on Delivery' && o.paymentStatus !== 'Cash on Delivery') {
          return false;
        }
      } else if (paymentFilter === 'prepaid') {
        if (o.paymentMethod === 'Cash on Delivery' || o.paymentStatus === 'Cash on Delivery') {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, courierFilter, paymentFilter]);

  // Key Metrics
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let shippedCount = 0;
    let outCount = 0;
    let deliveredCount = 0;
    let codPendingAmount = 0;

    orders.forEach((o) => {
      const st = (o.orderStatus || o.status || 'pending').toLowerCase();
      const total = o.totalAmount ?? o.total ?? 0;

      if (st === 'delivered') {
        deliveredCount++;
      } else if (st.includes('out') || st.includes('delivery')) {
        outCount++;
        if (o.paymentMethod === 'Cash on Delivery' && o.paymentStatus !== 'Paid') {
          codPendingAmount += total;
        }
      } else if (st === 'shipped') {
        shippedCount++;
        if (o.paymentMethod === 'Cash on Delivery' && o.paymentStatus !== 'Paid') {
          codPendingAmount += total;
        }
      } else if (st !== 'cancelled') {
        pendingCount++;
        if (o.paymentMethod === 'Cash on Delivery' && o.paymentStatus !== 'Paid') {
          codPendingAmount += total;
        }
      }
    });

    return {
      total: orders.length,
      pending: pendingCount,
      shipped: shippedCount,
      out: outCount,
      delivered: deliveredCount,
      codPendingAmount,
    };
  }, [orders]);

  // Open Dispatch Modal with Pre-calculated Values
  const handleOpenDispatch = (order: Order) => {
    setDispatchOrder(order);
    const orderId = order.orderId || order.id || 'ORD-0';
    const city = order.shippingAddress?.city || '';
    const pin = order.shippingAddress?.pinCode || '';

    // Recommend courier based on pincode
    const pinInfo = checkPincodeServiceability(pin);
    let defaultCourierId = 'bluedart';
    if (pin.startsWith('452') || city.toLowerCase().includes('indore')) {
      defaultCourierId = 'majanya_local';
    } else if (pinInfo.recommendedCourier.toLowerCase().includes('delhivery')) {
      defaultCourierId = 'delhivery';
    }

    setSelectedCourier(defaultCourierId);
    setCustomAwb(generateAwb(defaultCourierId, orderId));

    // Expected delivery
    const daysToAdd = defaultCourierId === 'majanya_local' ? 1 : pinInfo.estimatedTransitDays || 2;
    const estDate = new Date(Date.now() + daysToAdd * 86400000);
    setEstimatedDeliveryDate(
      estDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    );

    setSelectedRiderId(defaultCourierId === 'majanya_local' ? DEFAULT_DELIVERY_EXECUTIVES[0].id! : '');
  };

  // Submit Dispatch
  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;

    setIsSubmittingDispatch(true);
    const partner = COURIER_PARTNERS.find((c) => c.id === selectedCourier);
    const courierName = partner ? partner.name : selectedCourier;
    const assignedRider = DEFAULT_DELIVERY_EXECUTIVES.find((r) => r.id === selectedRiderId);

    try {
      await onDispatchShipment(dispatchOrder.orderId || dispatchOrder.id || '', {
        courier: courierName,
        trackingNumber: customAwb,
        estimatedDelivery: estimatedDeliveryDate || '2-3 Business Days',
        dispatchDate: new Date().toISOString(),
        originHub,
        deliveryExecutive: assignedRider,
        packageWeightKg,
        deliveryNotes: dispatchNotes,
      });
      setDispatchOrder(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  // Open Out for Delivery
  const handleOpenOutForDelivery = (order: Order) => {
    setOutForDeliveryOrder(order);
    if (!order.deliveryExecutive) {
      setSelectedRiderId(DEFAULT_DELIVERY_EXECUTIVES[0].id!);
    } else {
      setSelectedRiderId(order.deliveryExecutive.id || DEFAULT_DELIVERY_EXECUTIVES[0].id!);
    }
  };

  const handleConfirmOutForDelivery = async () => {
    if (!outForDeliveryOrder) return;
    const rider = DEFAULT_DELIVERY_EXECUTIVES.find((r) => r.id === selectedRiderId);
    await onMarkOutForDelivery(outForDeliveryOrder.orderId || outForDeliveryOrder.id || '', rider);
    setOutForDeliveryOrder(null);
  };

  // Open Proof of Delivery
  const handleOpenPod = (order: Order) => {
    setPodOrder(order);
    setPodReceiverName(order.customerName || '');
    setPodRelation('Self');
    setPodOtpVerified(true);
    setPodRemarks('Delivered in pristine condition with authentic hanger & garment bag.');
  };

  const handleConfirmPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podOrder) return;

    setIsSubmittingPod(true);
    try {
      await onRecordDelivered(podOrder.orderId || podOrder.id || '', {
        receiverName: podReceiverName,
        relation: podRelation,
        deliveredAt: new Date().toISOString(),
        otpVerified: podOtpVerified,
        notes: podRemarks,
      });
      setPodOrder(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPod(false);
    }
  };

  // Confirm Reschedule
  const handleConfirmReschedule = () => {
    if (!rescheduleOrder) return;
    onRescheduleDelivery(rescheduleOrder.orderId || rescheduleOrder.id || '', rescheduleReason);
    setRescheduleOrder(null);
  };

  // Copy tracking number
  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(tracking);
    showToast(`AWB ${tracking} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  // Test Pincode
  const handleRunPincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const res = checkPincodeServiceability(pincodeQuery);
    setPincodeResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="bg-white rounded-2xl p-6 border border-[#C9A227]/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#5A1A1A] text-[#C9A227]">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-[#5A1A1A]">
                Delivery Operations & Logistics Hub
              </h2>
              <p className="text-xs text-gray-500">
                Nationwide courier tracking, AWB generation, dispatch manifests, and local Indore delivery fleet.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setPincodeQuery('452010');
              setPincodeResult(checkPincodeServiceability('452010'));
              setShowPincodeChecker(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F2] text-[#5A1A1A] border border-[#C9A227]/40 hover:bg-[#FAF7F2]/80 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-[#C9A227]" />
            Pincode Serviceability
          </button>

          <button
            onClick={() => setShowFleetModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#FAF7F2] text-[#5A1A1A] border border-[#C9A227]/40 hover:bg-[#FAF7F2]/80 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-[#C9A227]" />
            Indore Fleet ({DEFAULT_DELIVERY_EXECUTIVES.length} Riders)
          </button>
        </div>
      </div>

      {/* 5 High-Impact KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Pending Dispatch */}
        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300'
              : 'bg-white border-amber-100 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Dispatch</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900">{metrics.pending}</div>
          <span className="text-[10px] text-amber-700">Orders to pack & manifest</span>
        </div>

        {/* Metric 2: Shipped & In-Transit */}
        <div
          onClick={() => setStatusFilter('shipped')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'shipped'
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-300'
              : 'bg-white border-blue-100 hover:border-blue-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Transit</span>
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-900">{metrics.shipped}</div>
          <span className="text-[10px] text-blue-700">Moving across courier hubs</span>
        </div>

        {/* Metric 3: Out for Delivery */}
        <div
          onClick={() => setStatusFilter('out_for_delivery')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'out_for_delivery'
              ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-300'
              : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Out Today</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-900">{metrics.out}</div>
          <span className="text-[10px] text-indigo-700">Arriving with rider today</span>
        </div>

        {/* Metric 4: Delivered */}
        <div
          onClick={() => setStatusFilter('delivered')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'delivered'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300'
              : 'bg-white border-emerald-100 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900">{metrics.delivered}</div>
          <span className="text-[10px] text-emerald-700">Verified arrival & POD</span>
        </div>

        {/* Metric 5: COD Pending to Collect */}
        <div
          onClick={() => setPaymentFilter('cod')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 lg:col-span-1 ${
            paymentFilter === 'cod'
              ? 'bg-[#FAF7F2] border-[#C9A227] ring-2 ring-[#C9A227]/40'
              : 'bg-white border-gray-200 hover:border-[#C9A227]/50 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-[#5A1A1A] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">COD To Collect</span>
            <DollarSign className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#5A1A1A]">
            ₹{metrics.codPendingAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-gray-500">Cash on delivery in transit</span>
        </div>
      </div>

      {/* Control Bar: Search & Filtering */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, AWB tracking, customer name, phone, city, or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-[#5A1A1A]"
            >
              <option value="all">All Delivery Stages ({orders.length})</option>
              <option value="pending">Awaiting Dispatch ({metrics.pending})</option>
              <option value="shipped">In Transit ({metrics.shipped})</option>
              <option value="out_for_delivery">Out for Delivery ({metrics.out})</option>
              <option value="delivered">Delivered ({metrics.delivered})</option>
              <option value="rescheduled">Rescheduled / Exceptions</option>
            </select>

            {/* Courier Filter */}
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-[#5A1A1A]"
            >
              <option value="all">All Courier Partners</option>
              {COURIER_PARTNERS.map((cp) => (
                <option key={cp.id} value={cp.name}>
                  {cp.shortName}
                </option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-[#5A1A1A]"
            >
              <option value="all">All Payment Types</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="prepaid">Prepaid (Razorpay / Online)</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || courierFilter !== 'all' || paymentFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCourierFilter('all');
                  setPaymentFilter('all');
                }}
                className="text-xs text-[#5A1A1A] font-semibold underline px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shipment Records */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 text-gray-500 space-y-2">
            <Truck className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-semibold text-sm">No shipments found</p>
            <p className="text-xs text-gray-400">
              Try adjusting your search terms or delivery stage filters.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const orderId = order.orderId || order.id || 'ORD-0';
            const orderStatus = (order.orderStatus || order.status || 'pending').toLowerCase();
            const isDelivered = orderStatus === 'delivered';
            const isOut = orderStatus.includes('out') || orderStatus.includes('delivery');
            const isShipped = orderStatus === 'shipped';
            const isPendingDispatch = !isDelivered && !isOut && !isShipped && orderStatus !== 'cancelled';
            const isCod = order.paymentMethod === 'Cash on Delivery' || order.paymentStatus === 'Cash on Delivery';
            const totalAmount = order.totalAmount ?? order.total ?? 0;

            const trackingNumber = order.trackingNumber || '';
            const courier = order.courier || (isPendingDispatch ? 'Unassigned' : 'Blue Dart Express');
            const trackingPortalUrl = getCourierTrackingUrl(courier, trackingNumber);

            const city = order.shippingAddress?.city || 'Indore';
            const state = order.shippingAddress?.state || 'Madhya Pradesh';
            const pinCode = order.shippingAddress?.pinCode || '452001';
            const pinInfo = checkPincodeServiceability(pinCode);

            const items = Array.isArray(order.items)
              ? order.items
              : Array.isArray(order.products)
              ? order.products
              : [];

            return (
              <div
                key={orderId}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#C9A227]/60 transition-all p-5 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOut
                          ? 'bg-indigo-100 text-indigo-800'
                          : isShipped
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isDelivered ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isOut ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#5A1A1A]">
                          #{orderId}
                        </span>
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOut
                              ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                              : isShipped
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDelivered
                            ? 'Delivered'
                            : isOut
                            ? 'Out for Delivery'
                            : isShipped
                            ? 'In Transit'
                            : 'Ready for Dispatch'}
                        </span>

                        {isCod && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            COD: ₹{totalAmount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'} • {items.length} garment item(s)
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown / Direct Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Print Shipping Label */}
                    <button
                      onClick={() => setShippingLabelOrder(order)}
                      title="Print Official Courier Shipping Label"
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-500" />
                      <span>Shipping Label</span>
                    </button>

                    {/* WhatsApp Update */}
                    <a
                      href={`https://wa.me/${(order.shippingAddress?.phone || order.customerPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                        generateCustomerWhatsAppDeliveryMsg(
                          order,
                          isDelivered ? 'delivered' : isOut ? 'out_for_delivery' : 'dispatched'
                        )
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Send WhatsApp Delivery Update to Patron"
                      className="px-2.5 py-1.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1 font-semibold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Alert</span>
                    </a>

                    {/* Primary Progression Action */}
                    {isPendingDispatch && (
                      <button
                        onClick={() => handleOpenDispatch(order)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#5A1A1A] text-white hover:bg-[#722020] transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Package className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Dispatch & AWB</span>
                      </button>
                    )}

                    {isShipped && (
                      <button
                        onClick={() => handleOpenOutForDelivery(order)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark Out Today</span>
                      </button>
                    )}

                    {isOut && (
                      <button
                        onClick={() => handleOpenPod(order)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Record POD</span>
                      </button>
                    )}

                    {/* Reschedule Button */}
                    {!isDelivered && (
                      <button
                        onClick={() => {
                          setRescheduleOrder(order);
                          setRescheduleReason(order.rescheduledReason || 'Patron requested later delivery date');
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg border border-transparent hover:border-gray-200"
                        title="Reschedule / Log Delivery Note"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Destination Info */}
                  <div className="p-3 bg-[#FAF7F2]/60 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#5A1A1A]" />
                        Destination
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-gray-200 text-[#5A1A1A] font-semibold">
                        Zone: {pinInfo.zone}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {order.customerName}
                    </div>
                    <div className="text-gray-600 line-clamp-2">
                      {order.shippingAddress?.address}, {city}, {state} - {pinCode}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{order.shippingAddress?.phone || order.customerPhone || 'Contact not provided'}</span>
                    </div>
                  </div>

                  {/* Courier & Tracking Details */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-600" />
                      Courier & AWB
                    </span>
                    <div className="font-semibold text-gray-900 flex items-center justify-between">
                      <span>{courier}</span>
                      {order.packageWeightKg && (
                        <span className="text-[10px] text-gray-500 font-normal">
                          {order.packageWeightKg} kg
                        </span>
                      )}
                    </div>

                    {trackingNumber ? (
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="font-mono text-[11px] font-bold text-[#5A1A1A] bg-white px-2 py-0.5 rounded border border-gray-200">
                          {trackingNumber}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyTracking(trackingNumber)}
                            className="p-1 text-gray-500 hover:text-black rounded"
                            title="Copy AWB"
                          >
                            {copiedTracking === trackingNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {trackingPortalUrl && (
                            <a
                              href={trackingPortalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-blue-600 hover:text-blue-800 rounded"
                              title="Open Courier Tracking Portal"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 italic">
                        AWB will be assigned upon dispatch manifest
                      </div>
                    )}

                    <div className="text-[11px] text-gray-500">
                      ETA: <span className="font-semibold text-gray-800">{order.estimatedDelivery || pinInfo.deliveryRange}</span>
                    </div>
                  </div>

                  {/* Rider / POD or Delivery Status Notes */}
                  <div className="p-3 bg-[#FAF7F2]/60 rounded-xl border border-gray-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Fulfillment Status
                    </span>

                    {isDelivered && order.pod ? (
                      <div className="space-y-1">
                        <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Handed to {order.pod.receiverName} ({order.pod.relation})
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Delivered at: {new Date(order.pod.deliveredAt || order.deliveredAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • OTP Verified
                        </div>
                      </div>
                    ) : order.deliveryExecutive ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900 flex items-center justify-between">
                          <span>Associate: {order.deliveryExecutive.name}</span>
                          <a
                            href={`tel:${order.deliveryExecutive.phone}`}
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {order.deliveryExecutive.vehicleNumber} • {order.deliveryExecutive.agency}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-gray-600">
                        <div>Origin: <span className="font-medium">{order.originHub ? order.originHub.split('(')[0] : 'Indore Flagship'}</span></div>
                        <div className="text-[10px] text-gray-400">
                          {order.dispatchDate ? `Dispatched on ${new Date(order.dispatchDate).toLocaleDateString('en-IN')}` : 'Ready for atelier handover'}
                        </div>
                      </div>
                    )}

                    {order.rescheduledReason && (
                      <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                        Rescheduled: {order.rescheduledReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Summary Strip */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Garments:</span>
                    <span className="truncate max-w-md">
                      {items
                        .map((it: any) => `${it.productName || it.name || 'Garment'} (${it.size || 'M'}) x${it.quantity || 1}`)
                        .join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span>
                      Total: <span className="font-mono font-bold text-[#5A1A1A]">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{order.paymentMethod || 'Prepaid'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL 1: DISPATCH SHIPMENT & GENERATE AWB ================= */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#C9A227]/40 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#5A1A1A] text-[#C9A227]">
                  <Package className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-[#5A1A1A]">
                    Dispatch & Manifest Shipment #{dispatchOrder.orderId || dispatchOrder.id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Assign courier partner, verify AWB tracking code, and schedule parcel pickup.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchOrder(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
              {/* Destination Summary */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#C9A227]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Deliver To</span>
                  <span className="font-bold text-gray-900 text-sm">{dispatchOrder.customerName}</span>
                  <span className="text-gray-600 block">
                    {dispatchOrder.shippingAddress?.city}, {dispatchOrder.shippingAddress?.state} - {dispatchOrder.shippingAddress?.pinCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Amount</span>
                  <span className="font-mono font-bold text-[#5A1A1A] text-sm">
                    ₹{(dispatchOrder.totalAmount ?? dispatchOrder.total ?? 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 block">
                    {dispatchOrder.paymentMethod || 'Prepaid'}
                  </span>
                </div>
              </div>

              {/* Courier Partner Selection */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Select Courier Partner *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COURIER_PARTNERS.map((cp) => {
                    const isSelected = selectedCourier === cp.id;
                    return (
                      <div
                        key={cp.id}
                        onClick={() => {
                          setSelectedCourier(cp.id);
                          setCustomAwb(generateAwb(cp.id, dispatchOrder.orderId || dispatchOrder.id || ''));
                          if (cp.id === 'majanya_local') {
                            setSelectedRiderId(DEFAULT_DELIVERY_EXECUTIVES[0].id!);
                          }
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#5A1A1A] text-white border-[#5A1A1A] shadow-xs'
                            : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-bold text-xs">{cp.shortName}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-gray-500'}`}>
                          {cp.estimatedTransitDays.split('(')[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AWB Tracking Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700">
                    AWB Tracking Number *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomAwb(generateAwb(selectedCourier, dispatchOrder.orderId || dispatchOrder.id || ''))
                    }
                    className="text-[11px] text-[#5A1A1A] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate AWB
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={customAwb}
                  onChange={(e) => setCustomAwb(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-mono text-xs font-bold text-[#5A1A1A] bg-gray-50 focus:bg-white focus:outline-none focus:border-[#5A1A1A]"
                />
              </div>

              {/* Delivery ETA & Package Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Estimated Delivery Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    placeholder="e.g. 7 Sep 2026 or 2 Business Days"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Package Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    value={packageWeightKg}
                    onChange={(e) => setPackageWeightKg(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>
              </div>

              {/* Origin Hub */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Dispatch Origin Atelier / Hub
                </label>
                <select
                  value={originHub}
                  onChange={(e) => setOriginHub(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#5A1A1A]"
                >
                  {ORIGIN_HUBS.map((hub) => (
                    <option key={hub} value={hub}>
                      {hub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Local Rider assignment if local or optional */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Assign Delivery Executive (Optional for Local Indore)
                </label>
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#5A1A1A]"
                >
                  <option value="">National Courier Handover (Third-party)</option>
                  {DEFAULT_DELIVERY_EXECUTIVES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.vehicleNumber} ({r.agency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dispatch Notes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Handling & Courier Instructions
                </label>
                <input
                  type="text"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5A1A1A]"
                />
              </div>

              {/* Notification Notice */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Confirming dispatch automatically triggers an ✉️ Email & 📱 SMS with live tracking to <strong>{dispatchOrder.shippingAddress?.phone || dispatchOrder.customerPhone}</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchOrder(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispatch}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#5A1A1A] text-[#C9A227] hover:bg-[#722020] transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingDispatch ? 'Manifesting...' : 'Confirm Dispatch & Manifest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: OUT FOR DELIVERY ================= */}
      {outForDeliveryOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C9A227]/40 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                  <Truck className="w-5 h-5" />
                </span>
                <h3 className="font-cinzel text-base font-bold text-gray-900">
                  Mark Out for Delivery Today
                </h3>
              </div>
              <button
                onClick={() => setOutForDeliveryOrder(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Order <strong>#{outForDeliveryOrder.orderId || outForDeliveryOrder.id}</strong> will be marked out with local associate. An instant SMS alert will be dispatched to patron {outForDeliveryOrder.customerName}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Assigned Delivery Rider / Associate
                </label>
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#5A1A1A]"
                >
                  {DEFAULT_DELIVERY_EXECUTIVES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.phone} ({r.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>

              {outForDeliveryOrder.paymentMethod === 'Cash on Delivery' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-semibold text-xs">
                  ⚠️ COD Parcel: Instruct associate to collect ₹{(outForDeliveryOrder.totalAmount ?? outForDeliveryOrder.total ?? 0).toLocaleString('en-IN')} in cash or via UPI QR code before handover.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOutForDeliveryOrder(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOutForDelivery}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
              >
                Confirm Out for Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: PROOF OF DELIVERY (POD) ================= */}
      {podOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C9A227]/40 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <h3 className="font-cinzel text-base font-bold text-gray-900">
                  Record Proof of Delivery (POD)
                </h3>
              </div>
              <button
                onClick={() => setPodOrder(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Confirm safe receipt for order <strong>#{podOrder.orderId || podOrder.id}</strong>. This closes the shipment and sends a thank-you note to the customer.
            </p>

            <form onSubmit={handleConfirmPod} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Receiver Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={podReceiverName}
                  onChange={(e) => setPodReceiverName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5A1A1A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Relation to Patron *
                </label>
                <select
                  value={podRelation}
                  onChange={(e) => setPodRelation(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#5A1A1A]"
                >
                  <option value="Self">Self (Patron Himself)</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Reception">Office Reception / Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="podOtpCheck"
                  checked={podOtpVerified}
                  onChange={(e) => setPodOtpVerified(e.target.checked)}
                  className="rounded text-[#5A1A1A] focus:ring-[#5A1A1A]"
                />
                <label htmlFor="podOtpCheck" className="text-gray-700 font-semibold cursor-pointer">
                  Delivery OTP / Mobile Verification Completed
                </label>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  value={podRemarks}
                  onChange={(e) => setPodRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5A1A1A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPodOrder(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPod}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmittingPod ? 'Saving POD...' : 'Mark as Delivered (Verified)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: RESCHEDULE / EXCEPTION ================= */}
      {rescheduleOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <RotateCcw className="w-5 h-5" />
                </span>
                <h3 className="font-cinzel text-base font-bold text-gray-900">
                  Reschedule Delivery Attempt
                </h3>
              </div>
              <button
                onClick={() => setRescheduleOrder(null)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Update delivery notes for order <strong>#{rescheduleOrder.orderId || rescheduleOrder.id}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Reason for Rescheduling / Delivery Exception
                </label>
                <select
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#5A1A1A] mb-2"
                >
                  <option value="Patron requested evening delivery slot">Patron requested evening delivery slot</option>
                  <option value="Customer unavailable / Door locked">Customer unavailable / Door locked</option>
                  <option value="Incomplete or updated delivery address">Incomplete or updated delivery address</option>
                  <option value="Patron requested delivery on weekend">Patron requested delivery on weekend</option>
                  <option value="Heavy rain / local transit delay">Heavy rain / local transit delay</option>
                </select>

                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5A1A1A]"
                  placeholder="Or enter custom reason..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleOrder(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md"
              >
                Save Reschedule Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: PRINTABLE SHIPPING LABEL ================= */}
      {shippingLabelOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-300 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#5A1A1A]" />
                <h3 className="font-cinzel text-base font-bold text-gray-900">
                  Standard Courier Shipping Label
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold bg-[#5A1A1A] text-[#C9A227] rounded-lg hover:bg-[#722020] flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Label
                </button>
                <button
                  onClick={() => setShippingLabelOrder(null)}
                  className="text-gray-400 hover:text-black p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Realistic Physical Shipping Label Card */}
            <div className="border-2 border-black p-5 rounded-lg font-sans text-xs bg-white text-black space-y-3">
              {/* Courier & AWB Barcode Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <span className="font-serif font-black text-base tracking-wider block">
                    {shippingLabelOrder.courier || 'BLUE DART EXPRESS'}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-600">
                    AIR / SURFACE CARGO PRIORITY
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold block">AWB NUMBER</span>
                  <span className="font-mono text-sm font-black tracking-wider block bg-gray-100 px-2 py-0.5 rounded">
                    {shippingLabelOrder.trackingNumber || `MJN-${(shippingLabelOrder.orderId || '').replace(/\D/g, '') || '92841'}IN`}
                  </span>
                </div>
              </div>

              {/* Barcode Mock Visual */}
              <div className="py-2 text-center border-b border-black">
                <div className="h-10 flex items-center justify-center gap-0.5 max-w-xs mx-auto overflow-hidden">
                  {[...Array(48)].map((_, i) => (
                    <span
                      key={i}
                      className="bg-black inline-block h-full"
                      style={{ width: `${(i % 4) + 1}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] tracking-widest block mt-1 font-bold">
                  *{shippingLabelOrder.trackingNumber || 'MJN-TRACK-IN'}*
                </span>
              </div>

              {/* SHIP TO & SHIP FROM Columns */}
              <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-3">
                {/* Consignee (Deliver To) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider block bg-black text-white px-1.5 py-0.5 w-max rounded-xs">
                    SHIP TO (CONSIGNEE)
                  </span>
                  <div className="font-bold text-sm">{shippingLabelOrder.customerName}</div>
                  <div className="text-[11px] leading-relaxed">
                    {shippingLabelOrder.shippingAddress?.address}
                    <br />
                    {shippingLabelOrder.shippingAddress?.city}, {shippingLabelOrder.shippingAddress?.state}
                  </div>
                  <div className="font-mono font-black text-sm pt-1">
                    PINCODE: {shippingLabelOrder.shippingAddress?.pinCode}
                  </div>
                  <div className="text-[11px] font-bold">
                    TEL: {shippingLabelOrder.shippingAddress?.phone || shippingLabelOrder.customerPhone}
                  </div>
                </div>

                {/* Consignor (Return Address) */}
                <div className="space-y-1 border-l border-gray-300 pl-3">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-gray-500">
                    RETURN IF UNDELIVERED (SHIPPER)
                  </span>
                  <div className="font-bold text-xs">{BRAND.fullName}</div>
                  <div className="text-[10px] text-gray-600 leading-tight">
                    {BRAND.address.line1}, {BRAND.address.line2}, {BRAND.address.city}, {BRAND.address.state} - {BRAND.address.pinCode}
                  </div>
                  <div className="text-[10px] font-semibold pt-1">
                    Care: Siddhant Jain ({BRAND.phone})
                  </div>
                </div>
              </div>

              {/* Financials & COD Barcode */}
              <div className="flex items-center justify-between border-b border-black pb-2">
                <div>
                  <span className="text-[10px] font-bold block uppercase">PAYMENT MODE</span>
                  <span
                    className={`font-mono text-sm font-black px-2 py-0.5 rounded inline-block ${
                      shippingLabelOrder.paymentMethod === 'Cash on Delivery'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    {shippingLabelOrder.paymentMethod === 'Cash on Delivery'
                      ? 'COLLECT CASH: ₹' + (shippingLabelOrder.totalAmount ?? shippingLabelOrder.total ?? 0).toLocaleString('en-IN')
                      : 'PREPAID ONLINE'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold block uppercase">PARCEL WEIGHT</span>
                  <span className="font-mono text-xs font-bold">
                    {shippingLabelOrder.packageWeightKg || 1.2} KG (1 PKG)
                  </span>
                </div>
              </div>

              {/* Garment Order Contents */}
              <div className="text-[10px] text-gray-700">
                <span className="font-bold block">ORDER #{shippingLabelOrder.orderId || shippingLabelOrder.id}:</span>
                <span className="block truncate">
                  {(shippingLabelOrder.items || shippingLabelOrder.products || [])
                    .map((it: any) => `${it.productName || it.name} (${it.size || 'M'})`)
                    .join(', ')}
                </span>
              </div>

              {/* Instructions */}
              <div className="border border-black p-2 rounded text-[9px] text-center uppercase tracking-wider font-bold bg-gray-50">
                ⚠️ FRAGILE LUXURY ETHNIC ATTIRE • DO NOT CRUSH OR FOLD • STORE AT DRY AMBIENT TEMP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: PINCODE SERVICEABILITY CHECKER ================= */}
      {showPincodeChecker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C9A227]/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#5A1A1A] text-[#C9A227]">
                  <Compass className="w-5 h-5" />
                </span>
                <h3 className="font-cinzel text-base font-bold text-gray-900">
                  Indian Pincode Serviceability Engine
                </h3>
              </div>
              <button
                onClick={() => setShowPincodeChecker(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunPincodeCheck} className="space-y-3 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeQuery}
                  onChange={(e) => setPincodeQuery(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit postal code (e.g. 452001, 110001)..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl font-mono text-sm focus:outline-none focus:border-[#5A1A1A]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5A1A1A] text-[#C9A227] font-bold rounded-xl hover:bg-[#722020]"
                >
                  Verify
                </button>
              </div>

              {pincodeResult && (
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#C9A227]/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">
                      Pincode: {pincodeResult.pincode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Serviceable ✅
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Logistics Zone</span>
                      <span className="font-semibold text-[#5A1A1A]">{pincodeResult.zone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Transit Time</span>
                      <span className="font-semibold text-gray-900">{pincodeResult.deliveryRange}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Cash on Delivery</span>
                      <span className="font-semibold text-emerald-700">Available</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Top Courier</span>
                      <span className="font-semibold text-blue-700">{pincodeResult.recommendedCourier}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 pt-1 border-t border-gray-200">
                    {pincodeResult.notes}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 7: LOCAL DELIVERY FLEET DIRECTORY ================= */}
      {showFleetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C9A227]/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#5A1A1A] text-[#C9A227]">
                  <Navigation className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-gray-900">
                    Majanya Ji Local Delivery Fleet
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Dedicated associates for express Indore home drop-offs.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFleetModal(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {DEFAULT_DELIVERY_EXECUTIVES.map((rider) => (
                <div
                  key={rider.id}
                  className="p-3.5 rounded-xl bg-[#FAF7F2] border border-gray-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{rider.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-normal">
                        Active Today
                      </span>
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      {rider.vehicleNumber}
                    </div>
                    <div className="text-gray-400 text-[10px]">
                      {rider.agency}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${rider.phone}`}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${rider.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(rider.name)},%20checking%20status%20of%20today%27s%20Majanya%20Ji%20ethnic%20wear%20deliveries.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
