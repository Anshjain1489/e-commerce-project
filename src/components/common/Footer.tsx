import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Send,
  Sparkles,
  Check,
  Mail,
} from 'lucide-react';
import { BRAND } from '../../constants';
import { useShop } from '../../context/ShopContext';

export const Footer: React.FC<{
  onNavigate: (path: string) => void;
  onOpenSizeGuide?: () => void;
}> = ({ onNavigate, onOpenSizeGuide }) => {
  const { subscribeNewsletter, settings } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      const ok = subscribeNewsletter(newsletterEmail);
      if (ok) {
        setSubscribed(true);
        setNewsletterEmail('');
        setTimeout(() => setSubscribed(false), 5000);
      }
    }
  };

  return (
    <footer className="bg-white text-[#1A1A1A] border-t border-[#E5E5E3]">
      {/* Top Banner Feature Bar */}
      <div className="border-b border-[#E5E5E3] py-6 bg-[#F9F9F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center text-[#1A1A1A]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs tracking-wider uppercase text-[#1A1A1A]">
                  Master Craftsmanship
                </h4>
                <p className="text-xs text-[#8A8A88]">Pure fabrics & refined embroidered details</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center text-[#1A1A1A]">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs tracking-wider uppercase text-[#1A1A1A]">
                  Personal Stylist Support
                </h4>
                <p className="text-xs text-[#8A8A88]">Direct WhatsApp styling with Siddhant Jain</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center text-[#1A1A1A]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs tracking-wider uppercase text-[#1A1A1A]">
                  Flagship Store in Indore
                </h4>
                <p className="text-xs text-[#8A8A88]">323, Palhar Nagar, 60 Feet Road</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div>
              <span className="text-base font-semibold tracking-wider text-[#1A1A1A]">
                {BRAND.name}
              </span>
              <p className="text-[10px] text-[#8A8A88] tracking-[0.2em] font-medium uppercase mt-0.5">
                {BRAND.subtitle}
              </p>
            </div>
            <p className="text-xs text-[#8A8A88] leading-relaxed font-light">
              Premium ethnic fashion designed for celebrations, weddings, and special moments. Tailored craftsmanship re-imagined for the modern gentleman.
            </p>
            <div className="flex items-center space-x-2.5 pt-2">
              <a
                id="footer-ig-link"
                href={settings.instagramUrl || BRAND.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                id="footer-fb-link"
                href={settings.facebookUrl || BRAND.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                id="footer-wa-link"
                href={BRAND.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center text-[#1A1A1A] hover:bg-[#25D366] hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-[0.15em] uppercase font-semibold text-[#1A1A1A] border-b border-[#E5E5E3] pb-2">
              Collections
            </h3>
            <ul className="space-y-2 text-xs text-[#8A8A88]">
              <li>
                <button
                  onClick={() => onNavigate('/category/kurta-pajama')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Kurta Pajama
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/jacket-set')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Jacket Set
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/indo-western')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Indo Western
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/open-jodhpuri')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Open Jodhpuri
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/shirts')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Shirts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/shop')}
                  className="hover:text-[#1A1A1A] transition-colors font-medium text-[#1A1A1A]"
                >
                  New Arrivals & Bestsellers →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-[0.15em] uppercase font-semibold text-[#1A1A1A] border-b border-[#E5E5E3] pb-2">
              Customer Service
            </h3>
            <ul className="space-y-2 text-xs text-[#8A8A88]">
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/store-location')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Visit Physical Store (Indore)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/shipping-policy')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  id="footer-size-guide-btn"
                  onClick={() => {
                    if (onOpenSizeGuide) {
                      onOpenSizeGuide();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-size-guide'));
                    }
                  }}
                  className="hover:text-[#1A1A1A] transition-colors font-medium text-[#5A1A1A] flex items-center gap-1"
                >
                  Ethnic Wear Size Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/return-policy')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Return & Exchange Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy-policy')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/terms-and-conditions')}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs tracking-[0.15em] uppercase font-semibold text-[#1A1A1A] border-b border-[#E5E5E3] pb-2">
              Retail Store & Contact
            </h3>
            <div className="space-y-3 text-xs text-[#8A8A88]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#8A8A88] shrink-0 mt-0.5" />
                <span>
                  323, Palhar Nagar<br />
                  60 Feet Road, Indore<br />
                  Madhya Pradesh, India
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#8A8A88] shrink-0" />
                <a
                  href={BRAND.phoneLink}
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Siddhant Jain: <span className="font-medium text-[#1A1A1A]">+91 7067299101</span>
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <a
                  href={BRAND.whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  WhatsApp: <span className="font-medium text-[#1A1A1A]">+91 7007457920</span>
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#8A8A88] shrink-0" />
                <a
                  href="mailto:anshjain1440@gmail.com"
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Support: <span className="font-medium text-[#1A1A1A]">anshjain1440@gmail.com</span>
                </a>
              </div>

              {/* Newsletter subscription widget */}
              <div className="pt-2">
                <p className="text-[11px] font-medium text-[#1A1A1A] mb-1.5 uppercase tracking-wider">
                  Newsletter
                </p>
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-[#F9F9F8] text-[#1A1A1A] text-xs px-3 py-2 rounded-l border border-[#E5E5E3] focus:outline-none focus:border-[#1A1A1A]"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] text-white px-3 py-2 rounded-r hover:bg-black transition-colors font-medium text-xs flex items-center justify-center"
                    aria-label="Subscribe"
                  >
                    {subscribed ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </form>
                {subscribed && (
                  <p className="text-[11px] text-[#1A1A1A] mt-1">Thank you for subscribing!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-[#E5E5E3] py-5 text-center text-xs text-[#8A8A88] font-light">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Majanya Ji Ethnic Wear. All Rights Reserved.</p>
          <p className="text-[#8A8A88]">Minimalist Elegance For Every Celebration</p>
        </div>
      </div>
    </footer>
  );
};
