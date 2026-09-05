import React from 'react';
import { Sparkles, MapPin, Award, Users, ArrowRight, MessageCircle } from 'lucide-react';
import { BRAND } from '../constants';

export const AboutPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#C9A227] block mb-2">
            The Majanya Ji Legacy
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1E1E1E] mb-6 leading-tight">
            Crafting Royal Splendor for the Modern Gentleman
          </h1>
          <p className="font-serif text-base sm:text-lg text-gray-700 italic leading-relaxed">
            &ldquo;Every thread carries a tradition; every garment tells a story of royal celebration.&rdquo;
          </p>
          <div className="w-20 h-0.5 bg-[#C9A227] mx-auto mt-6" />
        </div>

        {/* Story Section with Visual Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed font-light">
            <h2 className="font-cinzel text-2xl font-bold text-[#5A1A1A]">
              Born in Indore, Celebrated Across India
            </h2>
            <p>
              Founded under the visionary craftsmanship of <strong className="font-semibold text-gray-900">Siddhant Jain</strong>, <strong>Majanya Ji Ethnic Wear</strong> was born out of a profound admiration for classic Indian heritage textiles and imperial court tailoring.
            </p>
            <p>
              Operating from our flagship studio and retail store located at <strong className="text-gray-900">323, Palhar Nagar, 60 Feet Road, Indore</strong>, we have preserved ancestral hand-embroidery techniques while engineering sleek modern cuts that keep every groom, brother, and wedding guest impeccably comfortable.
            </p>
            <p>
              From our signature raw silk Kurta Pajama ensembles to heavily embroidered Velvet Jacket Sets, contemporary asymmetric Indo Western creations, and imperial Open Jodhpuris, every piece is sculpted to command admiration.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/store-location')}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5A1A1A] hover:text-[#C9A227] transition-colors"
              >
                <span>Visit Our Indore Atelier</span>
                <ArrowRight className="w-4 h-4 text-[#C9A227]" />
              </button>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C9A227]/40">
            <img
              src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=85&w=1200&auto=format&fit=crop"
              alt="Majanya Ji Bespoke Men's Ethnic Wear Atelier"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
              <div className="text-[#FAF7F2]">
                <p className="font-cinzel text-lg font-bold text-[#C9A227]">Atelier & Flagship Store</p>
                <p className="text-xs text-white/90">323, Palhar Nagar, 60 Feet Road, Indore (M.P.)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#C9A227]/30 shadow-md mb-20">
          <h2 className="font-cinzel text-2xl font-bold text-[#1E1E1E] text-center mb-10">
            The 4 Pillars of Majanya Ji
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto text-[#5A1A1A]">
                <Sparkles className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-[#1E1E1E]">Authentic Weaves</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Only pure dupion silks, woven jacquards, rich velvets, and organic linen blends touch our cutting tables.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto text-[#5A1A1A]">
                <Award className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-[#1E1E1E]">Master Tailoring</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Every collar, cuff, placket, and hem is inspected to ensure flawless fit across all Indian body frames.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto text-[#5A1A1A]">
                <MapPin className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-[#1E1E1E]">Nationwide Care</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Secure doorstep dispatch to every pin code in India with 24-48 hour processing.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto text-[#5A1A1A]">
                <Users className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-[#1E1E1E]">Direct Stylist</h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Personal WhatsApp consultation with Siddhant Jain for size matching and bespoke groomsmen packs.
              </p>
            </div>
          </div>
        </div>

        {/* Quote Banner */}
        <div className="bg-[#3D1010] text-[#FAF7F2] rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden border border-[#C9A227]">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#C9A227] block mb-2">
            Founder&apos;s Message
          </span>
          <h2 className="font-cinzel text-xl sm:text-3xl font-bold mb-4">
            &ldquo;When a man wears royal Indian attire, he should feel commanding, rooted, and timeless.&rdquo;
          </h2>
          <p className="text-xs sm:text-sm text-[#FAF7F2]/80 font-light mb-6">
            — Siddhant Jain, Majanya Ji Ethnic Wear, Indore
          </p>
          <a
            href={BRAND.whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#20bd5a] transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect Directly with Siddhant Jain</span>
          </a>
        </div>
      </div>
    </div>
  );
};
