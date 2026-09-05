import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  onQuickView,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = (product.sizes && product.sizes[0]) || 'L';
    const defaultColor = (product.colors && product.colors[0]) || { name: 'Standard', hex: '#5A1A1A' };
    addToCart(product, defaultSize, defaultColor, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  const mainImage = (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600';
  const hoverImage = (product.images && product.images[1]) || mainImage;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onNavigate(`/product/${product.slug}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-[#E5E5E3] hover:border-[#1A1A1A] shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F9F9F8]">
        <img
          src={isHovered ? hoverImage : mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.discount > 0 && (
            <span className="bg-[#1A1A1A] text-white text-[10px] font-medium px-2 py-0.5 rounded-full tracking-wider">
              {product.discount}% OFF
            </span>
          )}
          {product.bestseller && (
            <span className="bg-[#F0F0EE] text-[#1A1A1A] border border-[#E5E5E3] text-[10px] font-medium px-2 py-0.5 rounded-full tracking-wider uppercase">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={handleWishlistClick}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-[#E5E5E3] shadow-xs flex items-center justify-center text-[#1A1A1A] hover:bg-white hover:scale-105 active:scale-95 transition-all"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist ? 'fill-[#1A1A1A] text-[#1A1A1A]' : 'text-[#1A1A1A]'
            }`}
          />
        </button>

        {/* Desktop Quick Action Bar on Hover */}
        <div className="hidden lg:flex absolute bottom-3 inset-x-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={handleQuickViewClick}
            className="flex-1 py-2 px-2 bg-white text-[#1A1A1A] hover:bg-[#F9F9F8] border border-[#E5E5E3] text-xs font-medium rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <span>Quick View</span>
          </button>
          <button
            id={`quick-add-btn-${product.id}`}
            onClick={handleQuickAdd}
            className="flex-1 py-2 px-2 bg-[#1A1A1A] text-white hover:bg-black text-xs font-medium rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] tracking-[0.15em] uppercase font-medium text-[#8A8A88]">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#1A1A1A]">
              <Star className="w-3 h-3 fill-[#1A1A1A] text-[#1A1A1A]" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-sm font-medium text-[#1A1A1A] group-hover:text-black transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#8A8A88] line-clamp-1 mb-2">
            {product.fabric}
          </p>
        </div>

        {/* Pricing & Mobile Action */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm sm:text-base font-semibold text-[#1A1A1A]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#8A8A88] line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex lg:hidden items-center gap-2 pt-1 border-t border-[#E5E5E3]">
            <button
              onClick={handleQuickViewClick}
              className="flex-1 py-1.5 text-[11px] font-medium border border-[#E5E5E3] text-[#1A1A1A] rounded-lg text-center bg-white"
            >
              Quick View
            </button>
            <button
              onClick={handleQuickAdd}
              className="flex-1 py-1.5 text-[11px] font-medium bg-[#1A1A1A] text-white rounded-lg text-center"
            >
              {justAdded ? 'Added' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
