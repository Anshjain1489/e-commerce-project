import React from 'react';
import { Truck, ShieldCheck, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { BRAND } from '../constants';

export const ShippingPolicyPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5A1A1A] hover:underline mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#C9A227]/30 shadow-sm space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#C9A227] block mb-1">
              Nationwide Delivery
            </span>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#1E1E1E]">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs text-gray-400 mt-1">Last revised: January 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">1. Dispatch Origin & Timelines</h2>
              <p>
                All orders placed on Majanya Ji Ethnic Wear are dispatched directly from our central atelier located at{' '}
                <strong>323, Palhar Nagar, 60 Feet Road, Indore, Madhya Pradesh</strong>.
              </p>
              <p>
                Standard orders are processed, quality checked, and handed over to our verified courier partners within{' '}
                <strong>24 to 48 business hours</strong> of payment confirmation or COD verification.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">2. Delivery Estimates Across India</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai):</strong> 3 to 4 business days.</li>
                <li><strong>Tier-2 & Central Indian Cities (Bhopal, Jaipur, Ahmedabad, Lucknow, Pune):</strong> 2 to 4 business days.</li>
                <li><strong>Rest of India (North-East, Jammu & Kashmir, Rural Pincodes):</strong> 5 to 7 business days.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">3. Shipping Charges</h2>
              <p>
                • <strong>Orders Above ₹4,999:</strong> 100% FREE nationwide express shipping.<br />
                • <strong>Orders Below ₹4,999:</strong> A nominal flat shipping charge of ₹249 is applied to cover insured carriage.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">4. Order Tracking & WhatsApp Notifications</h2>
              <p>
                As soon as your package is scanned by our carrier, an SMS and WhatsApp tracking link will be sent to the phone number provided at checkout. You can also connect directly with Siddhant Jain at <strong>+91 7007457920</strong> for expedited delivery requests.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">5. Damaged or Tampered Packages</h2>
              <p>
                Please do not accept any parcel if the outer branded tamper-proof packaging appears opened or severed. Immediately record a short video/photo and inform us on WhatsApp at <strong>+91 7007457920</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
