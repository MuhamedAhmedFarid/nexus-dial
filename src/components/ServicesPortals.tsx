import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceVertical } from '../types';
import { 
  Home, 
  Sun, 
  Building2, 
  Code2, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  Sparkles, 
  ShieldAlert, 
  MapPin, 
  FileCheck2, 
  Coins 
} from 'lucide-react';

interface ServicesPortalsProps {
  selectedServiceId: ServiceVertical['id'];
  onSelectServiceId: (id: ServiceVertical['id']) => void;
  onOpenLeadModal: (verticalTitle: string, ctaText: string) => void;
}

export default function ServicesPortals({
  selectedServiceId,
  onSelectServiceId,
  onOpenLeadModal,
}: ServicesPortalsProps) {

  const services: ServiceVertical[] = [
    {
      id: 'solar',
      title: 'Solar Outreach',
      tagline: 'Solar Leads Portal',
      heroTagline: 'Book pre-qualified appointments with energy-ready homeowners.',
      campaignBlueprint: {
        title: 'Energy-Ready Property Assessment Routing',
        description: 'Targeted outbound calling using solar irradiance maps. We screen prospects based on roof orientation, tree shading, local utility rates, and active state solar tax credits.',
        tactics: [
          'High-Irradiance homeowner list generation',
          'Utility bill threshold vetting ($150/mo minimum)',
          'Shading and solar-readiness assessment pre-filters',
          'Federal/State clean-energy credit consultation pitching'
        ]
      },
      termSpecifics: {
        label: 'Vetting Framework Checklist',
        items: [
          'Home ownership verification (No tenants / Renters)',
          'Average monthly electricity utility minimum checked',
          'Shading and roof status verification (No active leaks / Good condition)',
          'Awareness of local net metering incentive programs'
        ]
      },
      primaryCta: 'Download Our Solar Pre-Qualification Script',
      accent: 'sunsetGold',
      metrics: ['93% homeowner vetting accuracy', '4.2x average ROI', '24 hr calendar sync']
    },
    {
      id: 'roofing',
      title: 'Roofing Outreach',
      tagline: 'Roofing Leads Portal',
      heroTagline: 'Fill your calendar with high-ticket roofing contracts.',
      campaignBlueprint: {
        title: 'Weather-Mapped Storm Assessment Campaign',
        description: 'We track active weather data to build highly localized geographic campaigns directly after Hail or Wind damage declarations in your target area.',
        tactics: [
          'Post-storm local demographic zip-code targeting',
          'Commercial-grade roof assessments scheduling',
          'Cold-outreach insurance claim adjuster synchronization scripts',
          'Seasonal preventive maintenance contract outbound pipelines'
        ]
      },
      termSpecifics: {
        label: 'Damage & Material Script Term Specifics',
        items: [
          'Material verification (Asphalt shingle, Metal, Tile, Flat roof)',
          'Damage inspection indicators (Missing shingles, Water staining, Leaks)',
          'Existing homeowner insurance provider detail logging',
          'Commercial industrial square-footage capacity profiling'
        ]
      },
      primaryCta: 'Request Local Weather Damage Demographics Report',
      accent: 'sunsetCrimson',
      metrics: ['80% storm lead response rate', '45+ state weather mappings', '15 min lead transfer']
    },
    {
      id: 'realestate',
      title: 'Real Estate Acquisitions',
      tagline: 'RE Acquisitions Portal',
      heroTagline: 'Trained real estate virtual assistants for property investors.',
      campaignBlueprint: {
        title: 'API Skip-Traced Absentee Owner Outreach',
        description: 'Our agents utilize advanced skip-tracing tools to identify off-market assets. We contact absentee owners, motivated sellers, and multi-family landlords.',
        tactics: [
          'Skiptracing verified relative contact address lookups',
          'Property condition rating screening (Standard to distressed scale)',
          'Multiple listing status verification checks',
          'Immediate real-time push to investor Podio/Salesforce CRMs'
        ]
      },
      termSpecifics: {
        label: 'Investor Vetting Framework',
        items: [
          'Estimated distress level property inspection ratings',
          'Owner price expecation vs current neighborhood comparables',
          'Timeline motivation (Needs to close in 30 / 60 / 90 days)',
          'Mortgage balance or equity level pre-qualification'
        ]
      },
      primaryCta: 'Schedule a Demo with an Agent Sourcing Coordinator',
      accent: 'sunsetCrimson',
      metrics: ['32% distressed seller touch rate', '8,200+ property lists mapped', '99.8% CRM integration']
    },
    {
      id: 'webdev',
      title: 'Web Dev Sales',
      tagline: 'Web Dev Leads Portal',
      heroTagline: 'Book high-converting software and site optimization audits.',
      campaignBlueprint: {
        title: 'Technical Web Diagnostics Outreach',
        description: 'We run pre-outreach site checks capturing page crawl speeds, broken forms, insecure SSL setups, and mobile responsive display gaps.',
        tactics: [
          'Diagnostic speed report direct cold delivery',
          'SEO responsive and security vulnerability audits pitching',
          'Modern headless CMS and e-commerce migration sales pipelines',
          'Consultative strategy call scheduling for developers'
        ]
      },
      termSpecifics: {
        label: 'Platform & Audit Checkpoints',
        items: [
          'CMS type tracking (WordPress, Shopify, Webflow, Custom)',
          'Mobile layout responsive viewport speed diagnostics',
          'Broken checkout / contact form friction tracking',
          'Core Web Vitals diagnostic script scores logs'
        ]
      },
      primaryCta: 'Analyze My Target Database Booking Rates',
      accent: 'sunsetGold',
      metrics: ['45% diagnostic audit open rate', '2.8x meeting response boost', 'Instant API handoffs']
    }
  ];

  const activeService = services.find(s => s.id === selectedServiceId) || services[0];

  return (
    <section 
      id="services-portals" 
      className="py-20 bg-white border-b border-borderLight text-color-accessibility scroll-mt-12"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
            Outsource Campaign Portals
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
            High-Ticket Vertical Lead Systems
          </h2>
          <p className="text-textSecondary text-sm sm:text-base mt-2 col-textSecondary font-medium">
            Toggle between our specialized campaign portals to explore specific industry workflows, vetting checklists, and scripts designed for high-ticket contracts.
          </p>
        </div>

        {/* Portal Switcher Tabs with liquid layout animation */}
        <div 
          id="services-tabs-selector"
          className="flex flex-wrap justify-center gap-1.5 mb-10 p-1.5 bg-offsetLight border border-borderLight rounded-2xl max-w-4xl mx-auto relative"
        >
          {services.map((item) => {
            const isActive = item.id === selectedServiceId;
            const getTabIcon = (id: string) => {
              switch (id) {
                case 'solar': return <Sun className="w-4 h-4" />;
                case 'roofing': return <Layers className="w-4 h-4" />;
                case 'realestate': return <Home className="w-4 h-4" />;
                case 'webdev': return <Code2 className="w-4 h-4" />;
                default: return <Home className="w-4 h-4" />;
              }
            };

            return (
              <motion.button
                key={item.id}
                onClick={() => onSelectServiceId(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide select-none transition-colors duration-200 z-10 overflow-hidden cursor-pointer"
                style={{ color: isActive ? '#FFFFFF' : 'var(--color-textSecondary)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-gradient-to-r from-sunsetCrimson to-sunsetGold -z-10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    style={{ borderRadius: '12px' }}
                  />
                )}
                <span className={isActive ? 'text-white flex items-center gap-2' : 'flex items-center gap-2 text-textSecondary hover:text-textPrimary'}>
                  {getTabIcon(item.id)}
                  <span>{item.title}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Deep Dive View for Active Portal with entering keys */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeService.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            id={`campaign-portal-view-${activeService.id}`}
            className="bg-offsetLight/85 border border-borderLight rounded-3xl p-6 sm:p-10 shadow-cardSoft text-left relative overflow-hidden"
          >
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-sunsetCrimson to-sunsetGold"></div>

            {/* Top Info Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 pb-8 border-b border-borderLight/80">
              <div className="lg:col-span-8">
                <span className="text-[10px] font-mono tracking-widest font-extrabold text-sunsetCrimson uppercase bg-sunsetCrimson/5 border border-sunsetCrimson/15 px-3 py-1 rounded-full w-fit">
                  ✓ ACTIVE VERTICAL PIPELINE
                </span>
                <h3 className="text-2xl sm:text-3.5xl font-extrabold text-textPrimary mt-3">
                  {activeService.title} Portals
                </h3>
                <p className="text-base sm:text-lg text-textSecondary italic mt-2 font-medium font-sans">
                  "{activeService.heroTagline}"
                </p>
              </div>

              {/* Campaign Portal Metrics */}
              <div className="lg:col-span-4 flex flex-col justify-center gap-2 bg-white/60 border border-borderLight rounded-2xl p-4 sm:p-5">
                <span className="text-[11px] font-mono font-bold text-textMuted uppercase tracking-wider block mb-1">
                  Campaign Benchmarks:
                </span>
                {activeService.metrics.map((metric, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-xs font-semibold text-textPrimary"
                  >
                    <CheckCircle2 className="w-4 h-4 text-trustGreen shrink-0" />
                    <span>{metric}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Core Content Grid (Section split) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Campaign Blueprint (Left Box) */}
              <div className="lg:col-span-6 bg-white border border-borderLight/85 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-textMuted mb-3">
                    <BookOpen className="w-4 h-4 text-sunsetCrimson" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider">
                      Target Campaign Blueprint
                    </h4>
                  </div>

                  <h5 className="text-base font-extrabold text-textPrimary">
                    {activeService.campaignBlueprint.title}
                  </h5>

                  <p className="text-xs text-textSecondary mt-2 leading-relaxed font-semibold">
                    {activeService.campaignBlueprint.description}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block">
                      Execution Tactics:
                    </span>
                    {activeService.campaignBlueprint.tactics.map((tactic, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ x: 3 }}
                        className="flex items-start gap-2.5 text-xs text-textSecondary"
                      >
                        <span className="w-5 h-5 rounded-full bg-offsetLight border border-borderLight flex items-center justify-center text-[10px] font-mono font-bold text-sunsetCrimson shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="font-semibold leading-tight">{tactic}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-borderLight/50 flex items-center gap-1.5 text-xs text-textMuted">
                  <Sparkles className="w-4 h-4 text-sunsetGold" />
                  <span>Synchronized with native dialers and lead scrubbers.</span>
                </div>
              </div>

              {/* Vetting Framework Checklist (Right Box) */}
              <div className="lg:col-span-6 bg-white border border-borderLight/85 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-textMuted mb-3">
                    <FileCheck2 className="w-4 h-4 text-[#059669]" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider">
                      {activeService.termSpecifics.label}
                    </h4>
                  </div>

                  <p className="text-xs text-textSecondary mb-4 font-semibold">
                    We guarantee 100% pre-qualification. Every lead has been vocally vetted against these parameters prior to transfer:
                  </p>

                  <div className="space-y-3">
                    {activeService.termSpecifics.items.map((item, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ y: -2, scale: 1.01 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-offsetLight/50 border border-borderLight/40 hover:bg-offsetLight transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-trustGreen/10 flex items-center justify-center text-trustGreen shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-textPrimary leading-none">{item.split(' (')[0]}</p>
                          {item.includes('(') && (
                            <span className="text-[10px] text-textMuted mt-0.5 block">
                              ({item.split(' (')[1]}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-borderLight/50">
                  <motion.button
                    onClick={() => onOpenLeadModal(activeService.title, activeService.primaryCta)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-bold text-xs tracking-wider uppercase text-center shadow-md cursor-pointer"
                  >
                    {activeService.primaryCta}
                  </motion.button>
                </div>
              </div>

            </div>

            {/* Sticky Trust Guard Note */}
            <div className="mt-8 p-4 rounded-xl bg-[#059669]/5 border border-trustGreen/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-left">
                <ShieldAlert className="w-5 h-5 text-trustGreen shrink-0 animate-bounce" />
                <span className="text-xs font-bold text-textPrimary leading-snug">
                  Data Security: 256-bit CRM sync shielding. All listings are automatically scrubbed on NDAs.
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white text-trustGreen px-2.5 py-1 rounded border border-trustGreen/20 shrink-0 select-none">
                ✓ COMPLIANT OUTBOUND ROUTE
              </span>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
