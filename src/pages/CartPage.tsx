import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  Sparkles,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { COUPONS } from '../data/mockProducts';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items = [],
    removeFromCart,
    updateQuantity,
    subtotal = 0,
    shipping = 0,
    discount = 0,
    appliedCoupon,
    availableCoupons = [],
    applyCoupon,
    removeCoupon,
    total = 0,
    couponWarning,
    couponRequirementMet,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput.trim().toUpperCase());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
      setCouponError('');
    }
  };

  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <div className="w-full bg-[#FAF7F2] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 rounded-2xl border border-[#C9A227]/30 shadow-md">
          <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center mx-auto mb-6 text-[#5A1A1A]">
            <ShoppingBag className="w-10 h-10 stroke-1" />
          </div>

          <h2 className="font-cinzel text-2xl font-bold text-[#1E1E1E] mb-2">
            Your Royal Bag is Empty
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-8 font-light leading-relaxed">
            Looks like you haven&apos;t added any traditional royal creations yet. Explore our handcrafted kurtas, jacket sets, and jodhpuries.
          </p>

          <button
            id="empty-cart-shop-btn"
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-[#1E1E1E]">
              Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              You have <strong className="text-[#5A1A1A]">{safeItems.length}</strong> items selected
            </p>
          </div>

          <button
            onClick={() => onNavigate('/shop')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#5A1A1A] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ================= ITEMS TABLE / LIST ================= */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm">
            <div className="divide-y divide-gray-100">
              {safeItems.map((item) => {
                const prod = item.product || (item as any);
                const itemSize = item.size || item.selectedSize || 'L';
                const itemColor = item.color || item.selectedColor || { name: 'Standard', hex: '#5A1A1A' };
                const price = prod?.price || 0;
                const qty = item.quantity || 1;

                return (
                  <div
                    key={item.id}
                    className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Image & Details */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        onClick={() => prod?.slug && onNavigate(`/product/${prod.slug}`)}
                        className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0 cursor-pointer border border-[#C9A227]/20"
                      >
                        <img
                          src={prod?.images?.[0] || 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=600'}
                          alt={prod?.name || 'Handcrafted Design'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-[#C9A227] font-semibold block">
                          {prod?.categoryName || 'Ethnic Wear'}
                        </span>
                        <h3
                          onClick={() => prod?.slug && onNavigate(`/product/${prod.slug}`)}
                          className="font-serif text-sm sm:text-base font-semibold text-[#1E1E1E] hover:text-[#5A1A1A] cursor-pointer truncate mb-1"
                        >
                          {prod?.name || 'Handcrafted Royal Creation'}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span>Size: <strong className="text-gray-800">{itemSize}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            Shade:
                            <span
                              className="w-3 h-3 rounded-full border border-gray-300 inline-block ml-0.5"
                              style={{ backgroundColor: itemColor?.hex || '#5A1A1A' }}
                            />
                            <span className="text-gray-800">{itemColor?.name || 'Standard'}</span>
                          </span>
                        </div>

                        <div className="text-sm font-bold text-[#5A1A1A]">
                          ₹{price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 mt-2 sm:mt-0">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-200 rounded bg-[#FAF7F2]">
                        <button
                          onClick={() => updateQuantity(item.id, qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-800">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Total item price */}
                      <div className="text-right font-bold text-[#1E1E1E] text-sm sm:text-base min-w-20">
                        ₹{(price * qty).toLocaleString('en-IN')}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => onNavigate('/shop')}
                className="text-xs font-semibold uppercase tracking-wider text-[#5A1A1A] hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Continue Browsing Ethnic Wear
              </button>

              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#5A1A1A]" />
                <span>
                  {subtotal >= 4999
                    ? '🎉 You unlocked FREE nationwide express shipping!'
                    : `Add ₹${(4999 - subtotal).toLocaleString('en-IN')} more for Free Shipping`}
                </span>
              </div>
            </div>
          </div>

          {/* ================= ORDER SUMMARY ================= */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm sticky top-28">
            <h2 className="font-cinzel text-lg font-bold text-[#5A1A1A] mb-6 pb-3 border-b border-gray-100">
              Order Summary
            </h2>

            {/* Coupon Code section */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Have a Festive Coupon?
              </label>

              {appliedCoupon ? (
                <div className="space-y-2">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> {appliedCoupon.code}
                        </span>
                        {appliedCoupon.tag && (
                          <span className="text-[10px] font-semibold bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded">
                            {appliedCoupon.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        {appliedCoupon.description || `${appliedCoupon.discountPercent}% privilege discount applied`}
                      </p>
                      {discount > 0 && (
                        <p className="text-[11px] font-bold text-emerald-800 mt-0.5">
                          Saved: ₹{discount.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeCoupon()}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>

                  {couponWarning && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{couponWarning}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ROYAL10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-[#FAF7F2] text-xs font-mono px-3 py-2.5 rounded border border-gray-300 focus:outline-none focus:border-[#5A1A1A] uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#5A1A1A] text-[#FAF7F2] text-xs font-semibold rounded hover:bg-[#3D1010] transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {couponError && (
                    <p className="text-[11px] text-red-600">{couponError}</p>
                  )}

                  {/* Quick Click-to-Apply Offer Badges */}
                  <div className="pt-1">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wider">
                      Available Offers:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCoupons.slice(0, 3).map((cp) => (
                        <button
                          key={cp.code}
                          type="button"
                          onClick={() => {
                            setCouponInput(cp.code);
                            const res = applyCoupon(cp.code);
                            if (!res.success) {
                              setCouponError(res.message);
                            } else {
                              setCouponInput('');
                              setCouponError('');
                            }
                          }}
                          className="px-2 py-1 bg-[#FAF7F2] hover:bg-[#F3EFEA] border border-[#C9A227]/40 rounded text-[10px] font-mono text-[#5A1A1A] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          title={cp.description}
                        >
                          <Tag className="w-2.5 h-2.5 text-[#C9A227]" />
                          <span>{cp.code}</span>
                          <span className="text-gray-400 font-normal">
                            ({cp.discountType === 'flat' ? `₹${cp.discountAmount} off` : `${cp.discountPercent}% off`})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm text-gray-600 pb-4 border-b border-gray-100">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-gray-800">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <strong className="text-emerald-700">FREE</strong>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="py-4 flex justify-between items-baseline">
              <span className="font-cinzel text-base font-bold text-[#1E1E1E]">Estimated Total</span>
              <div className="text-right">
                <span className="font-sans text-2xl font-bold text-[#5A1A1A]">
                  ₹{total.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-gray-400">Inclusive of all GST</p>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => onNavigate('/checkout')}
              className="w-full py-4 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-bold text-xs uppercase tracking-[0.2em] rounded-lg shadow-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-102 active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#C9A227]" />
            </button>

            {/* Safe trust points */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted 256-bit secure checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>Direct dispatch from Indore atelier</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
