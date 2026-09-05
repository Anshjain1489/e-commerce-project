import React from 'react';
import { RotateCcw, ShieldCheck, ArrowLeft, MessageCircle } from 'lucide-react';
import { BRAND } from '../constants';

export const ReturnPolicyPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
              Hassle-Free Sizing & Exchanges
            </span>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#1E1E1E]">
              Return & Exchange Policy
            </h1>
            <p className="text-xs text-gray-400 mt-1">Last revised: January 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">1. 7-Day Easy Sizing Exchange Window</h2>
              <p>
                We understand that wedding ethnic wear requires an exacting, majestic fit. If your garment does not fit as comfortably as anticipated, you may request a size exchange or store credit within <strong>7 days</strong> of delivery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">2. Eligibility Conditions for Return & Exchange</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>The garment must be unused, unwashed, and unstained (no deodorants, perfumes, or food stains).</li>
                <li>All original brand tags, zardozi tassels, and fabric swatches must be intact.</li>
                <li>Items must be returned in their original protective garment bag or box.</li>
                <li>Custom bespoke orders with personalized monogramming or custom body measurements are final sale.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">3. How to Initiate an Exchange</h2>
              <p>
                To request an exchange, simply send a message on WhatsApp to Siddhant Jain at{' '}
                <a href={BRAND.whatsAppLink} className="text-[#25D366] font-bold hover:underline">
                  +91 7007457920
                </a>{' '}
                with your Order ID and preferred size. Our team will arrange a reverse pickup from your doorstep.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">4. Refunds & Store Credits</h2>
              <p>
                For approved returns, refunds are credited back to the original payment source (Razorpay UPI/Card) within 5 to 7 business days following inspection at our Indore atelier. For Cash on Delivery orders, refunds are issued via direct UPI or bank transfer.
              </p>
            </section>
          </div>

          <div className="p-4 bg-[#FAF7F2] border border-[#C9A227]/30 rounded-xl flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-[#5A1A1A] block">Have questions regarding an exchange?</span>
              <span className="text-gray-500">Siddhant Jain is available to assist you personally.</span>
            </div>
            <a
              href={BRAND.whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#20bd5a]"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
