import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { BRAND } from '../../constants';

export const WhatsAppButton: React.FC<{ customMessage?: string }> = ({ customMessage }) => {
  const [isHovered, setIsHovered] = useState(false);

  const message = customMessage || BRAND.defaultWhatsAppMessage;
  const whatsappUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-[#25D366]/20"
        aria-label="Chat with Siddhant Jain on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />

        {/* Pulse ripple */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none -z-10"></span>
      </a>

      {isHovered && (
        <div className="hidden sm:block bg-[#1A1A1A] text-white text-xs py-1.5 px-3 rounded-md shadow-md border border-[#E5E5E3] whitespace-nowrap">
          <p className="font-medium text-white">Chat on WhatsApp</p>
          <p className="text-[11px] text-[#8A8A88]">+91 7007457920 (Siddhant Jain)</p>
        </div>
      )}
    </div>
  );
};
