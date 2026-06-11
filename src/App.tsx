/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ServiceVertical } from './types';
import HeaderComponents from './components/HeaderComponents';
import HeroSection from './components/HeroSection';
import PartnerSlider from './components/PartnerSlider';
import PainPoints from './components/PainPoints';
import PipelineJourney from './components/PipelineJourney';
import TimelineScale from './components/TimelineScale';
import ServicesPortals from './components/ServicesPortals';
import SdrSpecialists from './components/SdrSpecialists';
import SourcingTechHub from './components/SourcingTechHub';
import RoiCalculator from './components/RoiCalculator';
import ReviewFaasBlogs from './components/ReviewFaasBlogs';
import Footer from './components/Footer';
import ScrollReveal from './components/ScrollReveal';
import { BookingModal, LeadRequestModal } from './components/ServiceModals';

export default function App() {
  // State for active Lead portal selected in Header / Services section
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceVertical['id']>('solar');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Industry-Custom Lead Magnet Modal State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLeadPortalTitle, setSelectedLeadPortalTitle] = useState('');
  const [selectedLeadCtaText, setSelectedLeadCtaText] = useState('');

  // Smooth scroll navigate helper
  const handleNavigateToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Switch lead portal from anywhere and navigate to its view
  const handleSelectService = (id: ServiceVertical['id']) => {
    setSelectedServiceId(id);
  };

  // Launch lead downloader modal with customized context
  const handleOpenLeadModal = (verticalTitle: string, ctaText: string) => {
    setSelectedLeadPortalTitle(verticalTitle);
    setSelectedLeadCtaText(ctaText);
    setIsLeadModalOpen(true);
  };

  return (
    <div id="nexus-dial-app-shell" className="min-h-screen bg-white text-textPrimary flex flex-col justify-between font-sans selection:bg-sunsetCrimson/10 selection:text-sunsetCrimson text-color-accessibility">
      
      {/* 2. Global Header & Contact Ribbons */}
      <HeaderComponents 
        onNavigateToSection={handleNavigateToSection}
        onSelectService={handleSelectService}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
      />

      {/* Main Single Page content wrapper */}
      <main className="flex-grow">
        
        {/* 3.1 Hero Header Section */}
        <HeroSection 
          onOpenBookingModal={() => setIsBookingModalOpen(true)}
          onNavigateToSection={handleNavigateToSection}
        />

        {/* 3.2 Trusted Brand Sliding Ribbon */}
        <ScrollReveal delay={0.1}>
          <PartnerSlider />
        </ScrollReveal>

        {/* 3.3 Outbound Core Pain Points */}
        <ScrollReveal>
          <PainPoints />
        </ScrollReveal>

        {/* 3.4 Outbound Pipeline Journey */}
        <ScrollReveal>
          <PipelineJourney />
        </ScrollReveal>

        {/* 3.5 Operational Timeline & Sourcing Scales */}
        <ScrollReveal>
          <TimelineScale />
        </ScrollReveal>

        {/* 4. Specialized Lead Portals (Roofing, Solar, Real estate, Web dev) */}
        <ScrollReveal>
          <ServicesPortals 
            selectedServiceId={selectedServiceId}
            onSelectServiceId={handleSelectService}
            onOpenLeadModal={handleOpenLeadModal}
          />
        </ScrollReveal>

        {/* 4.5 World-Class Dedicated SDR Specialists */}
        <ScrollReveal>
          <SdrSpecialists />
        </ScrollReveal>

        {/* 5. Talent Sourcing, Accent-Audits, & CRM Integrations Tech Hub */}
        <ScrollReveal>
          <SourcingTechHub />
        </ScrollReveal>

        {/* 6.1 State-driven B2B ROI Calculator */}
        <ScrollReveal>
          <RoiCalculator 
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
          />
        </ScrollReveal>

        {/* 6.2 Certifications, Testimonials Accordions, FAQ, Blog feeds */}
        <ScrollReveal>
          <ReviewFaasBlogs />
        </ScrollReveal>

      </main>

      {/* Global Interactive Navigation Footer */}
      <Footer 
        onNavigateToSection={handleNavigateToSection}
        onSelectService={handleSelectService}
        onOpenBookingModal={() => setIsBookingModalOpen(true)}
      />

      {/* --- Overlay Modals System --- */}
      
      {/* Dynamic Free Strategy Callback booker */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Industry custom lead magnet downloader */}
      <LeadRequestModal 
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        verticalTitle={selectedLeadPortalTitle}
        ctaText={selectedLeadCtaText}
      />

    </div>
  );
}
