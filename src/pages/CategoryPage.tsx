import React, { useState, useMemo } from 'react';
import { ArrowLeft, Star, ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { SORT_OPTIONS, BRAND } from '../constants';
import { useCategorySEO } from '../utils/seo';

interface CategoryPageProps {
  categorySlug?: string;
  categoryId?: string;
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  categoryId,
  onNavigate,
  onQuickView,
}) => {
  const { categories, products } = useShop();

  const [sortBy, setSortBy] = useState('newest');

  const effectiveId = categorySlug || categoryId;
  const currentCategory = categories.find(
    (c) => c.slug === effectiveId || c.id === effectiveId
  ) || categories[0];

  const categoryProducts = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.categoryId === currentCategory.id ||
          p.categoryName.toLowerCase() === currentCategory.name.toLowerCase()
      )
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'bestseller') return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [products, currentCategory, sortBy]);

  // Dynamically update meta tags (title, description, Open Graph, Twitter, Schema.org CollectionPage) for this category
  useCategorySEO(currentCategory, {
    productCount: categoryProducts.length,
  });

  // Other categories for exploration
  const otherCategories = categories.filter((c) => c.id !== currentCategory.id);

  return (
    <div className="w-full bg-[#F9F9F8] min-h-screen text-[#1A1A1A]">
      {/* Category Banner */}
      <section className="relative h-64 sm:h-80 md:h-96 flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        <img
          src={currentCategory.image}
          alt={currentCategory.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/70" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <button
            onClick={() => onNavigate('/shop')}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Men&apos;s Collections
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] uppercase tracking-[0.2em] text-white/90 font-medium mb-3">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Exclusively Men&apos;s Ethnic Wear</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-light tracking-tight mb-3">
            Men&apos;s {currentCategory.name}
          </h1>

          <p className="text-xs sm:text-base text-white/80 max-w-xl mx-auto font-light leading-relaxed">
            {currentCategory.description}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/70">
            <span>{categoryProducts.length} Handcrafted Designs in Stock</span>
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sort & Action Bar */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E5E5E3] mb-8">
          <p className="text-xs sm:text-sm text-[#8A8A88]">
            Showing <strong className="text-[#1A1A1A] font-medium">{categoryProducts.length}</strong> designs in{' '}
            <span className="text-[#1A1A1A] font-medium">Men&apos;s {currentCategory.name}</span>
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#8A8A88] hidden sm:inline">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white text-xs sm:text-sm font-medium text-[#1A1A1A] border border-[#E5E5E3] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1A1A1A]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoryProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        {/* Bespoke Sizing Support Banner */}
        <div className="mt-16 bg-[#1A1A1A] text-white rounded-xl p-6 sm:p-10 border border-[#E5E5E3] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/70 block mb-1">
              Bespoke Men&apos;s Tailoring
            </span>
            <h3 className="text-xl sm:text-2xl font-light tracking-tight mb-2">
              Looking for Custom Fit or Wedding Groomsmen Outfits?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl font-light leading-relaxed">
              We specialize in custom sizing for grooms, wedding guests, and festive ceremonies. Connect directly with Siddhant Jain for tailored fittings and fabric swatches in Indore or via WhatsApp video call.
            </p>
          </div>
          <a
            href={`https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
              `Hello Siddhant Ji, I am inquiring about custom tailored Men's ${currentCategory.name} outfits for an upcoming wedding celebration.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white hover:bg-[#F0F0EE] text-[#1A1A1A] text-xs font-medium uppercase tracking-wider rounded-lg shadow-sm shrink-0 transition-colors"
          >
            Chat with Siddhant on WhatsApp
          </a>
        </div>

        {/* Explore Other Collections */}
        <div className="mt-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#8A8A88] block mb-1">
              Gentlemen&apos;s Wardrobe
            </span>
            <h3 className="text-xl sm:text-2xl font-medium text-[#1A1A1A]">
              Explore More Men&apos;s Collections
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherCategories.slice(0, 3).map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate(`/category/${cat.slug}`)}
                className="group relative h-48 rounded-xl overflow-hidden cursor-pointer shadow-xs border border-[#E5E5E3] hover:border-[#1A1A1A] transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h4 className="text-lg font-medium tracking-wide">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-white/80 line-clamp-1 font-light">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
