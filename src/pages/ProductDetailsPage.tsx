import React, { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  ArrowRight,
  Ruler,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/product/ProductCard';
import { SizeGuideModal } from '../components/common/SizeGuideModal';
import { Reviews } from '../components/reviews/Reviews';
import { ProductReviewsSection } from '../components/reviews/ProductReviewsSection';
import { ProductSocialShare } from '../components/product/ProductSocialShare';
import { Product } from '../types';
import { BRAND } from '../constants';
import { useProductSEO } from '../utils/seo';

interface ProductDetailsPageProps {
  slug?: string;
  productSlug?: string;
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  slug,
  productSlug,
  onNavigate,
  onQuickView,
}) => {
  const { products, reviews } = useShop();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const effectiveSlug = slug || productSlug;
  const product = products.find((p) => p.slug === effectiveSlug || p.id === effectiveSlug) || products[0];

  // Dynamic reviews calculation
  const productReviews = reviews.filter(
    (r) =>
      r.productId === product?.id ||
      (r.productName && r.productName.toLowerCase() === product?.name.toLowerCase())
  );
  const displayReviewCount = productReviews.length > 0 ? productReviews.length : (product?.reviewCount || 0);
  const displayRating =
    productReviews.length > 0
      ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1))
      : (product?.rating || 4.9);

  // Dynamically update meta tags (title, description, Open Graph, Twitter, Schema.org) for this product
  useProductSEO(product, {
    rating: displayRating,
    reviewCount: displayReviewCount,
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState(
    product?.colors[0] || { name: 'Standard', hex: '#5A1A1A' }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    fabric: true,
    shipping: false,
    returns: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="font-cinzel text-2xl font-bold text-[#5A1A1A] mb-4">Product Not Found</h2>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-3 bg-[#5A1A1A] text-[#FAF7F2] rounded text-xs uppercase font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onNavigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Explore ${product.name} at Majanya Ji Ethnic Wear`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  // WhatsApp size help message
  const whatsappSizeUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
    `Hello Siddhant Ji, I need sizing advice for "${product.name}" (Price: ₹${product.price}). My height is around 5'10" and normal shirt size is 40. Which size should I order?`
  )}`;

  // Related products
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-xs text-[#8A8A88] mb-8 flex items-center gap-2">
          <button onClick={() => onNavigate('/')} className="hover:text-[#1A1A1A]">
            Home
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('/shop')} className="hover:text-[#1A1A1A]">
            Men&apos;s Wear
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate(`/category/${product.categoryId}`)}
            className="hover:text-[#1A1A1A]"
          >
            {product.categoryName}
          </button>
          <span>/</span>
          <span className="text-[#1A1A1A] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Top Product Hero: Left Gallery & Right Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16">
          {/* ================= LEFT SIDE: IMAGE GALLERY ================= */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails list */}
            {(product.images?.length || 0) > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[620px] scrollbar-none pb-2 md:pb-0">
                {(product.images || []).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 sm:w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#5A1A1A] ring-2 ring-[#C9A227] scale-102 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-lg border border-[#C9A227]/30 group">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.discount > 0 && (
                  <span className="bg-[#5A1A1A] text-[#FAF7F2] text-xs font-bold px-3 py-1 rounded shadow-md tracking-wider">
                    {product.discount}% OFF
                  </span>
                )}
                {product.bestseller && (
                  <span className="bg-[#C9A227] text-[#3D1010] text-xs font-bold px-3 py-1 rounded shadow-md tracking-wider uppercase">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-[#5A1A1A] hover:bg-white hover:scale-110 transition-all"
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-[#5A1A1A] text-[#5A1A1A]' : ''}`} />
              </button>
            </div>
          </div>

          {/* ================= RIGHT SIDE: PRODUCT DETAILS ================= */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#8A8A88]">
                  Men&apos;s {product.categoryName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('product-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#1A1A1A] bg-[#F0F0EE] hover:bg-[#E5E5E3] px-2.5 py-1 rounded-full border border-[#E5E5E3] transition-colors cursor-pointer"
                  title="Click to view reviews"
                >
                  <Star className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                  <span className="font-semibold">{displayRating.toFixed(1)}</span>
                  <span className="text-[#666664]">({displayReviewCount} reviews)</span>
                </button>
              </div>

              {/* Title */}
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#1E1E1E] mb-3 leading-snug">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-gray-200">
                <span className="text-3xl font-bold text-[#5A1A1A]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  (Inclusive of all taxes & nationwide shipping)
                </span>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light mb-6">
                {product.description}
              </p>

              {/* SIZE SELECTION */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E]">
                    Select Size: <span className="text-[#5A1A1A] font-semibold">{selectedSize}</span>
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-[#1A1A1A] hover:underline font-medium flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Men&apos;s Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-12 h-11 px-3.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedSize === sz
                          ? 'bg-[#5A1A1A] text-[#FAF7F2] border-[#5A1A1A] shadow-md scale-105'
                          : 'border-gray-300 text-gray-700 hover:border-[#5A1A1A] bg-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLOR SELECTION */}
              <div className="mb-6">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#1E1E1E] mb-2">
                  Select Shade: <span className="font-semibold text-[#5A1A1A]">{selectedColor.name}</span>
                </span>
                <div className="flex items-center gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor.name === c.name
                          ? 'border-[#5A1A1A] ring-2 ring-[#C9A227] scale-110'
                          : 'border-gray-300 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor.name === c.name && (
                        <Check className={`w-3.5 h-3.5 mx-auto ${c.hex === '#FAF7F2' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY SELECTOR */}
              <div className="mb-8 flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E]">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-base"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-base"
                  >
                    +
                  </button>
                </div>
                {product.stock <= 5 && (
                  <span className="text-xs text-rose-600 font-semibold">
                    Only {product.stock} pieces left in stock!
                  </span>
                )}
              </div>

              {/* BUTTONS: ADD TO CART & BUY NOW */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-3">
                  <button
                    id="product-add-to-cart-btn"
                    onClick={handleAddToCart}
                    className="flex-1 py-4 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-semibold text-xs uppercase tracking-[0.2em] rounded-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#C9A227]" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    id="product-buy-now-btn"
                    onClick={handleBuyNow}
                    className="flex-1 py-4 bg-[#C9A227] hover:bg-[#e0ba42] text-[#3D1010] font-bold text-xs uppercase tracking-[0.2em] rounded-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="flex-1 py-2.5 border border-[#5A1A1A]/40 text-[#5A1A1A] hover:bg-[#5A1A1A]/5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#5A1A1A]' : ''}`} />
                    <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2.5 border border-gray-300 hover:border-[#5A1A1A] text-gray-600 hover:text-[#5A1A1A] rounded-lg text-xs flex items-center justify-center transition-colors"
                    title="Quick share / copy link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* SOCIAL MEDIA SHARING (WHATSAPP, FACEBOOK, X, ETC) */}
                <div className="pt-2">
                  <div className="p-3 bg-white/90 rounded-xl border border-gray-200/90 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-[#5A1A1A]" />
                        <span>Share Outfit With Family &amp; Friends</span>
                      </span>
                      <span className="text-[10px] text-gray-400">Instant Preview</span>
                    </div>
                    <ProductSocialShare
                      product={product}
                      selectedColor={selectedColor}
                      selectedSize={selectedSize}
                    />
                  </div>
                </div>
              </div>

              {/* WHATSAPP SIZE HELP BUTTON */}
              <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-4 mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-[#1E1E1E]">Need help with size or measurements?</p>
                  <p className="text-[11px] text-gray-600">Siddhant Jain will guide you personally on WhatsApp.</p>
                </div>
                <a
                  id="whatsapp-size-help-btn"
                  href={whatsappSizeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow flex items-center gap-1.5 shrink-0 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>

            {/* Guarantees icon line */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 text-center text-[11px] text-gray-600">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#5A1A1A]" />
                <span>Nationwide Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#5A1A1A]" />
                <span>7-Day Easy Exchange</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#5A1A1A]" />
                <span>100% Authentic Silk</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PRODUCT INFORMATION ACCORDION ================= */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm mb-16">
          <h3 className="font-cinzel text-xl font-bold text-[#5A1A1A] mb-6 border-b border-gray-100 pb-3">
            Product Specifications & Services
          </h3>

          <div className="space-y-4">
            {/* Description Accordion */}
            <div className="border-b border-gray-200 pb-3">
              <button
                onClick={() => toggleAccordion('description')}
                className="w-full flex items-center justify-between text-left font-serif text-base font-semibold text-[#1E1E1E]"
              >
                <span>Product Description & Styling Notes</span>
                {openAccordions.description ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.description && (
                <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                  <p className="mb-2">{product.description}</p>
                  <p>
                    Each Majanya Ji garment is crafted in small artisan batches in Indore. The silhouette is sculpted to flatter traditional Indian postures while offering effortless ease of movement during wedding rituals, sangeet dancing, and long festive ceremonies.
                  </p>
                </div>
              )}
            </div>

            {/* Fabric Details Accordion */}
            <div className="border-b border-gray-200 pb-3">
              <button
                onClick={() => toggleAccordion('fabric')}
                className="w-full flex items-center justify-between text-left font-serif text-base font-semibold text-[#1E1E1E]"
              >
                <span>Fabric Details & Care Instructions</span>
                {openAccordions.fabric ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.fabric && (
                <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed font-light space-y-1.5">
                  <p><strong className="text-[#1E1E1E]">Material:</strong> {product.fabric}</p>
                  <p><strong className="text-[#1E1E1E]">Weave:</strong> Hand-finished authentic Indian textile</p>
                  <p><strong className="text-[#1E1E1E]">Embroidery:</strong> Zardozi and resham threadwork</p>
                  <p><strong className="text-[#1E1E1E]">Care:</strong> Strictly dry clean only. Steam iron at medium temperature. Store in muslin cloth garment bag.</p>
                </div>
              )}
            </div>

            {/* Shipping Info Accordion */}
            <div className="border-b border-gray-200 pb-3">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex items-center justify-between text-left font-serif text-base font-semibold text-[#1E1E1E]"
              >
                <span>Shipping & Delivery Information</span>
                {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.shipping && (
                <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed font-light space-y-1.5">
                  <p>• Orders dispatched within 24 to 48 hours from our central atelier in Indore.</p>
                  <p>• Complimentary free standard delivery on all orders above ₹4,999.</p>
                  <p>• Estimated delivery time: 3 to 5 business days for major metropolitan areas; 5 to 7 days for remote destinations.</p>
                  <p>• Real-time tracking link sent via WhatsApp and email as soon as dispatched.</p>
                </div>
              )}
            </div>

            {/* Return Policy Accordion */}
            <div className="pb-1">
              <button
                onClick={() => toggleAccordion('returns')}
                className="w-full flex items-center justify-between text-left font-serif text-base font-semibold text-[#1E1E1E]"
              >
                <span>7-Day Return & Sizing Exchange Policy</span>
                {openAccordions.returns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.returns && (
                <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed font-light space-y-1.5">
                  <p>• We want you to look regal and feel confident. We offer seamless 7-day size exchanges.</p>
                  <p>• Items must be unworn, unwashed, with all original tags and packaging intact.</p>
                  <p>• To request an exchange or return, simply contact Siddhant Jain directly at +91 7007457920.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= PRODUCT REVIEWS & RATINGS SECTION ================= */}
        <Reviews product={product} onNavigate={onNavigate} />

        {/* ================= RELATED PRODUCTS ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C9A227] block mb-1">
                  Complete Your Ensemble
                </span>
                <h3 className="font-cinzel text-xl sm:text-3xl font-bold text-[#1E1E1E]">
                  Related Royal Creations
                </h3>
              </div>
              <button
                onClick={() => onNavigate(`/category/${product.categoryId}`)}
                className="text-xs font-semibold text-[#5A1A1A] hover:underline flex items-center gap-1"
              >
                View Category <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onNavigate={onNavigate}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= SIZE GUIDE MODAL ================= */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        defaultCategory={product?.categoryId}
      />
    </div>
  );
};
