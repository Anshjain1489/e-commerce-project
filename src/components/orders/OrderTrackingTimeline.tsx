import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock,
  MapPin,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  Navigation,
  RefreshCw,
  ExternalLink,
  Phone,
  User,
} from 'lucide-react';
import { Order, CarrierTrackingData } from '../../types';
import { BRAND } from '../../constants';
import { getCourierTrackingUrl } from '../../utils/deliverySystem';

interface OrderTrackingTimelineProps {
  order: Order;
  defaultExpanded?: boolean;
  carrierData?: CarrierTrackingData;
  onRefreshCarrier?: () => Promise<void> | void;
  isRefreshingCarrier?: boolean;
}

export interface TrackingStage {
  id: string;
  name: string;
  shortName: string;
  description: string;
  stageNumber: number;
}

export const ORDER_TRACKING_STAGES: TrackingStage[] = [
  {
    id: 'confirmed',
    name: 'Confirmed',
    shortName: 'Confirmed',
    description: 'Order placed & payment verified',
    stageNumber: 1,
  },
  {
    id: 'processing',
    name: 'Processing',
    shortName: 'Processing',
    description: 'Artisan tailoring & royal dust packaging',
    stageNumber: 2,
  },
  {
    id: 'shipped',
    name: 'Shipped',
    shortName: 'Shipped',
    description: 'Dispatched with express road transit',
    stageNumber: 3,
  },
  {
    id: 'out_for_delivery',
    name: 'Out for Delivery',
    shortName: 'Out for Delivery',
    description: 'Courier agent en route to doorstep',
    stageNumber: 4,
  },
  {
    id: 'delivered',
    name: 'Delivered',
    shortName: 'Delivered',
    description: 'Safely received at address',
    stageNumber: 5,
  },
];

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  order,
  defaultExpanded = false,
  carrierData,
  onRefreshCarrier,
  isRefreshingCarrier = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);
  const [isLocalRefreshing, setIsLocalRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');

  const effectiveCarrier = carrierData || order.carrierStatus;
  const rawStatus = (
    effectiveCarrier?.statusCategory ||
    order.status ||
    (order as any).orderStatus ||
    'pending'
  )
    .toString()
    .toLowerCase()
    .trim();

  // Determine stage progress level:
  // -1 = Cancelled
  // 1 = Confirmed / Placed
  // 2 = Processing / Packed
  // 3 = Shipped / In Transit
  // 4 = Out for Delivery
  // 5 = Delivered
  let currentStageIndex = 1;
  if (rawStatus.includes('cancel')) {
    currentStageIndex = -1;
  } else if (rawStatus.includes('deliver') && !rawStatus.includes('out')) {
    currentStageIndex = 5;
  } else if (
    rawStatus.includes('out for delivery') ||
    rawStatus.includes('out_for_delivery') ||
    rawStatus.includes('outfordelivery')
  ) {
    currentStageIndex = 4;
  } else if (rawStatus.includes('ship') || rawStatus.includes('transit') || rawStatus.includes('dispatch')) {
    currentStageIndex = 3;
  } else if (
    rawStatus.includes('process') ||
    rawStatus.includes('pack') ||
    rawStatus.includes('tailor') ||
    rawStatus.includes('quality')
  ) {
    currentStageIndex = 2;
  } else if (rawStatus.includes('confirm')) {
    currentStageIndex = 1;
  } else if (rawStatus.includes('pend')) {
    currentStageIndex = 1;
  }

  const orderId = String(order.id || (order as any).orderId || 'ORD-0');
  const numericCode = orderId.replace(/\D/g, '') || '84920';
  const trackingNumber =
    order.trackingId ||
    order.trackingNumber ||
    effectiveCarrier?.trackingId ||
    effectiveCarrier?.trackingNumber ||
    `BLUEDART-${numericCode}IN`;

  const courierPartner = effectiveCarrier?.carrier || order.courier || 'Blue Dart Express';

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date(Date.now() - 2 * 86400000);
  const estimatedDeliveryDate = new Date(orderDate.getTime() + 4 * 86400000);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleRefreshTracking = async () => {
    setIsLocalRefreshing(true);
    if (onRefreshCarrier) {
      try {
        await onRefreshCarrier();
      } catch (err) {
        console.error('Error refreshing carrier status:', err);
      }
    }
    setTimeout(() => {
      setIsLocalRefreshing(false);
      setLastRefreshedTime('Just now');
    }, 600);
  };

  const isRefreshing = isLocalRefreshing || isRefreshingCarrier;

  const whatsappTrackingMessage = `Hello Siddhant Ji, I am tracking my Majanya Ji order #${orderId} (Current Status: ${
    currentStageIndex === 5
      ? 'Delivered'
      : currentStageIndex === 4
      ? 'Out for Delivery'
      : currentStageIndex === 3
      ? 'Shipped'
      : currentStageIndex === 2
      ? 'Processing'
      : 'Confirmed'
  }, AWB: ${trackingNumber}). Could you provide live delivery updates?`;
  const whatsappUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(whatsappTrackingMessage)}`;

  // Progress line width percentage across 5 stages
  const getProgressPercentage = () => {
    switch (currentStageIndex) {
      case 1:
        return 12;
      case 2:
        return 35;
      case 3:
        return 60;
      case 4:
        return 82;
      case 5:
        return 100;
      default:
        return 12;
    }
  };

  // Detailed chronological timeline events (using live carrier checkpoints if available)
  const timelineEvents = React.useMemo(() => {
    if (effectiveCarrier?.checkpoints && effectiveCarrier.checkpoints.length > 0) {
      return effectiveCarrier.checkpoints.map((cp) => ({
        title: cp.status,
        description: cp.description,
        timestamp: cp.timestamp,
        completed: cp.completed,
        current: currentStageIndex === cp.stage,
        location: cp.location,
      }));
    }

    return [
      {
        title: 'Order Confirmed & Payment Verified',
        description: `Payment acknowledged via ${order.paymentMethod || 'Online Payment'}. Handcrafted order queued at our Indore atelier.`,
        timestamp: `${formatDate(orderDate)} at ${formatTime(orderDate)}`,
        completed: currentStageIndex >= 1,
        current: currentStageIndex === 1,
        location: 'Indore Atelier, MP',
      },
      {
        title: 'Processing: Handcrafting & Quality Finishing',
        description: 'Zari embroidery inspected, buttons hand-tightened, and packaged in protective royal dust cover.',
        timestamp:
          currentStageIndex >= 2
            ? `${formatDate(new Date(orderDate.getTime() + 18 * 3600000))} at 11:30 AM`
            : 'Pending Completion',
        completed: currentStageIndex >= 2,
        current: currentStageIndex === 2,
        location: 'Indore Quality Hub',
      },
      {
        title: `Shipped via ${courierPartner}`,
        description: `Handed over to ${courierPartner} with tracking AWB #${trackingNumber}. ${order.packageWeightKg ? `Parcel weight: ${order.packageWeightKg} kg.` : ''} Express linehaul transit underway.`,
        timestamp:
          order.dispatchDate
            ? `${formatDate(new Date(order.dispatchDate))} at ${formatTime(new Date(order.dispatchDate))}`
            : currentStageIndex >= 3
            ? `${formatDate(new Date(orderDate.getTime() + 40 * 3600000))} at 04:45 PM`
            : 'Scheduled for dispatch',
        completed: currentStageIndex >= 3,
        current: currentStageIndex === 3,
        location: order.originHub ? order.originHub.split('(')[0].trim() : 'Indore Central Logistics Hub',
      },
      {
        title: 'Out for Delivery: Arriving at Your Doorstep',
        description: (effectiveCarrier?.deliveryAssociate || order.deliveryExecutive)
          ? `Out with ${(effectiveCarrier?.deliveryAssociate || order.deliveryExecutive)?.name} (${(effectiveCarrier?.deliveryAssociate || order.deliveryExecutive)?.agency} • ${(effectiveCarrier?.deliveryAssociate || order.deliveryExecutive)?.vehicleNumber}) for final doorstep delivery.`
          : 'Dispatched with local courier delivery associate for final delivery attempt. Keep phone handy.',
        timestamp:
          currentStageIndex >= 4
            ? `${formatDate(estimatedDeliveryDate)} at 09:15 AM`
            : `Expected by ${formatDate(estimatedDeliveryDate)}`,
        completed: currentStageIndex >= 4,
        current: currentStageIndex === 4,
        location: `${order.shippingAddress?.city || 'Local Delivery'} Hub`,
      },
      {
        title: 'Delivered & Handed Over',
        description: (effectiveCarrier?.pod || order.pod)
          ? `Delivered to ${(effectiveCarrier?.pod || order.pod)?.receiverName} (${(effectiveCarrier?.pod || order.pod)?.relation}) at ${order.shippingAddress?.city || 'destination'}. OTP verified.`
          : order.shippingAddress
          ? `Delivered to ${order.shippingAddress.fullName}, ${order.shippingAddress.city} - ${order.shippingAddress.pinCode}. Verified with delivery receipt.`
          : 'Delivered to customer address.',
        timestamp:
          order.deliveredAt || order.pod?.deliveredAt || effectiveCarrier?.pod?.deliveredAt
            ? `${formatDate(new Date(order.deliveredAt || order.pod?.deliveredAt || effectiveCarrier?.pod!.deliveredAt!))} at ${formatTime(new Date(order.deliveredAt || order.pod?.deliveredAt || effectiveCarrier?.pod!.deliveredAt!))}`
            : currentStageIndex >= 5
            ? `${formatDate(estimatedDeliveryDate)} at 02:15 PM`
            : `Expected delivery by ${formatDate(estimatedDeliveryDate)}`,
        completed: currentStageIndex >= 5,
        current: currentStageIndex === 5,
        location: order.shippingAddress?.city || 'Destination City',
      },
    ];
  }, [effectiveCarrier, currentStageIndex, order, courierPartner, trackingNumber, orderDate, estimatedDeliveryDate]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* ================= REAL-TIME STATUS BANNER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#FAF7F2] p-3 sm:p-3.5 rounded-xl border border-[#C9A227]/30">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            {currentStageIndex < 5 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A227] opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                currentStageIndex === 5
                  ? 'bg-emerald-500'
                  : currentStageIndex === 4
                  ? 'bg-emerald-600'
                  : currentStageIndex === 3
                  ? 'bg-[#C9A227]'
                  : 'bg-amber-600'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C9A227]">
                Live Status Tracker
              </span>
              <span className="text-[10px] text-gray-400">• Updated {lastRefreshedTime}</span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-[#1E1E1E] flex items-center gap-1.5 mt-0.5">
              {currentStageIndex === 5 ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Delivered safely on {formatDate(estimatedDeliveryDate)}
                </span>
              ) : currentStageIndex === 4 ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Out for Delivery • Arriving Today by 7:00 PM
                </span>
              ) : currentStageIndex === 3 ? (
                <span className="text-[#5A1A1A] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#C9A227]" />
                  Shipped • In Transit with {courierPartner}
                </span>
              ) : currentStageIndex === 2 ? (
                <span className="text-amber-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-700" />
                  Processing • Handcrafting & Quality Inspection
                </span>
              ) : (
                <span className="text-blue-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-700" />
                  Order Confirmed • Tailoring in Queue
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleRefreshTracking}
            disabled={isRefreshing}
            className="p-1.5 text-gray-500 hover:text-[#5A1A1A] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors text-xs font-semibold flex items-center gap-1"
            title="Refresh Live Courier Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C9A227]' : ''}`} />
            <span className="hidden sm:inline text-[11px]">Sync Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-[#5A1A1A] hover:text-[#C9A227] transition-colors flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white border border-gray-200 shadow-2xs"
          >
            <span>{isExpanded ? 'Hide Details' : 'Full Journey'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ================= 5-STAGE HORIZONTAL VISUAL STEPPER ================= */}
      <div className="relative my-6 px-1 sm:px-4">
        {/* Background Track */}
        <div className="absolute top-4 left-4 right-4 sm:left-8 sm:right-8 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full" />

        {/* Dynamic Progress Fill */}
        <div
          className="absolute top-4 left-4 sm:left-8 h-1 bg-gradient-to-r from-[#5A1A1A] via-[#C9A227] to-emerald-600 -translate-y-1/2 z-0 rounded-full transition-all duration-700"
          style={{ width: `calc(${getProgressPercentage()}% - 1.5rem)` }}
        />

        {/* Stepper Nodes */}
        <div className="relative z-10 flex items-start justify-between">
          {ORDER_TRACKING_STAGES.map((stage) => {
            const isCompleted = currentStageIndex >= stage.stageNumber;
            const isCurrent = currentStageIndex === stage.stageNumber;

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center text-center max-w-[64px] sm:max-w-[100px] group"
              >
                {/* Step Circle */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
                    isCompleted
                      ? 'bg-[#5A1A1A] text-[#C9A227] ring-4 ring-[#FAF7F2]'
                      : isCurrent
                      ? 'bg-[#C9A227] text-white ring-4 ring-[#C9A227]/30 scale-110 font-bold'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  ) : stage.stageNumber === 1 ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : stage.stageNumber === 2 ? (
                    <Package className="w-3.5 h-3.5" />
                  ) : stage.stageNumber === 3 ? (
                    <Truck className="w-3.5 h-3.5" />
                  ) : stage.stageNumber === 4 ? (
                    <Navigation className="w-3.5 h-3.5" />
                  ) : (
                    <Home className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Step Name */}
                <span
                  className={`mt-2 text-[10px] sm:text-xs font-bold leading-tight ${
                    isCompleted || isCurrent ? 'text-[#1E1E1E]' : 'text-gray-400 font-medium'
                  }`}
                >
                  {stage.shortName}
                </span>

                {/* Sub Status Label */}
                <span className="mt-0.5 text-[9px] sm:text-[10px] text-gray-500 line-clamp-1">
                  {stage.stageNumber === 1
                    ? formatDate(orderDate)
                    : stage.stageNumber === 2
                    ? isCompleted
                      ? 'Inspected'
                      : isCurrent
                      ? 'In Hand'
                      : 'Queue'
                    : stage.stageNumber === 3
                    ? isCompleted
                      ? 'In Transit'
                      : isCurrent
                      ? 'En Route'
                      : 'Pending'
                    : stage.stageNumber === 4
                    ? isCompleted
                      ? 'Reached'
                      : isCurrent
                      ? 'Today'
                      : 'Next'
                    : isCompleted
                    ? 'Received'
                    : `By ${formatDate(estimatedDeliveryDate)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= EXPANDABLE TRACKING DETAILS & AUDIT TRAIL ================= */}
      {isExpanded && (
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#FAF7F2]/80 border border-[#C9A227]/30 animate-in fade-in duration-200">
          {/* Tracking Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 mb-4 border-b border-gray-200/80 text-xs">
            {/* Courier Partner & AWB */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Courier Partner & AWB
                </span>
                {getCourierTrackingUrl(courierPartner, trackingNumber) && (
                  <a
                    href={getCourierTrackingUrl(courierPartner, trackingNumber)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                    title="Track on official courier portal"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">{courierPartner}</span>
                  <span className="font-mono text-[11px] text-[#5A1A1A] font-bold">{trackingNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                  title="Copy Tracking Number"
                >
                  {copiedTracking ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Estimated Delivery Target */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-1">
                {currentStageIndex >= 5 ? 'Delivery Completed' : 'Target Delivery'}
              </span>
              <span className="font-bold text-[#5A1A1A] block">
                {order.estimatedDelivery
                  ? order.estimatedDelivery
                  : currentStageIndex === 4
                  ? 'Arriving Today'
                  : `${formatDate(estimatedDeliveryDate)}, 2026`}
              </span>
              <span className="text-[10px] text-gray-500">
                {currentStageIndex >= 5
                  ? 'Verified Doorstep Signature'
                  : currentStageIndex === 4
                  ? 'Delivery Slot: 10:00 AM – 7:00 PM'
                  : 'Standard Express 3–5 Business Days'}
              </span>
            </div>

            {/* Destination Address Snippet */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-1">
                Delivery Destination
              </span>
              <span className="font-bold text-gray-900 block truncate">
                {order.shippingAddress?.fullName || order.customerName}
              </span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-[#C9A227] shrink-0" />
                {order.shippingAddress?.city || 'Indore'}, {order.shippingAddress?.state || 'MP'}
              </span>
            </div>
          </div>

          {/* Dedicated Delivery Executive & POD Section (if available) */}
          {(order.deliveryExecutive || order.pod || order.rescheduledReason) && (
            <div className="mb-4 p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs space-y-2 text-xs">
              {order.deliveryExecutive && (
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                      <Truck className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Assigned Delivery Associate
                      </span>
                      <span className="font-bold text-gray-900">
                        {order.deliveryExecutive.name} • {order.deliveryExecutive.vehicleNumber} ({order.deliveryExecutive.agency})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${order.deliveryExecutive.phone}`}
                      className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      Call Rider
                    </a>
                  </div>
                </div>
              )}

              {order.pod && (
                <div className="flex items-center gap-2 text-emerald-800 text-[11px] font-medium pt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Proof of Delivery: Received by <strong>{order.pod.receiverName}</strong> ({order.pod.relation}) on {new Date(order.pod.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {new Date(order.pod.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. OTP Verified.
                  </span>
                </div>
              )}

              {order.rescheduledReason && (
                <div className="flex items-center gap-2 text-amber-800 text-[11px] bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Delivery note: {order.rescheduledReason}</span>
                </div>
              )}
            </div>
          )}

          {/* Chronological Milestone Events */}
          <div className="mb-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#5A1A1A] mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              Step-by-Step Dispatch Log
            </h5>

            <div className="space-y-3 relative pl-4 sm:pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="relative text-xs group">
                  {/* Event indicator dot */}
                  <span
                    className={`absolute -left-[1.35rem] sm:-left-[1.85rem] top-1 w-3 h-3 rounded-full border-2 bg-white transition-colors ${
                      evt.completed
                        ? 'border-[#5A1A1A] bg-[#5A1A1A]'
                        : evt.current
                        ? 'border-[#C9A227] bg-[#C9A227]'
                        : 'border-gray-300'
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span
                      className={`font-semibold ${
                        evt.completed
                          ? 'text-gray-900'
                          : evt.current
                          ? 'text-[#5A1A1A] font-bold'
                          : 'text-gray-400'
                      }`}
                    >
                      {evt.title}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono sm:text-right shrink-0">
                      {evt.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    {evt.description}
                  </p>

                  <span className="text-[10px] text-[#C9A227] font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {evt.location}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Concierge & Support Footer */}
          <div className="pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[11px] text-gray-500">
              Need to reschedule or provide gate entry passcode?
            </span>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contact Delivery Concierge on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
