import React, { useState, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  Filter,
  ArrowUpDown,
  Sparkles,
  PenTool,
  Check,
  Trash2,
  AlertCircle,
  LogIn,
  UserCheck,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { Product, Review } from '../../types';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface ReviewsProps {
  product: Product;
  onNavigate?: (path: string) => void;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; desc: string }> = {
  1: { label: 'Poor', desc: 'Did not meet expectations in fabric or finish' },
  2: { label: 'Fair', desc: 'Acceptable but has notable shortcomings' },
  3: { label: 'Good', desc: 'Satisfactory quality and traditional styling' },
  4: { label: 'Very Good', desc: 'High quality craftsmanship and great fitting' },
  5: { label: 'Exceptional Royal Quality', desc: 'Masterpiece fitting, luxurious silk, and imperial finish' },
};

export const Reviews: React.FC<ReviewsProps> = ({ product, onNavigate }) => {
  const { reviews, addReview, deleteReview, voteHelpfulReview, orders } = useShop();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  // Filter and sort state
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Review submission state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [fitFeedback, setFitFeedback] = useState<'Runs Small' | 'True to Size' | 'Runs Large'>('True to Size');
  const [optionalOrderId, setOptionalOrderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Check if current logged-in user purchased this product
  const userPurchasedThis = useMemo(() => {
    if (!user) return false;
    return orders.some(
      (o) =>
        (o.userId === user.uid || (user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase())) &&
        o.items?.some((i) => i.productId === product.id || i.name === product.name)
    );
  }, [user, orders, product.id, product.name]);

  // Find orderId for verified purchase if available
  const matchingOrderId = useMemo(() => {
    if (!user) return undefined;
    const foundOrder = orders.find(
      (o) =>
        (o.userId === user.uid || (user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase())) &&
        o.items?.some((i) => i.productId === product.id || i.name === product.name)
    );
    return foundOrder?.orderId || foundOrder?.id;
  }, [user, orders, product.id, product.name]);

  // Filter all reviews for this product
  const productReviews = useMemo(() => {
    return reviews.filter(
      (r) =>
        r.productId === product.id ||
        (r.productName && r.productName.toLowerCase() === product.name.toLowerCase())
    );
  }, [reviews, product.id, product.name]);

  // Aggregate statistics
  const totalReviews = productReviews.length;
  const averageRating = useMemo(() => {
    if (totalReviews === 0) return product.rating || 4.9;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / totalReviews).toFixed(1));
  }, [productReviews, totalReviews, product.rating]);

  // Breakdown per star rating
  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating] = (counts[r.rating] || 0) + 1;
      }
    });
    return counts;
  }, [productReviews]);

  // Fit feedback calculation
  const fitStats = useMemo(() => {
    const fits: Record<string, number> = { 'True to Size': 0, 'Runs Small': 0, 'Runs Large': 0 };
    let totalWithFit = 0;
    productReviews.forEach((r) => {
      if (r.fitFeedback && fits[r.fitFeedback] !== undefined) {
        fits[r.fitFeedback]++;
        totalWithFit++;
      }
    });
    return {
      fits,
      trueToSizePercent: totalWithFit > 0 ? Math.round((fits['True to Size'] / totalWithFit) * 100) : 95,
    };
  }, [productReviews]);

  // Displayed and filtered reviews
  const displayedReviews = useMemo(() => {
    let list = [...productReviews];

    if (selectedStarFilter !== null) {
      list = list.filter((r) => r.rating === selectedStarFilter);
    }

    if (verifiedOnly) {
      list = list.filter((r) => r.verifiedPurchase);
    }

    list.sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      return (b.id || '').localeCompare(a.id || '');
    });

    return list;
  }, [productReviews, selectedStarFilter, verifiedOnly, sortBy]);

  const handleVoteHelpful = (reviewId: string) => {
    if (votedIds.has(reviewId)) return;
    voteHelpfulReview(reviewId);
    setVotedIds((prev) => new Set([...prev, reviewId]));
  };

  const handleOpenForm = () => {
    if (!user) {
      if (onNavigate) {
        onNavigate('/login');
      } else {
        window.location.href = '/login';
      }
      return;
    }

    // Auto-fill city from user profile if not set
    if (!city) {
      const userCity = user.address?.city || '';
      const userState = user.address?.state || '';
      if (userCity) {
        setCity(`${userCity}${userState ? `, ${userState}` : ''}`);
      }
    }

    setIsFormOpen(true);
    setErrorMessage('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      setErrorMessage('You must be signed in to submit a review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please choose a star rating from 1 to 5.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please provide a brief headline for your review.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 15) {
      setErrorMessage('Please write at least 15 characters of feedback detailing fabric quality, fit, or craftsmanship.');
      return;
    }

    const reviewerCity = city.trim() || user.address?.city || 'India';

    setIsSubmitting(true);

    try {
      addReview({
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        customerName: user.name || 'Royal Patron',
        customerEmail: user.email || '',
        city: reviewerCity,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        verifiedPurchase: userPurchasedThis || Boolean(optionalOrderId.trim()),
        fitFeedback,
        orderId: matchingOrderId || optionalOrderId.trim() || undefined,
        helpfulCount: 0,
      });

      // Clear form
      setTitle('');
      setComment('');
      setRating(5);
      setIsFormOpen(false);
      setIsSubmitting(false);
      showToast('Your royal review has been published!', 'success');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to submit review. Please try again.');
    }
  };

  const activeRatingValue = hoverRating || rating;
  const ratingDetails = RATING_DESCRIPTIONS[activeRatingValue] || RATING_DESCRIPTIONS[5];

  return (
    <section id="reviews-component" className="mt-16 pt-12 border-t border-gray-200">
      {/* Header & Write Review Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C9A227] flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" /> Royal Patron Reviews & Ratings
          </span>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#5A1A1A]">
            Customer Feedback & Craftsmanship
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-light">
            Verified ratings and authentic testimonials from patrons who adorned this regal piece.
          </p>
        </div>

        {user ? (
          <button
            id="write-review-toggle-btn"
            onClick={() => (isFormOpen ? setIsFormOpen(false) : handleOpenForm())}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-semibold text-xs uppercase tracking-[0.15em] rounded-lg shadow-md transition-all active:scale-95 shrink-0"
          >
            {isFormOpen ? (
              <>
                <X className="w-4 h-4 text-[#C9A227]" />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4 text-[#C9A227]" />
                <span>Write a Review</span>
              </>
            )}
          </button>
        ) : (
          <button
            id="sign-in-to-review-btn"
            onClick={handleOpenForm}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-semibold text-xs uppercase tracking-[0.15em] rounded-lg shadow-md transition-all active:scale-95 shrink-0"
          >
            <LogIn className="w-4 h-4 text-[#C9A227]" />
            <span>Sign In to Review</span>
          </button>
        )}
      </div>

      {/* ================= REVIEW SCORECARD & BREAKDOWN ================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Overall Rating */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-5 bg-[#FAF7F2] rounded-xl border border-amber-200/50">
            <div className="font-cinzel text-5xl sm:text-6xl font-extrabold text-[#5A1A1A] tracking-tight">
              {averageRating}
            </div>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(averageRating)
                      ? 'text-[#C9A227] fill-[#C9A227]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-700">
              Based on {totalReviews} {totalReviews === 1 ? 'patron review' : 'patron reviews'}
            </p>
            <div className="mt-3 pt-3 border-t border-amber-200/60 w-full flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>98% would recommend this royal garment</span>
            </div>
          </div>

          {/* Center: Star Rating Distribution Progress Bars */}
          <div className="md:col-span-5 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
              const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              const isSelected = selectedStarFilter === star;

              return (
                <button
                  key={star}
                  onClick={() =>
                    setSelectedStarFilter((prev) => (prev === star ? null : star))
                  }
                  className={`w-full flex items-center gap-2.5 text-xs group hover:opacity-90 transition-all rounded-md px-2 py-1 ${
                    isSelected ? 'bg-amber-100/70 font-bold' : ''
                  }`}
                  title={`Filter by ${star} star reviews`}
                >
                  <span className="w-12 text-left font-medium text-gray-700 flex items-center gap-1">
                    {star} <Star className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        star >= 4
                          ? 'bg-gradient-to-r from-[#C9A227] to-[#e0ba42]'
                          : star === 3
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-gray-500 font-mono text-[11px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Sizing & Quality Highlights */}
          <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6 space-y-4 text-xs">
            <div>
              <p className="text-gray-500 uppercase font-semibold text-[10px] tracking-wider mb-1">
                Sizing & Fit
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-serif text-[#5A1A1A]">
                  {fitStats.trueToSizePercent}%
                </span>
                <span className="text-gray-700 font-medium">Reported True to Size</span>
              </div>
            </div>

            <div>
              <p className="text-gray-500 uppercase font-semibold text-[10px] tracking-wider mb-1">
                Artisan Quality
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-serif text-[#C9A227]">
                  4.9 / 5.0
                </span>
                <span className="text-gray-700 font-medium">Fabric & Zari Finish</span>
              </div>
            </div>

            {user && userPurchasedThis && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-800 text-[11px]">
                <p className="font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> You purchased this creation
                </p>
                {!isFormOpen && (
                  <button
                    onClick={handleOpenForm}
                    className="mt-1 text-[#5A1A1A] font-bold underline hover:text-black"
                  >
                    Share your experience & size feedback →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= NOT LOGGED IN CALLOUT BANNER ================= */}
      {!user && (
        <div className="mb-8 p-5 bg-[#FAF7F2] border border-[#C9A227]/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5A1A1A] text-[#FAF7F2] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#1E1E1E]">
                Are you a patron of this royal ensemble?
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Sign in to your Majanya Ji account to submit your rating, fitting feedback, and craftsmanship review.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => (onNavigate ? onNavigate('/login') : (window.location.href = '/login'))}
              className="px-4 py-2 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
            >
              Sign In to Review
            </button>
            <button
              onClick={() => (onNavigate ? onNavigate('/register') : (window.location.href = '/register'))}
              className="px-3 py-2 text-xs font-medium text-gray-700 hover:text-[#5A1A1A] underline"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {/* ================= LOGGED IN REVIEW SUBMISSION FORM ================= */}
      {user && isFormOpen && (
        <div
          id="review-submission-form-container"
          className="bg-[#FAF7F2] rounded-2xl p-6 sm:p-8 border border-[#C9A227]/40 shadow-md mb-8 animate-fade-in"
        >
          {/* User ID Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-200/80 gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Reviewing as <strong className="text-[#5A1A1A]">{user.name}</strong> ({user.email})
              </span>
            </div>
            {userPurchasedThis ? (
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Royal Purchase
              </span>
            ) : (
              <span className="text-[11px] text-gray-500">
                Community Patron Review
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Star Rating Selection */}
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

            {/* Sizing & Fit Feedback */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">
                How was the Sizing & Fit? <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:max-w-md">
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

            {/* Review Title */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-1.5">
                Review Title / Headline <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Imperial craftsmanship and regal drape for my reception"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A1A1A]/30 focus:border-[#5A1A1A] transition-all"
              />
            </div>

            {/* Written Comment */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase font-bold tracking-wider text-gray-700">
                  Written Feedback & Craftsmanship Details <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] text-gray-500">
                  {comment.length} characters (min. 15)
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe the weave texture, embroidery finish, fitting comfort during ceremonies, and overall royal impression..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5A1A1A]/30 focus:border-[#5A1A1A] transition-all resize-none"
              />
            </div>

            {/* Location & Optional Order ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-1">
                  City, State
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#5A1A1A]"
                />
              </div>

              {!userPurchasedThis && (
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-1">
                    Order ID (Optional — grants Verified Badge)
                  </label>
                  <input
                    type="text"
                    value={optionalOrderId}
                    onChange={(e) => setOptionalOrderId(e.target.value)}
                    placeholder="e.g. ORD-10294"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>
              )}
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
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
      )}

      {/* ================= FILTER & SORT TOOLBAR ================= */}
      <div className="bg-[#FAF7F2] rounded-xl p-3 sm:p-4 border border-gray-200/80 mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => {
              setSelectedStarFilter(null);
              setVerifiedOnly(false);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedStarFilter === null && !verifiedOnly
                ? 'bg-[#5A1A1A] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            All ({totalReviews})
          </button>
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              onClick={() =>
                setSelectedStarFilter((prev) => (prev === star ? null : star))
              }
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                selectedStarFilter === star
                  ? 'bg-[#5A1A1A] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 text-[#C9A227] fill-[#C9A227]" />
              <span className="text-[10px] opacity-75">({starCounts[star] || 0})</span>
            </button>
          ))}
          <button
            onClick={() => setVerifiedOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              verifiedOnly
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Buyers Only</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-lg text-xs py-1.5 px-3 font-medium text-gray-800 focus:outline-none focus:border-[#5A1A1A]"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Active Filter notification */}
      {(selectedStarFilter !== null || verifiedOnly) && (
        <div className="mb-4 flex items-center justify-between text-xs text-gray-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          <span>
            Showing {displayedReviews.length} {displayedReviews.length === 1 ? 'review' : 'reviews'} matching selected filters
          </span>
          <button
            onClick={() => {
              setSelectedStarFilter(null);
              setVerifiedOnly(false);
            }}
            className="font-semibold text-[#5A1A1A] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ================= REVIEWS LIST ================= */}
      {displayedReviews.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-[#5A1A1A] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-[#C9A227]" />
          </div>
          <h3 className="font-cinzel text-lg font-bold text-[#1E1E1E] mb-1">
            {totalReviews === 0 ? 'Be the First to Review this Creation' : 'No Reviews Match Your Filter'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            {totalReviews === 0
              ? 'Share your thoughts on the craftsmanship, fit, and fabric quality. Your feedback guides fellow patrons.'
              : 'Try resetting your star or verified filters to view all patron reviews.'}
          </p>
          <button
            onClick={() => {
              if (totalReviews === 0) {
                handleOpenForm();
              } else {
                setSelectedStarFilter(null);
                setVerifiedOnly(false);
              }
            }}
            className="px-6 py-2.5 bg-[#5A1A1A] text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#3D1010] transition-colors"
          >
            {totalReviews === 0 ? (user ? 'Write the First Review' : 'Sign In to Review') : 'View All Reviews'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => {
            const initials = review.customerName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const hasVoted = votedIds.has(review.id);
            const isAuthor = Boolean(user && review.userId && review.userId === user.uid);

            return (
              <div
                key={review.id}
                className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200/90 shadow-sm hover:border-[#C9A227]/50 transition-all text-[#1E1E1E]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5A1A1A] text-[#FAF7F2] flex items-center justify-center font-cinzel font-bold text-sm shadow-sm shrink-0 border border-[#C9A227]/40">
                      {initials || 'MJ'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif font-bold text-sm text-[#1E1E1E]">
                          {review.customerName}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Royal Buyer
                          </span>
                        )}
                        {review.fitFeedback && (
                          <span className="text-[10px] bg-amber-50 text-amber-900 font-medium px-2 py-0.5 rounded border border-amber-200">
                            Fit: {review.fitFeedback}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {review.city} • Reviewed on {review.date}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-amber-200/60 self-start">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating
                            ? 'text-[#C9A227] fill-[#C9A227]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-[#5A1A1A] ml-1">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Headline */}
                {review.title && (
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E1E1E] mb-2">
                    {review.title}
                  </h4>
                )}

                {/* Review Body */}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
                  {review.comment}
                </p>

                {/* Footer: Helpful voting & Admin/Author removal */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVoteHelpful(review.id)}
                      disabled={hasVoted}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                        hasVoted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                          : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-300'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'text-emerald-600' : ''}`} />
                      <span>
                        Helpful ({review.helpfulCount || 0})
                      </span>
                    </button>
                    {hasVoted && (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        ✓ Marked as helpful
                      </span>
                    )}
                  </div>

                  {/* Admin or Author Delete */}
                  {(isAdmin || isAuthor) && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors flex items-center gap-1 text-[11px]"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
