import React, { useState, useMemo } from 'react';
import { Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { SIZES, AVAILABLE_COLORS, SORT_OPTIONS } from '../constants';
import { usePageSEO } from '../utils/seo';

interface ShopPageProps {
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
  initialCategory?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onNavigate,
  onQuickView,
  initialCategory,
}) => {
  const { products, categories } = useShop();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Dynamic meta tags for Shop
  usePageSEO({
    title: selectedCategory !== 'all' ? `${selectedCategory} Collection - Men's Ethnic Wear` : "Shop All Men's Ethnic Wear",
    description: "Browse the complete collection of handcrafted men's ethnic wear at Majanya Ji. Discover Kurta Pajamas, Designer Jacket Sets, Royal Indo Western, and Open Jodhpuris with bespoke tailoring.",
    canonicalUrl: typeof window !== 'undefined' ? `${window.location.origin}/shop` : undefined,
    type: 'website',
  });

  // Toggle helpers
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(15000);
    setInStockOnly(false);
    setSortBy('newest');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (p.categoryId !== selectedCategory && p.categoryName.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }
        // Price filter
        if (p.price > priceRange) return false;
        // Size filter
        if (selectedSizes.length > 0) {
          const hasSize = selectedSizes.some((s) => p.sizes.includes(s));
          if (!hasSize) return false;
        }
        // Color filter
        if (selectedColors.length > 0) {
          const hasColor = selectedColors.some((c) => p.colors.some((pc) => pc.name.toLowerCase() === c.toLowerCase()));
          if (!hasColor) return false;
        }
        // Stock filter
        if (inStockOnly && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'bestseller') return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
        if (sortBy === 'rating') return b.rating - a.rating;
        // default newest
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
  }, [products, selectedCategory, priceRange, selectedSizes, selectedColors, inStockOnly, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    priceRange < 15000 ||
    inStockOnly;

  return (
    <div className="w-full bg-[#F9F9F8] min-h-screen py-8 sm:py-12 text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8A8A88] block mb-1">
            Men&apos;s Royal Collection
          </span>
          <h1 className="text-2xl sm:text-4xl font-medium text-[#1A1A1A]">
            {selectedCategory === 'all'
              ? "All Men's Wear"
              : `Men's ${categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.name || 'Ethnic Wear'}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8A88] mt-1.5">
            Discover {filteredProducts.length} handcrafted men&apos;s ethnic outfits for weddings, festivities, and celebrations.
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-white border border-[#E5E5E3] text-[11px] text-[#4A4A48] font-medium">
            <span>👑 Exclusive 100% Men&apos;s Ethnic Fashion House</span>
          </div>
        </div>

        {/* Top Controls Bar: Mobile filter button & Desktop Sorting */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E5E5E3] mb-8">
          {/* Mobile filter toggle */}
          <button
            id="mobile-filter-open-btn"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E3] rounded-lg text-xs font-medium text-[#1A1A1A] shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#1A1A1A]" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          {/* Active filter count for desktop */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#8A8A88]">
            <span>Showing <strong className="text-[#1A1A1A] font-medium">{filteredProducts.length}</strong> creations</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[#1A1A1A] underline ml-3 font-medium cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider text-[#8A8A88]">
              Sort By:
            </span>
            <div className="relative">
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white text-xs sm:text-sm font-medium text-[#1A1A1A] border border-[#E5E5E3] rounded-lg px-3 sm:px-4 py-2 pr-8 focus:outline-none focus:border-[#1A1A1A]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8A8A88] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Product Grid */}
        <div className="flex gap-8 items-start">
          {/* ================= DESKTOP FILTER SIDEBAR ================= */}
          <aside className="hidden lg:block w-64 bg-white p-6 rounded-xl border border-[#E5E5E3] shadow-xs shrink-0 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3] mb-6">
              <h3 className="text-sm font-medium text-[#1A1A1A] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#1A1A1A]" />
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-[#8A8A88] hover:text-[#1A1A1A] underline font-medium cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A88] mb-3">
                Category
              </h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-[#1A1A1A] text-white font-medium'
                      : 'text-[#1A1A1A] hover:bg-[#F9F9F8]'
                  }`}
                >
                  <span>All Categories</span>
                  <span>{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id || p.categoryName === cat.name).length;
                  const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex justify-between ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white font-medium'
                          : 'text-[#1A1A1A] hover:bg-[#F9F9F8]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[#8A8A88]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6 pt-4 border-t border-[#E5E5E3]">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A88]">
                  Price Range
                </h4>
                <span className="text-xs font-medium text-[#1A1A1A]">
                  Up to ₹{priceRange.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="3000"
                max="15000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#1A1A1A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8A8A88] mt-1">
                <span>₹3,000</span>
                <span>₹15,000+</span>
              </div>
            </div>

            {/* Size Filter */}
            <div className="mb-6 pt-4 border-t border-[#E5E5E3]">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A88] mb-3">
                Size
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`min-w-9 h-8 px-2 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'border-[#E5E5E3] text-[#1A1A1A] hover:border-[#1A1A1A]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Filter */}
            <div className="mb-6 pt-4 border-t border-[#E5E5E3]">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A88] mb-3">
                Color
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {AVAILABLE_COLORS.map((col) => {
                  const isSelected = selectedColors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      onClick={() => toggleColor(col.name)}
                      className={`flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-[#F0F0EE] font-medium text-[#1A1A1A]' : 'hover:bg-[#F9F9F8] text-[#1A1A1A]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#E5E5E3] shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="truncate text-[11px]">{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="pt-4 border-t border-[#E5E5E3]">
              <label className="flex items-center gap-2 text-xs text-[#1A1A1A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-[#1A1A1A] focus:ring-[#1A1A1A]"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* ================= PRODUCT GRID ================= */}
          <main className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onNavigate={onNavigate}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-[#E5E5E3] shadow-xs max-w-md mx-auto">
                <p className="text-base font-medium text-[#1A1A1A] mb-2">
                  No matching outfits found
                </p>
                <p className="text-xs text-[#8A8A88] mb-6">
                  Try clearing some filters or exploring another ethnic wear category.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-medium uppercase tracking-wider rounded-lg shadow-xs hover:bg-black transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= MOBILE FILTER MODAL ================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-white shadow-xl p-6 flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3] mb-6">
              <h3 className="text-base font-medium text-[#1A1A1A]">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#8A8A88] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category */}
            <div className="mb-6">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A88] mb-2">
                Category
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                    selectedCategory === 'all' ? 'bg-[#1A1A1A] text-white font-medium' : 'text-[#1A1A1A]'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                      selectedCategory === cat.slug ? 'bg-[#1A1A1A] text-white font-medium' : 'text-[#1A1A1A]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div className="mb-6 pt-4 border-t border-[#E5E5E3]">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A88]">Max Price</h4>
                <span className="text-xs font-medium text-[#1A1A1A]">₹{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="3000"
                max="15000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#1A1A1A]"
              />
            </div>

            {/* Mobile Size */}
            <div className="mb-6 pt-4 border-t border-[#E5E5E3]">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A88] mb-2">Size</h4>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`w-9 h-9 rounded-lg text-xs font-medium border ${
                      selectedSizes.includes(sz) ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#E5E5E3] text-[#1A1A1A]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="mt-auto pt-6 border-t border-[#E5E5E3] space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#1A1A1A] text-white font-medium text-xs uppercase tracking-wider rounded-lg"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2 text-xs text-[#8A8A88] hover:text-[#1A1A1A]"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
