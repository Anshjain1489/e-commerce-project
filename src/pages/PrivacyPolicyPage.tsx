import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
              Data Protection & Privacy
            </span>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#1E1E1E]">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-400 mt-1">Effective Date: January 1, 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">1. Commitment to Your Privacy</h2>
              <p>
                Majanya Ji Ethnic Wear (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operating from 323, Palhar Nagar, 60 Feet Road, Indore, Madhya Pradesh, values the trust you place in us. This Privacy Policy details how we handle personal information gathered through our digital store.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">2. Information We Collect</h2>
              <p>
                When you create an account, purchase products, or reach out on WhatsApp, we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Contact details: Name, email address, phone/WhatsApp number, delivery address.</li>
                <li>Transaction records: Order items, payment confirmation IDs, coupon codes used.</li>
                <li>Measurement preferences: Size notes shared for custom tailoring.</li>
              </ul>
              <p>
                We do NOT store your credit card numbers, CVVs, or bank passwords. All payments are securely routed via PCI-DSS compliant gateways such as Razorpay.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">3. How We Use Information</h2>
              <p>
                Your information is used strictly to process orders, dispatch parcels through trusted shipping couriers, communicate order updates on WhatsApp, and improve your shopping experience. We never sell or rent your personal data to third-party marketing brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[#5A1A1A]">4. Contact Us</h2>
              <p>
                If you wish to update or delete your contact details, please contact Siddhant Jain directly at <strong>+91 7067299101</strong> or via email.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
