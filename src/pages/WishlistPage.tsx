import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onNavigate,
  onQuickView,
}) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: Product) => {
    const size = product.sizes[0] || 'L';
    const color = product.colors[0] || { name: 'Standard', hex: '#5A1A1A' };
    addToCart(product, size, color, 1);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="w-full bg-[#FAF7F2] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 rounded-2xl border border-[#C9A227]/30 shadow-md">
          <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto mb-6 text-[#5A1A1A]">
            <Heart className="w-10 h-10 stroke-1 text-[#5A1A1A]" />
          </div>

          <h2 className="font-cinzel text-2xl font-bold text-[#1E1E1E] mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-8 font-light leading-relaxed">
            Save royal pieces you love by tapping the heart icon on any kurta, jacket set, or jodhpuri.
          </p>

          <button
            onClick={() => onNavigate('/shop')}
            className="w-full py-3.5 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] text-xs font-semibold uppercase tracking-[0.2em] rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore Royal Collections</span>
            <ArrowRight className="w-4 h-4 text-[#C9A227]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-[#1E1E1E]">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {wishlist.length} saved royal creation{wishlist.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-semibold uppercase tracking-wider text-[#5A1A1A] hover:underline"
          >
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#C9A227]/30 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div
                onClick={() => onNavigate(`/product/${item.product.slug}`)}
                className="aspect-[3/4] relative bg-gray-100 cursor-pointer overflow-hidden group"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(item.product.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white shadow"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#C9A227] tracking-wider block mb-1">
                    {item.product.categoryName}
                  </span>
                  <h3
                    onClick={() => onNavigate(`/product/${item.product.slug}`)}
                    className="font-serif text-sm font-semibold text-[#1E1E1E] hover:text-[#5A1A1A] cursor-pointer line-clamp-1 mb-2"
                  >
                    {item.product.name}
                  </h3>
                  <div className="text-sm font-bold text-[#5A1A1A] mb-3">
                    ₹{item.product.price.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleMoveToCart(item.product)}
                    className="flex-1 py-2 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
