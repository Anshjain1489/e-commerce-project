import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { BRAND } from '../constants';

export const TermsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
              Legal Agreement
            </span>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#1E1E1E]">
              Terms & Conditions
            </h1>
            <p className="text-xs text-gray-400 mt-1">Effective Date: January 1, 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">1. Acceptance of Terms</h2>
              <p>
                By browsing, accessing, or placing an order on the digital store of <strong>Majanya Ji Ethnic Wear</strong>, you agree to be legally bound by these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">2. Product Authenticity & Color Representation</h2>
              <p>
                All Majanya Ji garments are crafted from genuine raw fabrics and hand embroidery. Due to varying digital screen color calibrations and photographic lighting, subtle variations in thread tint or shade are natural characteristics of authentic handwoven textiles.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">3. Pricing & Taxes</h2>
              <p>
                All prices listed in our catalog are quoted in Indian Rupees (₹ INR) and include all applicable GST. We reserve the right to revise catalog prices without prior notice.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">4. Jurisdiction & Governing Law</h2>
              <p>
                These terms are governed and construed in accordance with the laws of India. Any disputes arising in connection with orders or store interactions shall be subject to the exclusive jurisdiction of the competent courts in <strong>Indore, Madhya Pradesh</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
