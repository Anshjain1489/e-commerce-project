import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "✨ Exclusively Men's Luxury Ethnic Wear | Nationwide Delivery",
  '🚚 Handcrafted Kurta Pajama, Jacket Sets, Indo Western & Open Jodhpuri',
  "🎉 Explore Our Latest Men's Wedding & Festive Collection",
];

export const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white text-[#1A1A1A] text-[11px] sm:text-xs py-2 px-4 text-center tracking-[0.15em] border-b border-[#E5E5E3] transition-all overflow-hidden font-medium">
      <div className="flex items-center justify-center min-h-[18px]">
        <span
          key={index}
          className="transition-opacity duration-500 ease-in-out opacity-100 flex items-center justify-center gap-2 text-[#8A8A88]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] inline-block"></span>
          <span className="text-[#1A1A1A]">{MESSAGES[index]}</span>
        </span>
      </div>
    </div>
  );
};
