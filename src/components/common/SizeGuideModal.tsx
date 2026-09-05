import React, { useState, useEffect } from 'react';
import { X, Ruler, HelpCircle, Check, MessageCircle, Sparkles, Scissors, Info, Shirt } from 'lucide-react';
import { BRAND } from '../../constants';

export interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'kurta-pajama' | 'jacket-set' | 'shirts' | string;
}

interface KurtaSizeRow {
  tag: string;
  bodyChestIn: number;
  garmentChestIn: number;
  shoulderIn: number;
  lengthIn: number;
  sleeveIn: number;
  pajamaWaistIn: string;
  pajamaLengthIn: number;
}

interface JacketSizeRow {
  tag: string;
  bodyChestIn: number;
  garmentChestIn: number;
  shoulderIn: number;
  lengthIn: number;
  waistIn: number;
  armholeIn: number;
}

interface ShirtSizeRow {
  tag: string;
  bodyChestIn: number;
  garmentChestIn: number;
  shoulderIn: number;
  lengthIn: number;
  sleeveIn: number;
  collarIn: number;
}

const KURTA_SIZES: KurtaSizeRow[] = [
  { tag: 'S (38)', bodyChestIn: 38, garmentChestIn: 41, shoulderIn: 17.5, lengthIn: 41, sleeveIn: 25.0, pajamaWaistIn: '30 - 34', pajamaLengthIn: 41 },
  { tag: 'M (40)', bodyChestIn: 40, garmentChestIn: 43, shoulderIn: 18.0, lengthIn: 42, sleeveIn: 25.5, pajamaWaistIn: '32 - 36', pajamaLengthIn: 42 },
  { tag: 'L (42)', bodyChestIn: 42, garmentChestIn: 45, shoulderIn: 18.5, lengthIn: 43, sleeveIn: 26.0, pajamaWaistIn: '34 - 38', pajamaLengthIn: 43 },
  { tag: 'XL (44)', bodyChestIn: 44, garmentChestIn: 47, shoulderIn: 19.0, lengthIn: 44, sleeveIn: 26.5, pajamaWaistIn: '36 - 40', pajamaLengthIn: 44 },
  { tag: 'XXL (46)', bodyChestIn: 46, garmentChestIn: 49, shoulderIn: 19.5, lengthIn: 44.5, sleeveIn: 27.0, pajamaWaistIn: '38 - 42', pajamaLengthIn: 44.5 },
  { tag: '3XL (48)', bodyChestIn: 48, garmentChestIn: 51, shoulderIn: 20.0, lengthIn: 45, sleeveIn: 27.0, pajamaWaistIn: '40 - 44', pajamaLengthIn: 45 },
];

const JACKET_SIZES: JacketSizeRow[] = [
  { tag: 'S (38)', bodyChestIn: 38, garmentChestIn: 40, shoulderIn: 17.0, lengthIn: 27.5, waistIn: 36, armholeIn: 19.5 },
  { tag: 'M (40)', bodyChestIn: 40, garmentChestIn: 42, shoulderIn: 17.5, lengthIn: 28.0, waistIn: 38, armholeIn: 20.0 },
  { tag: 'L (42)', bodyChestIn: 42, garmentChestIn: 44, shoulderIn: 18.0, lengthIn: 28.5, waistIn: 40, armholeIn: 20.5 },
  { tag: 'XL (44)', bodyChestIn: 44, garmentChestIn: 46, shoulderIn: 18.5, lengthIn: 29.0, waistIn: 42, armholeIn: 21.0 },
  { tag: 'XXL (46)', bodyChestIn: 46, garmentChestIn: 48, shoulderIn: 19.0, lengthIn: 29.5, waistIn: 44, armholeIn: 21.5 },
  { tag: '3XL (48)', bodyChestIn: 48, garmentChestIn: 50, shoulderIn: 19.5, lengthIn: 30.0, waistIn: 46, armholeIn: 22.0 },
];

