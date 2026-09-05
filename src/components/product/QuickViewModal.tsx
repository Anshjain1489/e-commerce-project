import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, ArrowRight, MessageCircle, Ruler } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { BRAND } from '../../constants';
import { SizeGuideModal } from '../common/SizeGuideModal';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onNavigate,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] || { name: 'Standard', hex: '#5A1A1A' }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const handleViewDetails = () => {
    onNavigate(`/product/${product.slug}`);
    onClose();
  };

  const whatsappInquiryUrl = `https://wa.me/${BRAND.whatsAppClean}?text=${encodeURIComponent(
    `Hello Siddhant Ji, I am interested in "${product.name}" (Size: ${selectedSize}, ₹${product.price}). Please share more details.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-[#E5E5E3] max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="quickview-close-btn"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-[#8A8A88] hover:text-[#1A1A1A] border border-[#E5E5E3] shadow-xs transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Images */}
        <div className="w-full md:w-1/2 p-4 md:p-6 bg-[#F9F9F8] border-b md:border-b-0 md:border-r border-[#E5E5E3] flex flex-col justify-between">
          <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-white border border-[#E5E5E3] mb-3">
            <img
              src={selectedImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Thumbnails */}
          {(product.images?.length || 0) > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(product.images || []).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border shrink-0 transition-all ${
                    selectedImage === img ? 'border-[#1A1A1A] opacity-100' : 'border-[#E5E5E3] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] tracking-[0.15em] uppercase font-medium text-[#8A8A88]">
                {product.categoryName}
              </span>
              <div className="flex items-center gap-1 text-xs text-[#1A1A1A]">
                <Star className="w-3.5 h-3.5 fill-[#1A1A1A] text-[#1A1A1A]" />
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
                <span className="text-[#8A8A88]">({product.reviewCount})</span>
              </div>
            </div>

            <h2 className="text-xl font-medium text-[#1A1A1A] mb-2 leading-snug">
              {product.name}
            </h2>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-semibold text-[#1A1A1A]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-[#8A8A88] line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-medium text-[#1A1A1A] bg-[#F0F0EE] border border-[#E5E5E3] px-2 py-0.5 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <p className="text-xs text-[#8A8A88] leading-relaxed line-clamp-3 mb-4">
              {product.description}
            </p>

            {/* Fabric specification */}
            <div className="text-xs text-[#1A1A1A] mb-4 bg-[#F9F9F8] p-3 rounded-xl border border-[#E5E5E3]">
              <span className="font-medium text-[#1A1A1A]">Fabric:</span> {product.fabric}
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[#1A1A1A]">
                  Select Size
                </label>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[11px] text-[#5A1A1A] hover:text-[#C9A227] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Ruler className="w-3 h-3 text-[#C9A227]" /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-10 h-9 px-3 rounded-lg text-xs font-medium border transition-all ${
                      selectedSize === sz
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'border-[#E5E5E3] text-[#1A1A1A] hover:border-[#1A1A1A] bg-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mb-4">
              <label className="block text-xs font-medium uppercase tracking-wider text-[#1A1A1A] mb-1.5">
                Select Shade: <span className="font-normal text-[#8A8A88]">{selectedColor.name}</span>
              </label>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      selectedColor.name === c.name ? 'border-[#1A1A1A] ring-2 ring-[#1A1A1A] scale-105' : 'border-[#E5E5E3]'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-[#1A1A1A]">Qty:</span>
              <div className="flex items-center border border-[#E5E5E3] rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-sm text-[#8A8A88] hover:text-[#1A1A1A] hover:bg-[#F9F9F8]"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-medium text-[#1A1A1A]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2.5 py-1 text-sm text-[#8A8A88] hover:text-[#1A1A1A] hover:bg-[#F9F9F8]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 border-t border-[#E5E5E3]">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-[#1A1A1A] text-white hover:bg-black text-xs font-medium uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-lg border transition-colors ${
                  inWishlist
                    ? 'border-[#1A1A1A] bg-[#F0F0EE] text-[#1A1A1A]'
                    : 'border-[#E5E5E3] text-[#8A8A88] hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#1A1A1A]' : ''}`} />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleViewDetails}
                className="flex-1 py-2 text-xs font-medium text-[#1A1A1A] hover:underline flex items-center justify-center gap-1"
              >
                Full Product Specifications <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 text-xs font-medium text-[#1A1A1A] hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        defaultCategory={product.categoryId}
      />
    </div>
  );
};
