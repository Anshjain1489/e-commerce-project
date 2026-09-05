import React from 'react';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { BRAND } from '../constants';

export const StoreLocationPage: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    '323 Palhar Nagar 60 Feet Road Indore Madhya Pradesh India'
  )}`;

  const appointmentUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
    'Hello Siddhant Ji, I would like to book a private styling session at your Indore store (323, Palhar Nagar, 60 Feet Road).'
  )}`;

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#C9A227] block mb-2">
            Flagship Atelier & Boutique
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1E1E1E] mb-4">
            Visit Our Indore Store
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
            Experience the richness of genuine fabrics, try custom silhouettes in our luxury trial suites, and meet Siddhant Jain for tailored wedding consultations.
          </p>
          <div className="w-16 h-0.5 bg-[#C9A227] mx-auto mt-4" />
        </div>

        {/* Highlight Banner with Visual Store Image */}
        <div className="relative aspect-[16/7] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C9A227]/40 mb-16 group">
          <img
            src="https://images.unsplash.com/photo-1608958435020-e8a7109ba809?q=85&w=1600&auto=format&fit=crop"
            alt="Majanya Ji Men's Ethnic Wear Indore Boutique"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-12 text-[#FAF7F2]">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#C9A227] mb-1">
              Historic Textile Capital of Central India
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold mb-3">
              Indore Boutique & Studio
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl mb-4 font-light">
              Located on the bustling 60 Feet Road in Palhar Nagar, our store offers an intimate, personalized royal wardrobe experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#C9A227] hover:bg-[#e0ba42] text-[#3D1010] text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions on Google Maps</span>
              </a>
              <a
                href={appointmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Book Bespoke Appointment</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3 Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Address */}
          <div className="bg-white rounded-2xl p-8 border border-[#C9A227]/30 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto mb-4 text-[#5A1A1A]">
              <MapPin className="w-6 h-6 text-[#C9A227]" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-[#1E1E1E] mb-2">Location</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              323, Palhar Nagar<br />
              60 Feet Road, Indore<br />
              Madhya Pradesh - 452006
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#5A1A1A] hover:underline inline-flex items-center gap-1"
            >
              Open Map <Navigation className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Timings */}
          <div className="bg-white rounded-2xl p-8 border border-[#C9A227]/30 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto mb-4 text-[#5A1A1A]">
              <Clock className="w-6 h-6 text-[#C9A227]" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-[#1E1E1E] mb-2">Store Hours</h3>
            <p className="text-sm font-bold text-[#5A1A1A] mb-1">
              10:30 AM – 9:30 PM
            </p>
            <p className="text-xs text-emerald-700 font-semibold mb-4">
              Open 7 Days a Week (Mon – Sun)
            </p>
            <span className="text-[11px] text-gray-400">
              Walk-ins warmly welcomed anytime
            </span>
          </div>

          {/* Contact Person */}
          <div className="bg-white rounded-2xl p-8 border border-[#C9A227]/30 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto mb-4 text-[#5A1A1A]">
              <Phone className="w-6 h-6 text-[#C9A227]" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-[#1E1E1E] mb-1">Host & Stylist</h3>
            <p className="text-sm font-bold text-[#1E1E1E] mb-2">Siddhant Jain</p>
            <div className="text-xs text-gray-600 space-y-1 mb-4">
              <p>Direct Call: <a href={BRAND.phoneLink} className="font-semibold hover:underline">{BRAND.phone}</a></p>
              <p>WhatsApp: <a href={BRAND.whatsAppLink} className="font-semibold text-[#25D366] hover:underline">{BRAND.whatsApp}</a></p>
            </div>
            <a
              href={BRAND.whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#25D366] hover:underline inline-flex items-center gap-1"
            >
              Direct WhatsApp <MessageCircle className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Why Visit Section */}
        <div className="bg-[#5A1A1A] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#C9A227] shadow-xl">
          <h2 className="font-cinzel text-2xl font-bold text-center mb-10 text-[#C9A227]">
            Exclusive In-Store Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="bg-[#3D1010]/80 p-5 rounded-xl border border-[#C9A227]/20">
              <h4 className="font-serif font-bold text-sm text-[#FAF7F2] mb-1.5 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#C9A227]" />
                Live Trial Suites
              </h4>
              <p className="text-[#FAF7F2]/80 leading-relaxed font-light">
                Spacious mirror suites to evaluate the fall, silhouette, and movement of Jodhpuris and Indo Western suits.
              </p>
            </div>

            <div className="bg-[#3D1010]/80 p-5 rounded-xl border border-[#C9A227]/20">
              <h4 className="font-serif font-bold text-sm text-[#FAF7F2] mb-1.5 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#C9A227]" />
                Custom Alterations & Snag-Fits
              </h4>
              <p className="text-[#FAF7F2]/80 leading-relaxed font-light">
                On-site master tailors to adjust sleeves, chest taper, and trouser lengths for immediate perfection.
              </p>
            </div>

            <div className="bg-[#3D1010]/80 p-5 rounded-xl border border-[#C9A227]/20">
              <h4 className="font-serif font-bold text-sm text-[#FAF7F2] mb-1.5 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#C9A227]" />
                Bespoke Fabric Catalogues
              </h4>
              <p className="text-[#FAF7F2]/80 leading-relaxed font-light">
                Browse through hundreds of exclusive raw silk, brocade, and velvet swatches not listed on the web catalog.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
