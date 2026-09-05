import React, { useState, useEffect } from 'react';
import {
  Star,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react';
import { Product, Review } from '../../types';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  orderId?: string;
}

const RATING_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: 'Poor', desc: 'Did not meet expectations in fabric or finish' },
  2: { label: 'Fair', desc: 'Acceptable but has notable shortcomings' },
  3: { label: 'Good', desc: 'Satisfactory quality and traditional styling' },
  4: { label: 'Very Good', desc: 'High quality craftsmanship and great fitting' },
  5: { label: 'Exceptional Royal Quality', desc: 'Masterpiece fitting, luxurious silk, and imperial finish' },
};

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  orderId,
}) => {
  const { addReview, orders } = useShop();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [fitFeedback, setFitFeedback] = useState<'Runs Small' | 'True to Size' | 'Runs Large'>('True to Size');
  const [inputOrderId, setInputOrderId] = useState<string>(orderId || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto-detect if user purchased this product from orders
  const hasPurchased = Boolean(
    orderId ||
    (user &&
      orders.some(
        (o) =>
          (o.userId === user.id || o.customerEmail === user.email) &&
          o.items?.some((i) => i.productId === product.id || i.name === product.name)
      )) ||
    orders.some(
      (o) =>
        inputOrderId &&
        o.id?.toLowerCase() === inputOrderId.trim().toLowerCase() &&
        o.items?.some((i) => i.productId === product.id || i.name === product.name)
    )
  );

  // Pre-fill user details on mount or user change
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      const userCity = user.address?.city || (user as any).addresses?.[0]?.city || '';
      const userState = user.address?.state || (user as any).addresses?.[0]?.state || '';
      if (!city && userCity) {
        setCity(`${userCity}${userState ? `, ${userState}` : ''}`);
      }
    }
  }, [user]);

  useEffect(() => {
    if (orderId) {
      setInputOrderId(orderId);
    }
  }, [orderId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a brief headline for your review.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 15) {
      setErrorMsg('Please write at least 15 characters of feedback about fabric, fitting, or craftsmanship.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!city.trim()) {
      setErrorMsg('Please enter your city/state.');
      return;
    }

    setIsSubmitting(true);

    try {
      addReview({
        productId: product.id,
        productName: product.name,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || user?.email || '',
        city: city.trim(),
        rating,
        title: title.trim(),
        comment: comment.trim(),
        verifiedPurchase: hasPurchased || Boolean(inputOrderId.trim()),
        fitFeedback,
        orderId: inputOrderId.trim() || orderId,
        helpfulCount: 0,
      });

      // Reset fields
      setTitle('');
      setComment('');
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Failed to submit review. Please try again.');
    }
  };

  const activeRatingValue = hoverRating || rating;
  const ratingDetails = RATING_LABELS[activeRatingValue] || RATING_LABELS[5];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="write-review-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF7F2] w-full max-w-xl rounded-2xl shadow-2xl border border-[#C9A227]/40 overflow-hidden my-6 text-[#1E1E1E] transition-all"
      >
        {/* Header */}
        <div className="bg-[#5A1A1A] text-[#FAF7F2] p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C9A227] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" /> Royal Patron Feedback
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide">
                Review this Masterpiece
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Mini Preview */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-12 h-14 object-cover rounded-md border border-[#C9A227]/40 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <p className="font-serif text-sm font-semibold text-white truncate">
                {product.name}
              </p>
              <p className="text-xs text-[#C9A227] font-sans font-medium">
                ₹{product.price.toLocaleString('en-IN')} • {product.categoryName}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="px-6 py-2.5 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {hasPurchased ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-800">
                  Verified Royal Purchase
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span className="text-amber-900 font-medium">
                  Have an Order ID? Enter it below to earn a Verified Buyer badge.
                </span>
              </>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Star Rating Selector */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">
              Overall Rating <span className="text-rose-600">*</span>
            </label>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= activeRatingValue;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isFilled
                          ? 'text-[#C9A227] fill-[#C9A227] drop-shadow-sm'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
              <div className="ml-3">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#5A1A1A] block">
                  {ratingDetails.label}
                </span>
                <span className="text-[11px] text-gray-500 font-light hidden sm:block">
                  {ratingDetails.desc}
                </span>
              </div>
            </div>
          </div>

          {/* Fit Feedback Selector */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">
              How was the Sizing & Fit? <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Runs Small', 'True to Size', 'Runs Large'] as const).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setFitFeedback(fit)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                    fitFeedback === fit
                      ? 'bg-[#5A1A1A] text-white border-[#5A1A1A] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#C9A227]'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Review Headline / Title */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-1.5">
              Review Title / Headline <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Masterpiece silk fitting for my brother's wedding"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A1A1A]/30 focus:border-[#5A1A1A] transition-all"
            />
          </div>

          {/* Written Feedback Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase font-bold tracking-wider text-gray-700">
                Written Feedback & Experience <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-gray-500">
                {comment.length} characters (min. 15)
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={comment || ''}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the weave texture, embroidery detail, comfort during celebrations, and overall satisfaction..."
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A1A1A]/30 focus:border-[#5A1A1A] transition-all resize-none"
            />
          </div>

          {/* Customer Details: Name, City & Optional Order ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-1">
                Your Full Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName || ''}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Vikramaditya Rathore"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#5A1A1A]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-1">
                City, State <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={city || ''}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Jaipur, Rajasthan"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#5A1A1A]"
              />
            </div>
          </div>

          {/* Optional Order ID / Email for verification */}
          {!hasPurchased && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Order ID (Optional — grants Verified Buyer status)
              </label>
              <input
                type="text"
                value={inputOrderId || ''}
                onChange={(e) => setInputOrderId(e.target.value)}
                placeholder="e.g. ORD-10102 or from your invoice"
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#5A1A1A]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{isSubmitting ? 'Publishing...' : 'Submit Royal Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
