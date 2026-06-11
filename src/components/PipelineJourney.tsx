import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MailOpen, Compass, Zap, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { PipelineStep } from '../types';

export default function PipelineJourney() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps: PipelineStep[] = [
    {
      number: 1,
      title: 'Omnichannel Engagement',
      tagline: 'Multi-Touch Sourcing Action',
      description: 'We synchronize cold calling, direct dual-track email newsletters, and tailored LinkedIn connection sequences to penetrate hard-to-reach target decision makers.',
      hoverAccent: 'sunsetCrimson',
    },
    {
      number: 2,
      title: 'Activation',
      tagline: 'Strategic Qualified Follow-Ups',
      description: 'Personalized voice messages and secondary email sequences nurture cold prospects into warm interest, driving responses and removing objections early.',
      hoverAccent: 'sunsetCrimson',
    },
    {
      number: 3,
      title: 'Conversion',
      tagline: 'Seamless Calendar Scheduling',
      description: 'Once a prospect requests a quote or schedule, our operators transfer them live or book meetings directly in your calendar with pre-qualification forms attached.',
      hoverAccent: 'sunsetCrimson',
    },
    {
      number: 4,
      title: 'Deal Closure',
      tagline: 'Warm Hand-off High Conversion',
      description: 'Your field or Account Executives close sales with comprehensive dossiers on historical touchpoints, lead pain points, and specific industry requirements.',
      hoverAccent: 'sunsetCrimson',
    }
  ];

  const getStepIcon = (num: number) => {
    switch (num) {
      case 1: return <Compass className="w-5 h-5" />;
      case 2: return <Zap className="w-5 h-5" />;
      case 3: return <MailOpen className="w-5 h-5" />;
      case 4: return <BadgeCheck className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  return (
    <section 
      id="pipeline-journey-section" 
      className="py-20 bg-white border-b border-borderLight text-color-accessibility"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
            Operational Blueprint
          </span>
          <h2 
            id="pipeline-journey-title" 
            className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight"
          >
            How your pipeline will look with Nexus Dial
          </h2>
          <p className="text-textSecondary text-base sm:text-lg mt-4 col-textSecondary font-medium">
            A continuous, highly optimized pipeline running around the clock. Hover or click each phase below to view our campaign actions.
          </p>
        </div>

        {/* 4-step interactive pipeline route layout */}
        <div 
          id="pipeline-journey-steps" 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 relative"
        >
          {/* Connecting Track Line in background (Desktop only) */}
          <div className="hidden md:block absolute top-[28px] left-8 right-8 h-[3px] bg-borderLight z-0">
            {/* Animated progress overlay based on activeStep */}
            <motion.div 
              className="h-full bg-gradient-to-r from-sunsetCrimson to-sunsetGold"
              animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            ></motion.div>
          </div>

          {steps.map((step, idx) => {
            const isHovered = activeStep === idx;
            return (
              <motion.div
                key={step.number}
                id={`pipeline-step-node-${step.number}`}
                onMouseEnter={() => setActiveStep(idx)}
                onClick={() => setActiveStep(idx)}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
              >
                {/* Numeric node badge */}
                <div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-sans font-extrabold text-sm border-4 transition-all duration-300 ${
                    isHovered 
                      ? 'bg-gradient-to-br from-sunsetCrimson to-sunsetGold text-white border-white ring-4 ring-sunsetCrimson/10'
                      : 'bg-white text-textMuted border-borderLight group-hover:border-sunsetCrimson/30 group-hover:text-textPrimary'
                  }`}
                >
                  {getStepIcon(step.number)}
                </div>

                {/* Vertical link connector for mobile */}
                {idx < steps.length - 1 && (
                  <div className="md:hidden w-0.5 h-8 bg-borderLight my-1"></div>
                )}

                {/* Title */}
                <h3 className={`text-base font-extrabold mt-4 text-center transition-colors duration-200 ${
                  isHovered ? 'text-sunsetCrimson' : 'text-textPrimary'
                }`}>
                  {step.title}
                </h3>
                
                {/* Active tagline Label */}
                <span className="text-[11px] font-bold text-textMuted font-mono uppercase tracking-widest mt-1">
                  {step.tagline}
                </span>

                {/* Subtle dynamic background highlights card context for current active index */}
                <motion.div 
                  layout
                  className={`mt-4 p-5 rounded-2xl border text-left transition-all duration-300 w-full ${
                    isHovered 
                      ? 'bg-offsetLight border-sunsetCrimson/20 shadow-md translate-y-0.5' 
                      : 'bg-transparent border-transparent opacity-60 group-hover:opacity-100'
                  }`}
                >
                  <p className="text-xs text-textSecondary font-medium leading-relaxed">
                    {step.description}
                  </p>
                  
                  {isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-trustGreen font-mono"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-trustGreen stroke-[2]" />
                      <span>SECURE & TCPA COMPLIANT ACTION</span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Blueprint Stats Bar */}
        <motion.div 
          id="pipeline-benchmark-card"
          whileHover={{ y: -2, shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
          className="mt-12 p-6 rounded-2xl bg-offsetLight border border-borderLight flex flex-col sm:flex-row items-center justify-between gap-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-trustGreen/10 flex items-center justify-center text-trustGreen shrink-0">
              <CheckCircle2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-textPrimary leading-none">
                Nexus Dial Mutual NDA & TCPA Guarantee
              </h4>
              <p className="text-xs text-textSecondary mt-1">
                Our outreach protocols use proprietary lists scrubbed every 24 hours against Federal DNC directories.
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => {
              const el = document.getElementById('services-portals');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-xs font-bold text-sunsetCrimson hover:text-activeCrimson inline-flex items-center gap-1 bg-white border border-borderLight px-4 py-2 rounded-lg scroll-smooth group shrink-0 cursor-pointer"
          >
            <span>Explore Vertical Outbound Campaigns</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}
