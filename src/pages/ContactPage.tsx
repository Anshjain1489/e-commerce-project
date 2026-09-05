import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Mail,
  Send,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { BRAND } from '../constants';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { addInquiry } = useShop();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Wedding Wardrobe Consultation');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addInquiry({
        name,
        email,
        phone,
        subject,
        message,
      });
      setIsSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      showToast('Thank you! Your message has been sent to Siddhant Jain.', 'success');
    } catch {
      setIsSubmitting(false);
      showToast('Failed to send message. Please try WhatsApp.', 'error');
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#C9A227] block mb-2">
            Get in Touch
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#1E1E1E] mb-4">
            Contact Majanya Ji
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
            Have questions regarding sizing, custom bridal & wedding orders, or store visits? We are delighted to assist you.
          </p>
          <div className="w-16 h-0.5 bg-[#C9A227] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* ================= LEFT COLUMN: CONTACT DETAILS ================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C9A227]/30 shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#5A1A1A] pb-3 border-b border-gray-100">
                Flagship Retail Store
              </h2>

              {/* Address */}
              <div className="flex items-start gap-4 text-xs sm:text-sm text-gray-700">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center shrink-0 text-[#5A1A1A]">
                  <MapPin className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E1E1E] mb-1">Store Address</h3>
                  <p className="leading-relaxed">
                    {BRAND.address.street}<br />
                    {BRAND.address.locality}<br />
                    {BRAND.address.city}, {BRAND.address.state} - {BRAND.address.pinCode}<br />
                    {BRAND.address.country}
                  </p>
                </div>
              </div>

              {/* Phone & Contact Person */}
              <div className="flex items-start gap-4 text-xs sm:text-sm text-gray-700">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center shrink-0 text-[#5A1A1A]">
                  <Phone className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E1E1E] mb-1">Direct Call</h3>
                  <p className="text-xs text-gray-500 mb-0.5">Contact Person: {BRAND.contactPerson}</p>
                  <a href={BRAND.phoneLink} className="text-[#5A1A1A] font-bold hover:underline">
                    {BRAND.phone}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4 text-xs sm:text-sm text-gray-700">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0 text-[#25D366]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E1E1E] mb-1">WhatsApp Sizing Concierge</h3>
                  <a
                    href={BRAND.whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] font-bold hover:underline"
                  >
                    {BRAND.whatsApp}
                  </a>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Fastest responses within 15 minutes.
                  </p>
                </div>
              </div>

              {/* Store Timings */}
              <div className="flex items-start gap-4 text-xs sm:text-sm text-gray-700">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C9A227]/40 flex items-center justify-center shrink-0 text-[#5A1A1A]">
                  <Clock className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E1E1E] mb-1">Store Hours</h3>
                  <p className="font-semibold text-gray-900">10:30 AM – 9:30 PM</p>
                  <p className="text-xs text-emerald-700 font-medium">Open All 7 Days (Mon - Sun)</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout Card */}
            <div className="bg-[#25D366] text-white rounded-2xl p-6 shadow-lg flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm">Prefer Immediate Chat?</h3>
                <p className="text-xs text-white/90">Talk directly to Siddhant Jain on WhatsApp</p>
              </div>
              <a
                href={BRAND.whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white text-[#25D366] font-bold text-xs rounded-lg shadow uppercase tracking-wider hover:bg-gray-100 transition-colors shrink-0"
              >
                Chat Now
              </a>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: INQUIRY FORM ================= */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-10 border border-[#C9A227]/30 shadow-sm">
            <h2 className="font-cinzel text-xl font-bold text-[#5A1A1A] mb-2">
              Send an Inquiry
            </h2>
            <p className="text-xs text-gray-500 mb-8 font-light">
              Fill in your requirements for custom sizes, wedding party ensembles, or product queries.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-cinzel text-lg font-bold text-emerald-900 mb-1">
                  Message Dispatched!
                </h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto mb-6">
                  Thank you for writing to us. Siddhant Jain will review your message and reply via phone or WhatsApp shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-[#5A1A1A] text-white text-xs font-semibold rounded"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Rathore"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vikram@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      WhatsApp / Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                    >
                      <option value="Wedding Wardrobe Consultation">Wedding Wardrobe Consultation</option>
                      <option value="Custom Size / Tailoring Inquiry">Custom Size / Tailoring Inquiry</option>
                      <option value="Store Visit Appointment">Store Visit Appointment</option>
                      <option value="Online Order Query">Online Order Query</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Your Message / Requirements *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about the occasion, preferred colors, or questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#5A1A1A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#5A1A1A] hover:bg-[#3D1010] text-[#FAF7F2] text-xs font-semibold uppercase tracking-[0.2em] rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Transmitting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#C9A227]" />
                      <span>Send Royal Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
