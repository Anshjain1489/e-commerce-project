import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { BRAND } from '../../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const POPULAR_SEARCHES = [
  'Royal Blue Kurta',
  'Black Velvet Jacket',
  'Ivory Jodhpuri',
  'Indo Western',
  'Wedding Collection',
  'Silk Pajama',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { products } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalized = searchTerm.trim().toLowerCase();
  const filteredProducts = normalized
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(normalized) ||
          p.categoryName.toLowerCase().includes(normalized) ||
          p.fabric.toLowerCase().includes(normalized) ||
          p.colors.some((c) => c.name.toLowerCase().includes(normalized))
      )
    : [];

  const handleSelectProduct = (slug: string) => {
    onNavigate(`/product/${slug}`);
    onClose();
  };

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-10 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-[#E5E5E3] mt-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E3] flex items-center gap-3 bg-[#F9F9F8]">
          <Search className="w-5 h-5 text-[#1A1A1A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search men's kurtas, jacket sets, jodhpuri, fabrics..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#1A1A1A] placeholder-[#8A8A88] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#8A8A88] hover:text-[#1A1A1A] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A8A88] hover:text-[#1A1A1A] rounded-lg hover:bg-[#E5E5E3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Default state: Popular searches & quick categories */}
          {!searchTerm ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleQuickSearch(term)}
                      className="px-3 py-1.5 bg-[#F0F0EE] hover:bg-[#1A1A1A] hover:text-white border border-[#E5E5E3] text-xs text-[#1A1A1A] rounded-full transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8A88] mb-3">
                  Explore by Category
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onNavigate('/category/kurta-pajama');
                      onClose();
                    }}
                    className="p-3 bg-[#F9F9F8] rounded-xl text-left hover:border-[#1A1A1A] border border-[#E5E5E3] font-medium text-[#1A1A1A]"
                  >
                    Kurta Pajama Collection →
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/category/jacket-set');
                      onClose();
                    }}
                    className="p-3 bg-[#F9F9F8] rounded-xl text-left hover:border-[#1A1A1A] border border-[#E5E5E3] font-medium text-[#1A1A1A]"
                  >
                    Jacket Set Collection →
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/category/indo-western');
                      onClose();
                    }}
                    className="p-3 bg-[#F9F9F8] rounded-xl text-left hover:border-[#1A1A1A] border border-[#E5E5E3] font-medium text-[#1A1A1A]"
                  >
                    Indo Western Outfits →
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/category/open-jodhpuri');
                      onClose();
                    }}
                    className="p-3 bg-[#F9F9F8] rounded-xl text-left hover:border-[#1A1A1A] border border-[#E5E5E3] font-medium text-[#1A1A1A]"
                  >
                    Open Jodhpuri Collection →
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/category/shirts');
                      onClose();
                    }}
                    className="p-3 bg-[#F9F9F8] rounded-xl text-left hover:border-[#1A1A1A] border border-[#E5E5E3] font-medium text-[#1A1A1A]"
                  >
                    Shirts Collection →
                  </button>
                </div>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            /* Results found */
            <div className="space-y-3">
              <p className="text-xs text-[#8A8A88] mb-2 font-medium">
                Found {filteredProducts.length} results matching &ldquo;{searchTerm}&rdquo;
              </p>
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p.slug)}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-[#F9F9F8] border border-transparent hover:border-[#E5E5E3] transition-all cursor-pointer group"
                >
                  <div className="w-14 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#8A8A88] font-medium">
                      {p.categoryName}
                    </span>
                    <h4 className="text-sm font-medium text-[#1A1A1A] group-hover:text-black truncate">
                      {p.name}
                    </h4>
                    <p className="text-xs text-[#8A8A88] truncate">{p.fabric}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </p>
                    {p.originalPrice > p.price && (
                      <p className="text-[11px] text-[#8A8A88] line-through">
                        ₹{p.originalPrice.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8A88] group-hover:text-[#1A1A1A] group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            /* No results state */
            <div className="text-center py-8">
              {/(women|woman|saree|sari|lehenga|choli|salwar|ladies|female|girl)/i.test(searchTerm) ? (
                <div className="max-w-md mx-auto">
                  <div className="w-10 h-10 rounded-full bg-[#F0F0EE] flex items-center justify-center mx-auto mb-3 text-lg">
                    👔
                  </div>
                  <p className="text-base font-medium text-[#1A1A1A] mb-1.5">
                    Exclusively Men&apos;s Royal Ethnic Wear
                  </p>
                  <p className="text-xs text-[#8A8A88] mb-5 leading-relaxed">
                    Majanya Ji specializes exclusively in Men&apos;s ethnic wear (Kurta Pajamas, Jacket Sets, Indo Western &amp; Open Jodhpuri). We do not carry women&apos;s clothing.
                  </p>
                  <button
                    onClick={() => {
                      onNavigate('/shop');
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-xs font-medium rounded-full hover:bg-black transition-colors"
                  >
                    Explore Men&apos;s Collection →
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-base font-medium text-[#1A1A1A] mb-1">
                    No matching garments found
                  </p>
                  <p className="text-xs text-[#8A8A88] max-w-sm mx-auto mb-5">
                    We couldn&apos;t find any item matching &ldquo;{searchTerm}&rdquo;. Looking for bespoke sizing or a customized outfit? Connect directly with Siddhant Jain.
                  </p>
                  <a
                    href={`https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
                      `Hello Siddhant Ji, I was searching for "${searchTerm}" on your website. Do you have similar ethnic wear available in your Indore store?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-xs font-medium rounded-full hover:bg-black transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    Ask Siddhant Jain on WhatsApp
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#F9F9F8] border-t border-[#E5E5E3] text-center text-xs text-[#8A8A88] flex items-center justify-between px-5">
          <span>Press ESC or click outside to close</span>
          <button
            onClick={() => {
              onNavigate('/shop');
              onClose();
            }}
            className="text-[#1A1A1A] font-medium hover:underline"
          >
            View Entire Catalog →
          </button>
        </div>
      </div>
    </div>
  );
};
