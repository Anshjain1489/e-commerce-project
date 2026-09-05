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
  Smile,
  AlertCircle,
} from 'lucide-react';
import { Product, Review } from '../../types';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { WriteReviewModal } from './WriteReviewModal';

interface ProductReviewsSectionProps {
  product: Product;
  onOpenWriteModal?: () => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
}) => {
  const { reviews, deleteReview, voteHelpfulReview, orders } = useShop();
  const { user, isAdmin } = useAuth();

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Filter reviews for this product by ID or name
  const productReviews = useMemo(() => {
    return reviews.filter(
      (r) =>
        r.productId === product.id ||
        (r.productName && r.productName.toLowerCase() === product.name.toLowerCase())
    );
  }, [reviews, product.id, product.name]);

  // Aggregate stats
  const totalReviews = productReviews.length;
  const averageRating = useMemo(() => {
    if (totalReviews === 0) return 4.9; // Default royal benchmark if no reviews yet
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / totalReviews).toFixed(1));
  }, [productReviews, totalReviews]);

  // Star breakdown counts
  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating] = (counts[r.rating] || 0) + 1;
      }
    });
    return counts;
  }, [productReviews]);

  // Fit feedback stats
  const fitCounts = useMemo(() => {
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
      trueToSizePercent: totalWithFit > 0 ? Math.round((fits['True to Size'] / totalWithFit) * 100) : 94,
    };
  }, [productReviews]);

  // Filtered & Sorted reviews
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
      // 'recent' by default (using id timestamp or date parsing)
      return (b.id || '').localeCompare(a.id || '');
    });

    return list;
  }, [productReviews, selectedStarFilter, verifiedOnly, sortBy]);

  const handleVoteHelpful = (reviewId: string) => {
    if (votedIds.has(reviewId)) return;
    voteHelpfulReview(reviewId);
    setVotedIds((prev) => new Set([...prev, reviewId]));
  };

  // Check if current user has an order with this product
  const userPurchasedThis = Boolean(
    user &&
      orders.some(
        (o) =>
          (o.userId === user.id || o.customerEmail === user.email) &&
          o.items?.some((i) => i.productId === product.id || i.name === product.name)
      )
  );

  return (
    <section id="product-reviews-section" className="mt-16 pt-12 border-t border-gray-200">
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#C9A227] flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" /> Royal Patron Reviews & Ratings
          </span>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#5A1A1A]">
            Customer Feedback & Craftsmanship
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 font-light">
            Authentic experiences from patrons across India who wore this creation.
          </p>
        </div>

        <button
          id="open-write-review-btn"
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] font-semibold text-xs uppercase tracking-[0.15em] rounded-lg shadow-md transition-all active:scale-95 shrink-0"
        >
          <PenTool className="w-4 h-4 text-[#C9A227]" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* ================= REVIEW SCORECARD & BREAKDOWN ================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Overall Rating */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-[#FAF7F2] rounded-xl border border-amber-200/50">
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
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'patron reviews'}
            </p>
            <div className="mt-3 pt-3 border-t border-amber-200/60 w-full flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>98% would recommend this outfit</span>
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
                  className={`w-full flex items-center gap-2.5 text-xs group hover:opacity-90 transition-all rounded-md px-1.5 py-0.5 ${
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
                Sizing & Silhouette
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-serif text-[#5A1A1A]">
                  {fitCounts.trueToSizePercent}%
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
                <span className="text-gray-700 font-medium">Embroidery & Fabric Finish</span>
              </div>
            </div>

            {userPurchasedThis && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-emerald-800 text-[11px]">
                <p className="font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> You purchased this item
                </p>
                <button
                  onClick={() => setIsWriteModalOpen(true)}
                  className="mt-1 text-[#5A1A1A] font-bold underline hover:text-black"
                >
                  Share your sizing feedback →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
            Showing {displayedReviews.length} {displayedReviews.length === 1 ? 'review' : 'reviews'} matching filters
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
              ? 'Share your thoughts on the craftsmanship, fit, and fabric quality. Your feedback guides fellow royal patrons.'
              : 'Try clearing your star or verified filters to read all customer experiences.'}
          </p>
          <button
            onClick={() => {
              if (totalReviews === 0) {
                setIsWriteModalOpen(true);
              } else {
                setSelectedStarFilter(null);
                setVerifiedOnly(false);
              }
            }}
            className="px-6 py-2.5 bg-[#5A1A1A] text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#3D1010] transition-colors"
          >
            {totalReviews === 0 ? 'Write the First Review' : 'View All Reviews'}
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

                {/* Review Title & Written Feedback */}
                {review.title && (
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E1E1E] mb-2">
                    {review.title}
                  </h4>
                )}

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
                  {review.comment}
                </p>

                {/* Footer: Helpful voting & Admin delete */}
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

                  {/* Admin or Author removal */}
                  {isAdmin && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors flex items-center gap-1 text-[11px]"
                      title="Moderator: Delete Review"
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

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        product={product}
      />
    </section>
  );
};
