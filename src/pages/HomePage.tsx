import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Award,
  MessageCircle,
  Star,
  Instagram,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { BRAND } from '../constants';
import { INSTAGRAM_POSTS } from '../data/mockProducts';
import { usePageSEO, DEFAULT_SEO_CONFIG } from '../utils/seo';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickView }) => {
  const { products, categories, reviews, settings, subscribeNewsletter } = useShop();

  // Baseline store SEO
  usePageSEO(DEFAULT_SEO_CONFIG);

  // Bestsellers category tab filter
  const [bestsellerCategory, setBestsellerCategory] = useState<string>('All');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Newsletter state
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSuccess, setNewsSuccess] = useState(false);

  // Categories with custom descriptions as requested
  const collectionDescriptions: Record<string, string> = {
    'kurta-pajama': 'Classic elegance for every celebration.',
    'jacket-set': 'Layered luxury with a modern touch.',
    'indo-western': 'Traditional roots. Contemporary style.',
    'open-jodhpuri': 'Royal style crafted for special moments.',
    'shirts': 'Tailored festive & casual comfort in fine fabrics.',
  };

  // 8 New Arrivals
  const newArrivals = products.slice(0, 8);

  // Bestseller filtered products
  const filteredBestsellers = products.filter((p) => {
    if (bestsellerCategory === 'All') return p.bestseller || p.featured;
    return p.categoryName.toLowerCase() === bestsellerCategory.toLowerCase();
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsEmail) {
      const ok = subscribeNewsletter(newsEmail);
      if (ok) {
        setNewsSuccess(true);
        setNewsEmail('');
        setTimeout(() => setNewsSuccess(false), 5000);
      }
    }
  };

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const activeReview = reviews[currentReviewIndex] || reviews[0];

  return (
    <div className="w-full bg-[#F9F9F8] overflow-x-hidden text-[#1A1A1A]">
      {/* ================= SECTION 3: HERO SECTION ================= */}
      <section className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1608958435020-e8a7109ba809?q=85&w=2000&auto=format&fit=crop"
            alt="Majanya Ji Royal Men's Ethnic Wear Heritage"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-white/90 font-medium">
              Exclusive Men&apos;s Ethnic Wear
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight leading-tight sm:leading-tight mb-5">
            Where Men&apos;s Tradition <br className="hidden sm:inline" />
            <span className="italic font-normal">Meets Modern Craft</span>
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mb-9 leading-relaxed font-light">
            Discover timeless handcrafted men&apos;s ethnic wear — Kurta Pajamas, Designer Jacket Sets, Indo Western silhouettes &amp; Royal Open Jodhpuris. Tailored in Indore, admired nationwide.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              id="hero-shop-collection-btn"
              onClick={() => onNavigate('/shop')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#F0F0EE] text-[#1A1A1A] font-medium text-xs sm:text-sm tracking-[0.15em] uppercase rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Shop Men&apos;s Collection</span>
              <ArrowRight className="w-4 h-4 text-[#1A1A1A] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-visit-store-btn"
              onClick={() => onNavigate('/store-location')}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-white/10 text-white font-medium text-xs sm:text-sm tracking-[0.15em] uppercase rounded-lg border border-white/30 hover:border-white transition-all duration-200"
            >
              Visit Our Store
            </button>
          </div>

          {/* Highlights bar under hero */}
          <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs tracking-wider uppercase text-white/75 font-medium">
            <div>Tailored Silhouettes</div>
            <div>Handcrafted Zari</div>
            <div>Nationwide Dispatch</div>
            <div>Flagship Store in Indore</div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: SHOP BY COLLECTION ================= */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#8A8A88] block mb-1">
            Curated Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
            Shop By Collection
          </h2>
        </div>

        {/* 4 Category Cards (Mobile Horizontal Scroll, Desktop 4-column grid) */}
        <div className="flex md:grid md:grid-cols-4 gap-5 overflow-x-auto pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory">
          {categories.map((cat) => {
            const desc = collectionDescriptions[cat.slug] || cat.description;
            return (
              <div
                key={cat.id}
                id={`category-card-${cat.slug}`}
                onClick={() => onNavigate(`/category/${cat.slug}`)}
                className="group relative flex-none w-[280px] md:w-auto aspect-[3/4.2] rounded-xl overflow-hidden shadow-xs border border-[#E5E5E3] hover:border-[#1A1A1A] transition-all duration-300 cursor-pointer snap-center"
              >
                {/* Background Image with Zoom */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300" />

                {/* Content at Bottom */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end text-center z-10">
                  <h3 className="text-lg sm:text-xl font-medium text-white tracking-wider mb-1">
                    {cat.name.toUpperCase()}
                  </h3>
                  <p className="text-xs text-white/80 mb-3 line-clamp-2 font-light">
                    {desc}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(`/category/${cat.slug}`);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-4 mx-auto text-xs font-medium tracking-[0.1em] uppercase text-[#1A1A1A] bg-white hover:bg-[#F0F0EE] rounded-lg transition-all shadow-xs"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= SECTION 5: NEW ARRIVALS ================= */}
      <section className="py-16 bg-[#F0F0EE]/40 border-y border-[#E5E5E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#8A8A88] block mb-1">
                Latest Creations
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
                New Arrivals
              </h2>
              <p className="text-xs text-[#8A8A88] mt-1">
                Fresh styles crafted for your special moments.
              </p>
            </div>

            <button
              id="view-all-new-arrivals-btn"
              onClick={() => onNavigate('/shop')}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#1A1A1A] hover:text-[#8A8A88] transition-colors group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 8 Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              id="section-view-all-btn"
              onClick={() => onNavigate('/shop')}
              className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white text-xs font-medium uppercase tracking-[0.15em] rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
            >
              <span>Explore Complete Catalogue</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: PREMIUM PROMOTIONAL BANNER ================= */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-[#1A1A1A]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=85&w=2000&auto=format&fit=crop"
            alt="Majanya Ji Occasion Collection Architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/70 block mb-2">
            Elegance For Every Celebration
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-5">
            Make Every Occasion Memorable
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto mb-8 font-light leading-relaxed">
            From timeless Kurtas to elegant Indo Western outfits, discover ethnic wear designed to make every moment special. Handcrafted with pristine precision in Indore.
          </p>

          <button
            id="promo-explore-collection-btn"
            onClick={() => onNavigate('/shop')}
            className="px-8 py-3.5 bg-white hover:bg-[#F0F0EE] text-[#1A1A1A] text-xs sm:text-sm font-medium tracking-[0.15em] uppercase rounded-lg shadow-sm transition-all"
          >
            Explore Collection
          </button>
        </div>
      </section>

      {/* ================= SECTION 7: BESTSELLERS ================= */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#8A8A88] block mb-1">
            Exclusively For Gentlemen
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#1A1A1A] mb-6">
            Bestselling Men&apos;s Styles
          </h2>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['All', 'Kurta Pajama', 'Jacket Set', 'Indo Western', 'Open Jodhpuri', 'Shirts'].map((tab) => (
              <button
                key={tab}
                id={`bestseller-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setBestsellerCategory(tab)}
                className={`px-4 py-2 text-xs font-medium tracking-wider rounded-full transition-all cursor-pointer ${
                  bestsellerCategory === tab
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'bg-white text-[#8A8A88] hover:text-[#1A1A1A] border border-[#E5E5E3]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredBestsellers.slice(0, 8).map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* ================= SECTION 8: WHY CHOOSE US ================= */}
      <section className="py-16 bg-white text-[#1A1A1A] border-y border-[#E5E5E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#8A8A88] block mb-1">
              Our Commitment
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
              The Majanya Ji Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#F9F9F8] p-6 rounded-xl border border-[#E5E5E3] text-center hover:border-[#1A1A1A] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E5E3] flex items-center justify-center mx-auto mb-4 text-[#1A1A1A] group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-medium text-[#1A1A1A] mb-1.5">
                Nationwide Delivery
              </h3>
              <p className="text-xs text-[#8A8A88] leading-relaxed font-normal">
                Delivering premium ethnic fashion securely to your doorstep across all states and cities in India.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F9F9F8] p-6 rounded-xl border border-[#E5E5E3] text-center hover:border-[#1A1A1A] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E5E3] flex items-center justify-center mx-auto mb-4 text-[#1A1A1A] group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-medium text-[#1A1A1A] mb-1.5">
                Premium Quality
              </h3>
              <p className="text-xs text-[#8A8A88] leading-relaxed font-normal">
                Crafted with attention to detail using authentic raw silks, rich velvets, and master hand embroidery.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F9F9F8] p-6 rounded-xl border border-[#E5E5E3] text-center hover:border-[#1A1A1A] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E5E3] flex items-center justify-center mx-auto mb-4 text-[#1A1A1A] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-medium text-[#1A1A1A] mb-1.5">
                Secure Payments
              </h3>
              <p className="text-xs text-[#8A8A88] leading-relaxed font-normal">
                Safe and trusted payment experience with online cards, UPI, net banking, and Cash on Delivery.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F9F9F8] p-6 rounded-xl border border-[#E5E5E3] text-center hover:border-[#1A1A1A] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E5E3] flex items-center justify-center mx-auto mb-4 text-[#1A1A1A] group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <h3 className="text-base font-medium text-[#1A1A1A] mb-1.5">
                WhatsApp Support
              </h3>
              <p className="text-xs text-[#8A8A88] leading-relaxed font-normal mb-3">
                Easy sizing and styling support directly through WhatsApp with Siddhant Jain.
              </p>
              <a
                href={BRAND.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#1A1A1A] hover:underline"
              >
                +91 7007457920 →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 9: CUSTOMER REVIEWS ================= */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#8A8A88] block mb-1">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
            Customer Stories
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative bg-white rounded-2xl p-8 sm:p-10 shadow-xs border border-[#E5E5E3] text-center">
          <div className="flex justify-center mb-3">
            {[...Array(activeReview.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#1A1A1A] text-[#1A1A1A]" />
            ))}
          </div>

          <blockquote className="text-base sm:text-lg text-[#1A1A1A] font-light italic mb-6 leading-relaxed max-w-2xl mx-auto">
            &ldquo;{activeReview.comment}&rdquo;
          </blockquote>

          <div className="text-sm font-medium text-[#1A1A1A]">
            {activeReview.customerName}
          </div>
          <div className="text-xs text-[#8A8A88]">
            {activeReview.city} • Verified Buyer
          </div>

          {activeReview.productName && (
            <div className="mt-3 inline-block text-[11px] text-[#8A8A88] font-medium bg-[#F9F9F8] px-3 py-1 rounded-full border border-[#E5E5E3]">
              Purchased: {activeReview.productName}
            </div>
          )}

          {/* Carousel Arrows */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={prevReview}
              className="p-2 rounded-full border border-[#E5E5E3] hover:border-[#1A1A1A] hover:bg-[#F9F9F8] text-[#1A1A1A] transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#8A8A88] font-medium">
              {currentReviewIndex + 1} / {reviews.length}
            </span>
            <button
              onClick={nextReview}
              className="p-2 rounded-full border border-[#E5E5E3] hover:border-[#1A1A1A] hover:bg-[#F9F9F8] text-[#1A1A1A] transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= SECTION 10: INSTAGRAM GALLERY ================= */}
      <section className="py-16 bg-[#F9F9F8] border-t border-[#E5E5E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-[#8A8A88] mb-1">
              <Instagram className="w-3.5 h-3.5 text-[#1A1A1A]" />
              @majanyaji_ethnicwear
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium text-[#1A1A1A]">
              Follow Our Journey
            </h2>
          </div>

          {/* 6 Fashion Images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {INSTAGRAM_POSTS.map((post) => (
              <a
                key={post.id}
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-xs border border-[#E5E5E3]"
              >
                <img
                  src={post.imageUrl}
                  alt="Majanya Ji Instagram"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center text-white">
                  <Heart className="w-4 h-4 fill-white text-white mb-1" />
                  <span className="text-xs font-medium">{post.likes}</span>
                  <p className="text-[10px] text-white/80 line-clamp-2 mt-1 font-light">
                    {post.caption}
                  </p>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              id="follow-instagram-btn"
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-medium tracking-wider uppercase rounded-lg shadow-xs transition-all"
            >
              <Instagram className="w-3.5 h-3.5 text-white" />
              <span>Follow Us On Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================= SECTION 11: NEWSLETTER ================= */}
      <section className="py-16 sm:py-20 bg-[#1A1A1A] text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#8A8A88] block mb-2">
            The Inner Circle
          </span>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight mb-3">
            Stay Connected With Majanya Ji
          </h2>
          <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed mb-6">
            Get exclusive festive offers, new collection previews, and personal ethnic styling updates delivered straight to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              value={newsEmail}
              onChange={(e) => setNewsEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white text-xs sm:text-sm"
              required
            />
            <button
              id="newsletter-subscribe-btn"
              type="submit"
              className="px-6 py-3 bg-white hover:bg-[#F0F0EE] text-[#1A1A1A] font-medium text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              {newsSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Subscribed</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>
          {newsSuccess && (
            <p className="text-xs text-white/90 mt-3">
              Thank you for subscribing! Your privileges begin today.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