const SHIRT_SIZES: ShirtSizeRow[] = [
  { tag: 'S (38)', bodyChestIn: 38, garmentChestIn: 41, shoulderIn: 17.5, lengthIn: 29.0, sleeveIn: 25.0, collarIn: 15.0 },
  { tag: 'M (40)', bodyChestIn: 40, garmentChestIn: 43, shoulderIn: 18.0, lengthIn: 29.5, sleeveIn: 25.5, collarIn: 15.5 },
  { tag: 'L (42)', bodyChestIn: 42, garmentChestIn: 45, shoulderIn: 18.5, lengthIn: 30.0, sleeveIn: 26.0, collarIn: 16.0 },
  { tag: 'XL (44)', bodyChestIn: 44, garmentChestIn: 47, shoulderIn: 19.0, lengthIn: 30.5, sleeveIn: 26.5, collarIn: 16.5 },
  { tag: 'XXL (46)', bodyChestIn: 46, garmentChestIn: 49, shoulderIn: 19.5, lengthIn: 31.0, sleeveIn: 27.0, collarIn: 17.0 },
  { tag: '3XL (48)', bodyChestIn: 48, garmentChestIn: 51, shoulderIn: 20.0, lengthIn: 31.5, sleeveIn: 27.0, collarIn: 17.5 },
];

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'kurta-pajama',
}) => {
  const isJacket =
    defaultCategory === 'jacket-set' ||
    defaultCategory === 'indo-western' ||
    defaultCategory === 'open-jodhpuri';
  const isShirt =
    defaultCategory === 'shirts' ||
    defaultCategory === 'shirt';

  const [activeTab, setActiveTab] = useState<'kurta' | 'jacket' | 'shirt'>(
    isShirt ? 'shirt' : isJacket ? 'jacket' : 'kurta'
  );
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [selectedBodyChest, setSelectedBodyChest] = useState<number>(40);
  const [fitPreference, setFitPreference] = useState<'classic' | 'tailored'>('classic');

  // Sync category when opened
  useEffect(() => {
    if (isOpen) {
      if (defaultCategory === 'shirts' || defaultCategory === 'shirt') {
        setActiveTab('shirt');
      } else if (
        defaultCategory === 'jacket-set' ||
        defaultCategory === 'indo-western' ||
        defaultCategory === 'open-jodhpuri'
      ) {
        setActiveTab('jacket');
      } else {
        setActiveTab('kurta');
      }
    }
  }, [isOpen, defaultCategory]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Measurement formatter helper
  const fmt = (valInInches: number): string => {
    if (unit === 'cm') {
      return `${Math.round(valInInches * 2.54)}`;
    }
    // Return formatted inches (e.g. 17.5, 40)
    return Number.isInteger(valInInches) ? `${valInInches}` : `${valInInches.toFixed(1)}`;
  };

  const fmtRange = (rangeInches: string): string => {
    if (unit === 'cm') {
      const parts = rangeInches.split('-').map((s) => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return `${Math.round(parts[0] * 2.54)} - ${Math.round(parts[1] * 2.54)}`;
      }
    }
    return rangeInches;
  };

  // Find recommended size based on user chest and fit preference
  const getRecommendedSize = () => {
    if (activeTab === 'kurta') {
      const found = KURTA_SIZES.find((s) => s.bodyChestIn === selectedBodyChest);
      if (found) {
        if (fitPreference === 'classic') {
          return {
            tag: found.tag,
            reason: `Size ${found.tag} provides a regal 3" to 4" garment ease across the chest for comfortable baithak seating and dancing.`,
          };
        } else {
          return {
            tag: found.tag,
            reason: `Size ${found.tag} tailored fit contours cleanly while preserving essential shoulder movement.`,
          };
        }
      }
      return { tag: 'L (42)', reason: 'Standard regular Indian festive fit.' };
    } else if (activeTab === 'jacket') {
      const found = JACKET_SIZES.find((s) => s.bodyChestIn === selectedBodyChest);
      if (found) {
        return {
          tag: found.tag,
          reason: `Size ${found.tag} features a 2" ease over your body chest, designed to button smoothly over an inner kurta without creasing.`,
        };
      }
      return { tag: 'L (42)', reason: 'Standard tailored Nehru jacket fit.' };
    } else {
      const found = SHIRT_SIZES.find((s) => s.bodyChestIn === selectedBodyChest);
      if (found) {
        return {
          tag: found.tag,
          reason: `Size ${found.tag} provides a refined 3" garment ease across the chest and comfortable ${found.collarIn}" collar circumference for effortless elegance.`,
        };
      }
      return { tag: 'L (42)', reason: 'Standard festive shirt fit.' };
    }
  };

  const recommendation = getRecommendedSize();

  const whatsappTailorUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
    `Hello Siddhant Ji, I am checking the Size Guide on Majanya Ji. My chest measurement is ${selectedBodyChest}" and I need advice for a ${
      activeTab === 'kurta' ? 'Kurta Pajama' : activeTab === 'jacket' ? 'Nehru Jacket' : 'Festive Shirt'
    } set. Could you guide me on the ideal size?`
  )}`;

  return (
    <div
      id="size-guide-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <div
        id="size-guide-modal-container"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#C9A227]/30 overflow-hidden"
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="bg-[#FAF7F2] border-b border-[#E5E5E3] px-5 sm:px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5A1A1A] text-[#C9A227] flex items-center justify-center shrink-0 shadow-sm">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                  Indian Ethnic Wear Standards
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#5A1A1A]/10 text-[#5A1A1A]">
                  Royal Fit
                </span>
              </div>
              <h2 id="size-guide-title" className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                Comprehensive Size Guide
              </h2>
            </div>
          </div>

          <button
            id="close-size-guide-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-colors"
            aria-label="Close Size Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= CONTROLS & TABS ================= */}
        <div className="px-5 sm:px-8 pt-4 pb-3 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Garment Category Tabs */}
          <div className="flex items-center p-1 bg-[#F4F1EA] rounded-xl border border-gray-200">
            <button
              id="tab-kurta-pajama"
              onClick={() => setActiveTab('kurta')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'kurta'
                  ? 'bg-[#5A1A1A] text-white shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              Kurta Pajama Set
            </button>
            <button
              id="tab-jacket-set"
              onClick={() => setActiveTab('jacket')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'jacket'
                  ? 'bg-[#5A1A1A] text-white shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-[#C9A227]" />
              Nehru Jacket & Bundi Set
            </button>
            <button
              id="tab-shirts"
              onClick={() => setActiveTab('shirt')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'shirt'
                  ? 'bg-[#5A1A1A] text-white shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Shirt className="w-3.5 h-3.5 text-[#C9A227]" />
              Festive & Casual Shirts
            </button>
          </div>

          {/* Inches / CM Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Unit:</span>
            <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200 text-xs font-semibold">
              <button
                id="unit-inches-btn"
                onClick={() => setUnit('in')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  unit === 'in' ? 'bg-white text-[#5A1A1A] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Inches (in)
              </button>
              <button
                id="unit-cm-btn"
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  unit === 'cm' ? 'bg-white text-[#5A1A1A] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>
        </div>

        {/* ================= SCROLLABLE CONTENT BODY ================= */}
        <div className="overflow-y-auto px-5 sm:px-8 py-5 space-y-6 flex-1 text-gray-800">
          {/* ================= INTERACTIVE SIZE RECOMMENDER ================= */}
          <div className="bg-[#FAF7F2] rounded-xl p-4 sm:p-5 border border-[#C9A227]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A1A1A] flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-[#C9A227]" />
                  Instant Size Matcher
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Select your exact body chest measurement to see your recommended fit.
                </p>
              </div>

              {/* Fit Preference Pill */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 text-[11px]">
                <button
                  onClick={() => setFitPreference('classic')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    fitPreference === 'classic'
                      ? 'bg-[#5A1A1A] text-white'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Classic Royal Fit
                </button>
                <button
                  onClick={() => setFitPreference('tailored')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    fitPreference === 'tailored'
                      ? 'bg-[#5A1A1A] text-white'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Tailored Fit
                </button>
              </div>
            </div>

            {/* Chest Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-700 mr-1">Your Bare Chest:</span>
              {[38, 40, 42, 44, 46, 48].map((chestVal) => (
                <button
                  key={chestVal}
                  onClick={() => setSelectedBodyChest(chestVal)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedBodyChest === chestVal
                      ? 'bg-[#5A1A1A] text-white border-[#5A1A1A] shadow-sm scale-105'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {chestVal}&quot; {unit === 'cm' && `(${Math.round(chestVal * 2.54)}cm)`}
                </button>
              ))}
            </div>

            {/* Recommended Size Output Banner */}
            <div className="bg-white rounded-lg p-3 border border-[#C9A227]/40 flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Your Recommended Match:</div>
                  <div className="text-sm font-bold text-[#5A1A1A] flex items-center gap-1.5">
                    <span>Size {recommendation.tag}</span>
                    <span className="text-[11px] font-normal text-gray-600">• {recommendation.reason}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SIZING TABLES ================= */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                {activeTab === 'kurta'
                  ? `Standard Indian Kurta Pajama Chart (${unit === 'in' ? 'Inches' : 'Centimeters'})`
                  : activeTab === 'jacket'
                  ? `Standard Nehru Jacket & Bundi Chart (${unit === 'in' ? 'Inches' : 'Centimeters'})`
                  : `Standard Festive & Casual Shirt Chart (${unit === 'in' ? 'Inches' : 'Centimeters'})`}
              </h3>
              <span className="text-[11px] text-gray-500 italic">
                Garment measurements include standard festive movement ease
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-xs">
              {activeTab === 'kurta' ? (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#5A1A1A] font-bold border-b border-gray-200">
                      <th className="py-3 px-3.5 border-r border-gray-200">Standard Size</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">To Fit Chest</th>
                      <th className="py-3 px-3.5 border-r border-gray-200 bg-[#C9A227]/10 text-[#5A1A1A]">
                        Garment Chest
                      </th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Shoulder</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Kurta Length</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Sleeve Length</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Pajama Waist</th>
                      <th className="py-3 px-3.5">Pajama Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {KURTA_SIZES.map((row) => {
                      const isSelected = row.bodyChestIn === selectedBodyChest;
                      return (
                        <tr
                          key={row.tag}
                          onClick={() => setSelectedBodyChest(row.bodyChestIn)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#5A1A1A]/5 font-semibold text-[#5A1A1A]'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <td className="py-3 px-3.5 border-r border-gray-200">
                            <span className="flex items-center gap-1.5 font-bold">
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#5A1A1A]" />}
                              {row.tag}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200 font-medium">
                            {fmt(row.bodyChestIn)}
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200 font-bold bg-[#C9A227]/5 text-[#5A1A1A]">
                            {fmt(row.garmentChestIn)}
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.shoulderIn)}</td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.lengthIn)}</td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.sleeveIn)}</td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmtRange(row.pajamaWaistIn)}</td>
                          <td className="py-3 px-3.5">{fmt(row.pajamaLengthIn)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : activeTab === 'jacket' ? (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#5A1A1A] font-bold border-b border-gray-200">
                      <th className="py-3 px-3.5 border-r border-gray-200">Standard Size</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">To Fit Chest</th>
                      <th className="py-3 px-3.5 border-r border-gray-200 bg-[#C9A227]/10 text-[#5A1A1A]">
                        Jacket Chest
                      </th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Jacket Waist</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Across Shoulder</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Jacket Length</th>
                      <th className="py-3 px-3.5">Armhole (Girth)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {JACKET_SIZES.map((row) => {
                      const isSelected = row.bodyChestIn === selectedBodyChest;
                      return (
                        <tr
                          key={row.tag}
                          onClick={() => setSelectedBodyChest(row.bodyChestIn)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#5A1A1A]/5 font-semibold text-[#5A1A1A]'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <td className="py-3 px-3.5 border-r border-gray-200">
                            <span className="flex items-center gap-1.5 font-bold">
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#5A1A1A]" />}
                              {row.tag}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200 font-medium">
                            {fmt(row.bodyChestIn)}
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200 font-bold bg-[#C9A227]/5 text-[#5A1A1A]">
                            {fmt(row.garmentChestIn)}
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.waistIn)}</td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.shoulderIn)}</td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.lengthIn)}</td>
                          <td className="py-3 px-3.5">{fmt(row.armholeIn)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#5A1A1A] font-bold border-b border-gray-200">
                      <th className="py-3 px-3.5 border-r border-gray-200">Standard Size</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">To Fit Chest</th>
                      <th className="py-3 px-3.5 border-r border-gray-200 bg-[#C9A227]/10 text-[#5A1A1A]">
                        Garment Chest
                      </th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Across Shoulder</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Shirt Length</th>
                      <th className="py-3 px-3.5 border-r border-gray-200">Sleeve Length</th>
                      <th className="py-3 px-3.5">Collar (Neck)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {SHIRT_SIZES.map((row) => {
                      const isSelected = row.bodyChestIn === selectedBodyChest;
                      return (
                        <tr
                          key={row.tag}
                          onClick={() => setSelectedBodyChest(row.bodyChestIn)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#5A1A1A]/5 font-semibold text-[#5A1A1A]'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <td className="py-3 px-3.5 border-r border-gray-200">
                            <span className="flex items-center gap-1.5 font-bold">
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#5A1A1A]" />}
                              {row.tag}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200 font-medium">
                            {fmt(row.bodyChestIn)}
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200 font-bold bg-[#C9A227]/5 text-[#5A1A1A]">
                            {fmt(row.garmentChestIn)}
                          </td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.shoulderIn)}</td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.lengthIn)}</td>
                          <td className="py-3 px-3.5 border-r border-gray-200">{fmt(row.sleeveIn)}</td>
                          <td className="py-3 px-3.5">{fmt(row.collarIn)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
              Tip: Click any size row above to highlight your corresponding measurements.
            </p>
          </div>

          {/* ================= HOW TO MEASURE GUIDE ================= */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#5A1A1A]" />
              How to Take Accurate Ethnic Wear Measurements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <div className="font-bold text-xs text-[#5A1A1A] mb-1">1. Chest (Fullest Girth)</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Wrap the measuring tape comfortably around the fullest part of your chest, passing directly beneath armpits. Keep tape snug without pulling tight.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <div className="font-bold text-xs text-[#5A1A1A] mb-1">2. Shoulder Breadth</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Measure from the outer bone tip of one shoulder horizontally across the high back curve to the other shoulder tip.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <div className="font-bold text-xs text-[#5A1A1A] mb-1">3. Garment Length</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {activeTab === 'kurta'
                    ? 'From the collar seam/highest shoulder point straight down to just below the knee.'
                    : 'From the highest shoulder point straight down to the hip line for optimal layered proportions.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <div className="font-bold text-xs text-[#5A1A1A] mb-1">4. Sleeve Length</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Start from the outer shoulder seam and measure down the relaxed arm to your wrist bone.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <div className="font-bold text-xs text-[#5A1A1A] mb-1">5. Pajama / Waist</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Our ethnic pajamas feature adaptable drawstrings and elastic inserts. Measure along the outside leg from natural waistline to ankle.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <div className="font-bold text-xs text-[#5A1A1A] mb-1">6. Between Sizes?</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  If your bare chest is between sizes (e.g. 41&quot;), always select the next size up (42 / L) for relaxed festive comfort and effortless movement.
                </p>
              </div>
            </div>
          </div>

          {/* ================= ETHNIC WEAR EASE EXPLANATION ================= */}
          <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#C9A227]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-gray-700">
              <span className="font-bold text-[#5A1A1A] block mb-0.5">
                Why does a Kurta have 3&quot; - 4&quot; of Garment Ease?
              </span>
              Unlike western slim shirts, Indian festive kurtas are traditionally designed with positive garment ease to ensure you can comfortably sit cross-legged for rituals (poojas), dance during baraat celebrations, and enjoy royal festive feasts.
            </div>
          </div>
        </div>

        {/* ================= MODAL FOOTER & WHATSAPP ASSISTANCE ================= */}
        <div className="bg-[#FAF7F2] border-t border-[#E5E5E3] px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Need bespoke alterations or sizing confirmation?</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              id="whatsapp-tailor-consult-btn"
              href={whatsappTailorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Ask Master Tailor on WhatsApp
            </a>

            <button
              id="close-size-guide-btn"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#5A1A1A] hover:bg-[#431313] text-white text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
