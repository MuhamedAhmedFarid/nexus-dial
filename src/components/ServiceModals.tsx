import React, { useState } from 'react';
import { X, CheckCircle, Ship, ShieldCheck, Mail, Calendar, HelpCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    vertical: 'solar',
    timezone: 'est',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API registration
    setSubmitted(true);
    setTimeout(() => {
      // clean up form
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm text-color-accessibility">
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-borderLight overflow-hidden text-left animate-fade-in">
        
        {/* Top Header Decor */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-sunsetCrimson to-sunsetGold"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-textMuted hover:text-textPrimary p-1.5 rounded-lg hover:bg-offsetLight transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#F97316] uppercase block">
              Nexus Dial Campaign Blueprint
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-textPrimary mt-1.5 font-sans leading-tight">
              Schedule Free 15-Min Strategy Session
            </h3>
            <p className="text-xs text-textSecondary mt-2 leading-relaxed">
              We will map custom outbound calling campaigns, design phone lines matching your target territory caller IDs, and discuss integration with your CRM pipeline directly. 
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  High-Ticket Vertical Campaign
                </label>
                <select
                  value={formData.vertical}
                  onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20 font-semibold"
                >
                  <option value="solar">Solar Pre-qualification</option>
                  <option value="roofing">Roofing Storm Assessment</option>
                  <option value="realestate">RE Sourcing & Acquisitions</option>
                  <option value="webdev">Web Tech/SaaS diagnostics</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Preferred US Time Zone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20 font-semibold"
                >
                  <option value="est">EST Coverage Line</option>
                  <option value="cst">CST Coverage Line</option>
                  <option value="mst">MST Coverage Line</option>
                  <option value="pst">PST Coverage Line</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                Brief Campaign Objectives (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Let us know what platforms you use or any specific lists you want scrubbed."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20"
              />
            </div>

            {/* Compliance verification */}
            <div className="mt-5 p-3 rounded-xl bg-[#059669]/5 border border-trustGreen/20 flex gap-2 items-start">
              <ShieldCheck className="w-4.5 h-4.5 text-trustGreen shrink-0 mt-0.5" />
              <p className="text-[10px] text-textSecondary leading-normal">
                By booking, you agree to our confidential handling under mutual NDA guidelines. We guarantee 0% data leakage and full compliance with Federal TCPA limits.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl border border-borderLight bg-white font-bold text-xs text-textSecondary hover:bg-offsetLight transition-colors text-center"
              >
                Cancel Call
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-sans font-bold text-xs tracking-wider uppercase text-center shadow-md hover:scale-[1.02] transform transition-all duration-300"
              >
                Confirm Call Registration
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-trustGreen/10 text-trustGreen flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>
            
            <h3 className="text-xl font-extrabold text-textPrimary leading-none">
              Consultation Scheduled Successfully!
            </h3>
            
            <p className="text-xs text-textSecondary mt-3 leading-relaxed max-w-sm mx-auto">
              Thank you, <strong>{formData.name}</strong>. Our outbound sourcing coordinator will contact you at <strong>{formData.email}</strong> or <strong>{formData.phone}</strong> within 15 minutes to sync calendars.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-offsetLight border border-borderLight inline-flex items-center gap-2 text-left text-xs max-w-sm mx-auto">
              <Calendar className="w-5 h-5 text-sunsetCrimson" />
              <div>
                <span className="font-bold text-textPrimary block">Sandbox Demo Configured</span>
                <span className="text-[11px] text-textSecondary font-semibold">We have blocked out EST Time slots for {formData.company}.</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-bold text-xs uppercase"
            >
              Continue Exploring
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

interface LeadRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  verticalTitle: string;
  ctaText: string;
}

export function LeadRequestModal({ isOpen, onClose, verticalTitle, ctaText }: LeadRequestModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    leadsCount: '1000'
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-color-accessibility">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-borderLight overflow-hidden text-left animate-fade-in">
        
        {/* Border Top Accent */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-sunsetCrimson to-sunsetGold"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-textMuted hover:text-textPrimary p-1 rounded-lg hover:bg-offsetLight"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <span className="text-[10px] font-mono tracking-widest font-extrabold text-trustGreen uppercase block mb-1">
              ✓ INSTANT PORTAL DOWNLOAD
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-textPrimary leading-none font-sans">
              Request Deliverables: {verticalTitle}
            </h3>
            <p className="text-xs text-textSecondary mt-2 leading-relaxed">
              Please finalize your contact details. We will automatically generate and email the latest PDF blueprints and weather mappings straight to your inbox.
            </p>

            <div className="space-y-4 mt-6">
              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@firm.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Business Phone Line
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wide block mb-1">
                  Target Dialer Contacts / Mo
                </label>
                <select
                  value={formData.leadsCount}
                  onChange={(e) => setFormData({ ...formData, leadsCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-borderLight text-xs bg-offsetLight/50 focus:bg-white font-semibold"
                >
                  <option value="1000">&lt; 5,000 lead files</option>
                  <option value="5000">5,000 - 15,000 lead files</option>
                  <option value="20000">15,000 - 50,000 lead files</option>
                  <option value="50000">50,000+ lead files (Full Enterprise)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-lg bg-offsetLight border border-borderLight flex items-center gap-2">
              <Mail className="w-5 h-5 text-sunsetCrimson shrink-0" />
              <span className="text-[11px] text-textSecondary leading-tight">
                Blueprint automatically dispatched. Double-check your email syntax!
              </span>
            </div>

            <button
              type="submit"
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-sans font-bold text-xs uppercase tracking-wider text-center shadow hover:scale-[1.01] transform transition-all duration-300"
            >
              Verify & Download Demographics PDF
            </button>
          </form>
        ) : (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-trustGreen/10 text-trustGreen flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-extrabold text-textPrimary leading-none">
              Blueprint Sent to Inbox!
            </h3>

            <p className="text-xs text-textSecondary mt-3 leading-relaxed">
              We have processed your request for the <strong>{verticalTitle}</strong> campaign file. The document is dispatched to <strong>{formData.email}</strong>. Be sure to check your spam filter if you do not see it in 2 minutes!
            </p>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-bold text-xs uppercase"
            >
              Close Window
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
