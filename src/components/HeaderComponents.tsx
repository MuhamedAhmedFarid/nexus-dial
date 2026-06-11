import { useState, useEffect } from 'react';
import { Mail, Phone, ChevronDown, Menu, X, Activity } from 'lucide-react';
import { ServiceVertical } from '../types';

interface HeaderProps {
  onNavigateToSection: (sectionId: string) => void;
  onSelectService: (serviceId: ServiceVertical['id']) => void;
  onOpenBookingModal: () => void;
}

export default function HeaderComponents({
  onNavigateToSection,
  onSelectService,
  onOpenBookingModal,
}: HeaderProps) {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menus on click outside or document scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSolutionsOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solutions = [
    { id: 'solar', name: 'Solar Outreach', label: 'Solar Leads Portal' },
    { id: 'roofing', name: 'Roofing Outreach', label: 'Roofing Leads Portal' },
    { id: 'realestate', name: 'Real Estate Acquisitions', label: 'RE Acquisitions Portal' },
    { id: 'webdev', name: 'Web Dev Sales', label: 'Web Dev Leads Portal' },
  ] as const;

  const navMenuItems = [
    { label: 'Quality Hub', sectionId: 'quality-hub' },
    { label: 'FAQ', sectionId: 'faq' },
    { label: 'Velocity Blog', sectionId: 'blog' },
  ];

  return (
    <header className="w-full z-50">
      {/* 2.1 Utility Contact Header */}
      <div 
        id="utility-contact-header"
        className="w-full h-10 bg-offsetLight border-b border-borderLight flex items-center justify-between px-4 sm:px-6 text-xs text-textSecondary font-sans text-color-accessibility"
      >
        {/* Left Flex: Direct contact links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            id="utility-email-link"
            href="mailto:info@nexusdial.com"
            className="flex items-center gap-1.5 hover:text-sunsetCrimson transition-colors duration-250 font-medium"
          >
            <Mail className="w-3.5 h-3.5 text-textMuted stroke-[1.8]" />
            <span className="hidden sm:inline">info@nexusdial.com</span>
            <span className="sm:hidden">Email Us</span>
          </a>
          <a
            id="utility-call-link"
            href="tel:+18017626680"
            className="flex items-center gap-1.5 hover:text-sunsetCrimson transition-colors duration-250 font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-textMuted stroke-[1.8]" />
            <span>+1 (801) 762-6680</span>
          </a>
        </div>

        {/* Right Flex: Dynamic Label and Pulsating status indicator */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[10px] sm:text-xs text-textSecondary hidden xs:inline tracking-wide uppercase">
            🇺🇸 US Time Zone Coverage (EST–PST)
          </span>
          <span className="font-semibold text-[10px] sm:text-[11px] text-textSecondary xs:hidden">
            EST–PST
          </span>
          <span className="relative flex h-2 w-2 ml-1" id="time-zone-status-dot">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trustGreen opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-trustGreen-600 bg-trustGreen"></span>
          </span>
        </div>
      </div>

      {/* 2.2 Navigation Bar */}
      <nav 
        id="main-navigation-bar"
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-borderLight h-[75px] w-full flex items-center justify-between px-6 sm:px-8 text-color-accessibility"
      >
        {/* Left: Typographic logo structured */}
        <div 
          id="brand-logo-container"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Vibrant orange-to-gold hexagon honeycomb brand mark */}
          <div className="relative w-9 h-10 flex items-center justify-center">
            <svg 
              className="w-full h-full text-sunsetCrimson transition-transform duration-300 group-hover:scale-110" 
              viewBox="0 0 100 115" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Nexus Dial Logo Visual Indicator"
            >
              {/* Outer hex */}
              <path 
                d="M50 2.5L93.3 27.5V77.5L50 102.5L6.7 77.5V27.5L50 2.5Z" 
                fill="url(#logoGrad)" 
                stroke="#F97316" 
                strokeWidth="4"
              />
              {/* Inner honeycomb pattern */}
              <path 
                d="M50 20L76 35V65L50 80L24 65V35L50 20Z" 
                fill="white" 
                opacity="0.9"
              />
              {/* Central small hexagon core */}
              <path 
                d="M50 35L63 42.5V57.5L50 65L37 57.5V42.5L50 35Z" 
                fill="url(#logoGradAlt)"
              />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="logoGradAlt" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-[9px] font-bold text-sunsetCrimson top-[13px] right-[-4px] bg-white px-0.5 rounded border border-sunsetCrimson/10">DIAL</span>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold text-xl tracking-tight text-textPrimary leading-none">
              Nexus <span className="text-sunsetCrimson bg-gradient-to-r from-sunsetCrimson to-sunsetGold bg-clip-text text-transparent">Dial</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-textMuted uppercase">Premium Outbound</span>
          </div>
        </div>

        {/* Center Menu: Interactive dropdown layout (Desktop) */}
        <div id="desktop-menu-links" className="hidden lg:flex items-center gap-8 font-sans">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative py-2 text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors duration-200 group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-sunsetCrimson transition-all duration-300 group-hover:w-full"></span>
          </button>

          {/* Solutions Dropdown Menu */}
          <div className="relative">
            <button
              onMouseEnter={() => setIsSolutionsOpen(true)}
              onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
              className="relative py-2 text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors duration-200 inline-flex items-center gap-1 group"
            >
              <span>Solutions</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-250 ${isSolutionsOpen ? 'rotate-180' : ''}`} />
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-sunsetCrimson transition-all duration-200 group-hover:w-full"></span>
            </button>

            {isSolutionsOpen && (
              <div
                onMouseLeave={() => setIsSolutionsOpen(false)}
                className="absolute left-0 mt-2 w-64 bg-white border border-borderLight rounded-xl shadow-xl py-3 z-50 animate-fade-in text-left"
              >
                <div className="px-4 py-1.5 text-[11px] font-bold text-textMuted uppercase tracking-wider border-b border-borderLight/60 mb-2">
                  Specialized Lead Portals
                </div>
                {solutions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectService(item.id);
                      onNavigateToSection('services-portals');
                      setIsSolutionsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-textSecondary hover:bg-offsetLight hover:text-sunsetCrimson transition-colors font-medium flex items-center justify-between"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] bg-sunsetCrimson/10 text-sunsetCrimson px-2 py-0.5 rounded-full font-mono scale-90">
                      LEADS
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {navMenuItems.map((item) => (
            <button
              key={item.sectionId}
              onClick={() => onNavigateToSection(item.sectionId)}
              className="relative py-2 text-sm font-semibold text-textSecondary hover:text-textPrimary transition-colors duration-200 group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-sunsetCrimson transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </div>

        {/* Right: Sunset gradient action CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            id="nav-cta-btn"
            onClick={onOpenBookingModal}
            className="relative px-5 py-2.5 rounded-full bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-sans font-bold text-sm tracking-wide shadow-md hover:shadow-cardHover hover:scale-[1.03] transition-all duration-300 active:scale-95"
          >
            Book Free Strategy Call
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-offsetLight transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col justify-between pb-8 border-b border-borderLight animate-fade-in shadow-xl">
          <div className="flex flex-col gap-5 text-left">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[18px] font-bold text-textPrimary py-2 border-b border-borderLight text-left"
            >
              Home
            </button>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-textMuted uppercase tracking-wider">Our Solutions</span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {solutions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectService(item.id);
                      onNavigateToSection('services-portals');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-3 rounded-lg border border-borderLight bg-offsetLight text-xs font-bold text-textSecondary text-left hover:border-sunsetCrimson hover:text-sunsetCrimson transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {navMenuItems.map((item) => (
              <button
                key={item.sectionId}
                onClick={() => {
                  onNavigateToSection(item.sectionId);
                  setIsMobileMenuOpen(false);
                }}
                className="text-[18px] font-bold text-textPrimary py-2 border-b border-borderLight text-left"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBookingModal();
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-bold text-center text-base tracking-wide shadow-lg"
            >
              Book Free Strategy Call
            </button>
            <div className="text-center text-xs text-textMuted">
              Timezone coverage: Central, Eastern, Mountain & Pacific
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
