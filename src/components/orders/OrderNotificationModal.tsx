import React, { useState } from 'react';
import {
  X,
  Mail,
  Smartphone,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Send,
  Terminal,
  ShieldCheck,
  Check,
  PhoneCall,
} from 'lucide-react';
import { OrderNotification } from '../../types';
import { getNativeSmsUri, getWhatsAppAlertUrl } from '../../utils/notificationSystem';
import { useToast } from '../../context/ToastContext';

interface OrderNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: OrderNotification | null;
  onResend?: (channel: 'email' | 'sms' | 'both') => void;
}

export const OrderNotificationModal: React.FC<OrderNotificationModalProps> = ({
  isOpen,
  onClose,
  notification,
  onResend,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'sms' | 'email' | 'payload'>('sms');
  const [copied, setCopied] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);

  if (!isOpen || !notification) return null;

  const handleCopySms = () => {
    navigator.clipboard.writeText(notification.smsContent || '');
    setCopied(true);
    showToast('SMS alert copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmailSubject = () => {
    navigator.clipboard.writeText(notification.emailSubject || '');
    setCopied(true);
    showToast('Email subject copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResendAction = async (channel: 'email' | 'sms' | 'both') => {
    if (!onResend) return;
    setResending(true);
    try {
      await onResend(channel);
      showToast(`Confirmation alert re-dispatched via ${channel.toUpperCase()}!`, 'success');
    } finally {
      setResending(false);
    }
  };

  const smsUri = getNativeSmsUri(notification.recipientPhone, notification.smsContent);
  const whatsappUrl = getWhatsAppAlertUrl(notification.recipientPhone, notification.smsContent);

  const formattedSentTime = notification.sentAt
    ? new Date(notification.sentAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Just now';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#EADBCE] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-[#5A1A1A] border-b-2 border-[#C9A227] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-base sm:text-lg font-bold tracking-wide">
                  Order Alert Dispatched
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/15 text-[#FAF7F2]">
                  #{notification.orderId}
                </span>
              </div>
              <p className="text-[11px] text-[#E8D7C8]">
                Sent to {notification.customerName} on {formattedSentTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#E8D7C8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Quick Metrics */}
        <div className="bg-white border-b border-[#EADBCE] px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] rounded-lg border border-[#EADBCE]">
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'sms'
                  ? 'bg-[#5A1A1A] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS Alert (Cellular)</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'email'
                  ? 'bg-[#5A1A1A] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>HTML Email Alert</span>
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'payload'
                  ? 'bg-[#5A1A1A] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Delivery Logs & Gateway</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Carrier Delivered
            </span>
            <span className="text-gray-500 hidden sm:inline">&bull;</span>
            <span className="text-gray-600 font-mono text-[11px] hidden sm:inline">
              Stage: <strong className="text-[#5A1A1A] capitalize">{notification.status}</strong>
            </span>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: SMS VIEW */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-[#EADBCE] shadow-xs">
                <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">Sender ID:</span>
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      MJNYAJI
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">Recipient:</span>
                    <span className="font-mono text-[#5A1A1A] font-semibold">
                      {notification.recipientPhone}
                    </span>
                  </div>
                </div>

                {/* Simulated Smartphone Chat Bubble */}
                <div className="my-4 p-4 bg-linear-to-b from-[#F3F4F6] to-[#E5E7EB] rounded-2xl border border-gray-300 max-w-lg mx-auto">
                  <div className="text-[10px] text-center text-gray-500 font-semibold mb-2">
                    Today &bull; Text Message (SMS)
                  </div>
                  <div className="bg-[#1E1E1E] text-white p-3.5 rounded-2xl rounded-tl-xs shadow-md space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[11px]">
                      <span className="font-bold text-[#C9A227] tracking-wider font-cinzel">
                        MAJANYA JI
                      </span>
                      <span className="text-gray-400 text-[10px]">Delivered</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-100 leading-relaxed font-sans">
                      {notification.smsContent}
                    </p>
                    <div className="text-right text-[10px] text-gray-400 flex items-center justify-end gap-1">
                      <span>{formattedSentTime}</span>
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Quick actions for SMS */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                  <div className="text-[11px] text-gray-500">
                    Characters: <strong className="text-gray-800">{notification.smsContent?.length || 0}</strong> / 160 (1 SMS Segment)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySms}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>{copied ? 'Copied!' : 'Copy SMS'}</span>
                    </button>
                    <a
                      href={smsUri}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5A1A1A] hover:bg-[#431313] rounded-lg text-xs font-semibold text-white transition-colors shadow-2xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Open on Phone (SMS)</span>
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20BA59] rounded-lg text-xs font-semibold text-white transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Forward WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL VIEW */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-[#EADBCE] shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pb-3 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Subject:</span>
                      <span className="font-bold text-[#5A1A1A]">{notification.emailSubject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>To: <strong className="text-gray-800">{notification.recipientEmail}</strong></span>
                      <span>&bull;</span>
                      <span>From: <strong className="text-gray-800">orders@majanyaji.in</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyEmailSubject}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium"
                    >
                      <Copy className="w-3 h-3 text-gray-500" />
                      <span>Copy Subject</span>
                    </button>
                  </div>
                </div>

                {/* Rendered HTML Email Frame */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-[#FAF7F2]">
                  <iframe
                    title="Rendered Order Email Alert"
                    srcDoc={notification.emailHtml}
                    className="w-full h-[380px] bg-white border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYLOAD & GATEWAY LOGS */}
          {activeTab === 'payload' && (
            <div className="space-y-3">
              <div className="bg-[#1E1E1E] rounded-xl p-4 text-gray-200 font-mono text-xs border border-gray-800 shadow-md">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800 text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Gateway Dispatched Status: HTTP 200 OK
                  </span>
                  <span className="text-[11px] text-[#C9A227]">ID: {notification.id}</span>
                </div>
                <pre className="overflow-x-auto p-2 bg-black/40 rounded-lg text-[11px] text-emerald-400 leading-relaxed max-h-[300px]">
                  {JSON.stringify(
                    {
                      notificationId: notification.id,
                      orderId: notification.orderId,
                      status: notification.status,
                      recipient: {
                        name: notification.customerName,
                        email: notification.recipientEmail,
                        phone: notification.recipientPhone,
                      },
                      channels: {
                        sms: {
                          provider: 'Telecom DLT FastRoute',
                          senderId: 'MJNYAJI',
                          textLength: notification.smsContent.length,
                          status: 'DELIVERED',
                          messageId: `SMS-${notification.id}`,
                        },
                        email: {
                          provider: 'MajanyaJi Transactional Mailer',
                          subject: notification.emailSubject,
                          status: 'DELIVERED',
                          openRateTracking: true,
                        },
                      },
                      deliveryTimestamp: notification.sentAt,
                      trackingInfo: {
                        courier: notification.courier,
                        awb: notification.trackingNumber,
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-[#EADBCE] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
            <span>Automatic confirmation triggers are live & active</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onResend && (
              <button
                onClick={() => handleResendAction('both')}
                disabled={resending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#5A1A1A] border border-[#C9A227]/40 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Alerts Now</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#5A1A1A] hover:bg-[#431313] text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
