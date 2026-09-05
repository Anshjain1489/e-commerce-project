import React, { useState } from 'react';
import {
  X,
  Search,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Phone,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { CarrierTrackingData } from '../../types';

interface CarrierAwbLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeData: CarrierTrackingData | null;
  isLoading: boolean;
  onLookup: (trackingId: string) => Promise<any>;
}

const QUICK_DEMO_AWBS = [
  { awb: 'BLUEDART-58402IN', carrier: 'Blue Dart' },
  { awb: 'DLV-92841IN', carrier: 'Delhivery' },
  { awb: 'DTDC-71048IN', carrier: 'DTDC' },
  { awb: 'SRKT-41829IN', carrier: 'Shiprocket' },
];

export const CarrierAwbLookupModal: React.FC<CarrierAwbLookupModalProps> = ({
  isOpen,
  onClose,
  activeData,
  isLoading,
  onLookup,
}) => {
  const [inputAwb, setInputAwb] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAwb.trim()) {
      onLookup(inputAwb.trim());
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#C9A227]/40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 bg-[#FAF7F2] border-b border-[#C9A227]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5A1A1A] text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#1E1E1E]">
                Carrier Live Tracking Portal
              </h2>
              <p className="text-[11px] text-gray-500">
                Real-time shipping carrier telemetry & waypoint radar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-5 border-b border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputAwb}
                onChange={(e) => setInputAwb(e.target.value)}
                placeholder="Enter Consignment AWB / Tracking ID (e.g. BLUEDART-58402IN)..."
                className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputAwb.trim()}
              className="px-5 py-2.5 bg-[#5A1A1A] hover:bg-[#431313] disabled:opacity-50 text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#C9A227]" />
              ) : (
                <Search className="w-4 h-4 text-[#C9A227]" />
              )}
              <span>Track</span>
            </button>
          </form>

          {/* Quick Demo AWBs */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
            <span className="text-gray-400 text-[11px] mr-1">Sample AWBs:</span>
            {QUICK_DEMO_AWBS.map((sample) => (
              <button
                key={sample.awb}
                type="button"
                onClick={() => {
                  setInputAwb(sample.awb);
                  onLookup(sample.awb);
                }}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-[#FAF7F2] hover:border-[#C9A227]/40 border border-gray-200 text-[11px] text-gray-700 font-mono transition-colors"
              >
                {sample.carrier}: {sample.awb}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body / Tracking Results */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-5 bg-[#FAF7F2]/40">
          {isLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 text-[#C9A227] animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Connecting to Carrier Gateway...</p>
              <p className="text-xs text-gray-400 mt-1">
                Retrieving linehaul checkpoints and waypoint scans
              </p>
            </div>
          ) : activeData ? (
            <div className="space-y-4">
              {/* Telemetry Summary Card */}
              <div className="p-4 rounded-xl bg-white border border-[#C9A227]/30 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#5A1A1A] text-white">
                      {activeData.carrier}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      AWB: <strong>{activeData.trackingId}</strong>
                    </span>
                    <button
                      onClick={() => handleCopy(activeData.trackingId)}
                      className="p-1 text-gray-400 hover:text-black rounded"
                      title="Copy AWB"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {activeData.status}
                    </span>
                    {activeData.trackingUrl && (
                      <a
                        href={activeData.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Carrier Portal</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Live Hub Location
                    </span>
                    <span className="font-semibold text-gray-900 block mt-0.5 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C9A227] shrink-0" />
                      {activeData.currentLocation}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Estimated Delivery
                    </span>
                    <span className="font-semibold text-[#5A1A1A] block mt-0.5">
                      {activeData.estimatedDelivery}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Destination City
                    </span>
                    <span className="font-semibold text-gray-900 block mt-0.5">
                      {activeData.destinationCity}
                    </span>
                  </div>
                </div>

                {/* Delivery Executive (if assigned) */}
                {activeData.deliveryAssociate && (
                  <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-indigo-700" />
                      <div>
                        <span className="font-bold text-indigo-950">
                          {activeData.deliveryAssociate.name} ({activeData.deliveryAssociate.agency})
                        </span>
                        <span className="text-gray-500 block text-[11px]">
                          Vehicle: {activeData.deliveryAssociate.vehicleNumber}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${activeData.deliveryAssociate.phone}`}
                      className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Rider</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Waypoint Checkpoint Timeline */}
              <div className="p-4 rounded-xl bg-white border border-[#C9A227]/30 shadow-xs">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Consignment Journey & Waypoints</span>
                </h3>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {activeData.checkpoints.map((cp, idx) => (
                    <div key={cp.id || idx} className="flex items-start gap-3 relative z-10 text-xs">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${
                          cp.completed ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                      >
                        {cp.completed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div className="flex-1 bg-[#FAF7F2] p-2.5 rounded-lg border border-gray-100">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-gray-900">{cp.status}</span>
                          <span className="text-[10px] text-gray-500">{cp.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">{cp.description}</p>
                        <span className="text-[10px] text-[#C9A227] font-semibold mt-1 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {cp.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Truck className="w-12 h-12 stroke-1 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">Enter a Tracking AWB Above</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                Enter your courier Air Waybill or click one of the sample tracking IDs above to inspect live carrier routing data.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Integrated with Blue Dart, Delhivery, DTDC & Shiprocket Gateways</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
