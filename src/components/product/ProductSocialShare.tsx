import React, { useState } from 'react';
import {
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Send,
  Mail,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import { BRAND } from '../../constants';

interface ProductSocialShareProps {
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  className?: string;
}

export const ProductSocialShare: React.FC<ProductSocialShareProps> = ({
  product,
  selectedColor,
  selectedSize,
  className = '',
}) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compute shareable URL
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      return `${origin}/product/${product.slug}`;
    }
    return `https://majanyaji.com/product/${product.slug}`;
  };

  const shareUrl = getShareUrl();

  // Curated share message with royal phrasing
  const shareText = `Explore "${product.name}" from ${BRAND.fullName} (₹${product.price.toLocaleString(
    'en-IN'
  )}). Handcrafted luxury ethnic wear for men.`;

  // WhatsApp formatted message with bolding and details
  const getWhatsAppMessage = () => {
    let msg = `✨ *${product.name}* - Majanya Ji Ethnic Wear\n`;
    msg += `💰 *Price:* ₹${product.price.toLocaleString('en-IN')}\n`;
    if (product.categoryName) {
      msg += `🏷️ *Category:* ${product.categoryName}\n`;
    }
    if (product.fabric) {
      msg += `🧵 *Fabric:* ${product.fabric}\n`;
    }
    if (selectedColor) {
      msg += `🎨 *Color:* ${selectedColor}\n`;
    }
    if (selectedSize) {
      msg += `📏 *Size:* ${selectedSize}\n`;
    }
    msg += `\nCheck out this royal outfit here:\n${shareUrl}`;
    return msg;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Product link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Could not copy link to clipboard', 'error');
    }
  };

  // Direct WhatsApp Share
  const handleWhatsAppShare = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(getWhatsAppMessage())}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Facebook Share
  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  // Twitter / X Share
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}&hashtags=MajanyaJi,EthnicWear,MensFashion`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  // Telegram Share
  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      shareText
    )}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  // Email Share
  const handleEmailShare = () => {
    const subject = `Royal Outfit recommendation: ${product.name}`;
    const body = `Hello,\n\nI thought you would like this handcrafted men's ethnic outfit from Majanya Ji:\n\n${product.name}\nPrice: ₹${product.price.toLocaleString(
      'en-IN'
    )}\nCategory: ${product.categoryName}\nFabric: ${product.fabric || 'Premium Silk'}\n\nView and order here:\n${shareUrl}\n\nBest regards!`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Native Device Share (Mobile OS Share Sheet)
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | ${BRAND.name}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        // If user cancelled, don't open modal; otherwise fallback to modal
        if (err?.name === 'AbortError') return;
      }
    }
    setIsOpen(true);
  };

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80';

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        {/* Direct WhatsApp Share Button */}
        <button
          type="button"
          id="product-share-whatsapp-btn"
          onClick={handleWhatsAppShare}
          className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow active:scale-98"
          title="Share directly via WhatsApp"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Share via WhatsApp</span>
        </button>

        {/* All Social Sharing Options Modal Trigger */}
        <button
          type="button"
          id="product-share-all-modal-btn"
          onClick={() => setIsOpen(true)}
          className="py-2.5 px-3.5 border border-gray-300 hover:border-[#5A1A1A] text-gray-700 hover:text-[#5A1A1A] bg-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:bg-[#FAF7F2]"
          title="More social sharing options"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share Outfit</span>
        </button>
      </div>

      {/* Social Media Share Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full border border-[#E5E5E3] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#5A1A1A] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                    Share This Outfit
                  </h3>
                  <p className="text-[11px] text-[#C9A227] font-medium">
                    Send to family &amp; friends for second opinions
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="close-share-modal-btn"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close share dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Card Preview */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#FAF7F2]">
              <div className="flex items-center gap-3.5 bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-16 h-20 object-cover object-top rounded-lg shrink-0 border border-gray-100"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-[#C9A227] uppercase tracking-wider">
                    {product.categoryName}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-[#5A1A1A]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {product.fabric || 'Handcrafted Luxury Fabric'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sharing Channels Grid */}
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Choose a social platform:</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* WhatsApp */}
                  <button
                    type="button"
                    id="share-modal-whatsapp-btn"
                    onClick={handleWhatsAppShare}
                    className="p-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <MessageCircle className="w-5 h-5 fill-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">WhatsApp</span>
                    <span className="text-[9px] text-[#1EBE5D] font-medium">Chat &amp; Status</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    id="share-modal-facebook-btn"
                    onClick={handleFacebookShare}
                    className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Facebook className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">Facebook</span>
                    <span className="text-[9px] text-blue-600 font-medium">Post &amp; Groups</span>
                  </button>

                  {/* Twitter / X */}
                  <button
                    type="button"
                    id="share-modal-twitter-btn"
                    onClick={handleTwitterShare}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
                  >
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Twitter className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">X (Twitter)</span>
                    <span className="text-[9px] text-gray-500 font-medium">Tweet Outfit</span>
                  </button>

                  {/* Telegram */}
                  <button
                    type="button"
                    id="share-modal-telegram-btn"
                    onClick={handleTelegramShare}
                    className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/60 transition-all flex flex-col items-center justify-center gap-1.5 group text-center"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#229ED9] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Send className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">Telegram</span>
                    <span className="text-[9px] text-sky-600 font-medium">Channel / Chat</span>
                  </button>
                </div>
              </div>

              {/* Extra sharing channels: Email & Native Sheet */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id="share-modal-email-btn"
                  onClick={handleEmailShare}
                  className="flex-1 py-2 px-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#5A1A1A]" />
                  <span>Send via Email</span>
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    type="button"
                    id="share-modal-native-btn"
                    onClick={handleNativeShare}
                    className="flex-1 py-2 px-3 rounded-lg border border-gray-200 hover:border-[#5A1A1A] hover:bg-[#FAF7F2] text-[#5A1A1A] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>More Apps...</span>
                  </button>
                )}
              </div>

              {/* Copy Direct Link Section */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-600">
                  Or copy direct link:
                </label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 pr-2 focus-within:border-[#5A1A1A] transition-colors">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent px-2 text-xs text-gray-700 font-mono focus:outline-none truncate"
                  />
                  <button
                    type="button"
                    id="share-modal-copy-link-btn"
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#5A1A1A] hover:bg-[#3D1010] text-white shadow-2xs'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Note */}
            <div className="bg-[#FAF7F2] px-5 py-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Majanya Ji Ethnic Wear, Indore</span>
              <span className="text-[#C9A227] font-semibold">100% Authentic Handcraft</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
