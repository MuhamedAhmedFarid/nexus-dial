import { useState } from 'react';
import { motion } from 'motion/react';
import { TimelineMilestone } from '../types';
import { Globe2, Sparkles, Building, Briefcase, Award, ArrowUpRight } from 'lucide-react';

export default function TimelineScale() {
  const [activeYear, setActiveYear] = useState<string>('2025');

  const milestones: TimelineMilestone[] = [
    {
      year: '2019',
      operatives: '5 OPERATIVES',
      milestone: 'Bootstrapped pilot room assisting independent Florida real estate wholesalers. Built robust skip-tracing algorithms.',
    },
    {
      year: '2021',
      operatives: '183 OPERATIVES',
      milestone: 'Inception of dedicated Cairo operational facility. Added specialized Roofing and Solar campaign divisions.',
    },
    {
      year: '2023',
      operatives: '850 OPERATIVES',
      milestone: 'Partnered with major solar developers across 28 US States. Launched multi-channel CRM Dialers and PowerBI sync.',
    },
    {
      year: '2025',
      operatives: '1220 OPERATIVES',
      milestone: 'Expansion to 2 fully owned Cairo campuses. Certified with COPC standards, fully supporting tier-1 enterprise CRM flows.',
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 120, damping: 14 } 
    }
  };

  return (
    <section 
      id="timeline-scale-section" 
      className="py-20 bg-offsetLight/40 border-b border-borderLight text-color-accessibility"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
            Infrastructure & Growth Scale
          </span>
          <h2 
            id="timeline-scale-title" 
            className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight"
          >
            Cairo Infrastructure Powering Global Output
          </h2>
          <p className="text-textSecondary text-base sm:text-lg mt-4 col-textSecondary font-medium">
            Discover how our central Cairo operations scale resources, recruit elite dual-lingual graduates, and manage rigorous quality controls to lower client cost-per-lead.
          </p>
        </div>

        {/* Horizontal Split Screen (flex-col lg:flex-row) */}
        <motion.div 
          id="timeline-split-grid" 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          
          {/* Left Box (TP Egypt scale model) */}
          <motion.div 
            id="regional-metric-card" 
            variants={itemVariants}
            className="lg:col-span-6 bg-white border border-borderLight rounded-2xl p-6 sm:p-8 shadow-cardSoft text-left flex flex-col justify-between relative overflow-hidden"
          >
            {/* Ambient vector glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-trustGreen/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe2 className="w-5 h-5 text-trustGreen animate-spin-slow" />
                <span className="text-[11px] font-mono tracking-widest font-extrabold text-trustGreen uppercase">
                  Global Operational Footprint
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-textPrimary leading-tight font-sans">
                Cairo Operational Hub
              </h3>
              
              <p className="text-sm text-textSecondary mt-3 leading-relaxed">
                Cairo stands as the world's premier premium multilingual outbound calling gateway. Excellent accent alignment, 24/7 client feedback sync, and a highly competitive local talent market enable unmatched campaign efficiency.
              </p>

              {/* Key Premises Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.div 
                  whileHover={{ scale: 1.02, backgroundColor: "#FFFBF7" }}
                  className="p-4 rounded-xl bg-offsetLight border border-borderLight/60 cursor-default transition-colors"
                >
                  <div className="flex items-center gap-2 text-textMuted mb-1">
                    <Building className="w-4 h-4 text-sunsetCrimson" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Premises Capacity</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-textPrimary">1,600+</div>
                  <span className="text-[11px] text-textSecondary font-medium">State-of-the-art workstations</span>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02, backgroundColor: "#FFFBF7" }}
                  className="p-4 rounded-xl bg-offsetLight border border-borderLight/60 cursor-default transition-colors"
                >
                  <div className="flex items-center gap-2 text-textMuted mb-1">
                    <Briefcase className="w-4 h-4 text-sunsetCrimson" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Current Workforce</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-textPrimary">14,000+</div>
                  <span className="text-[11px] text-textSecondary font-medium font-sans">Bilingual outbound agents</span>
                </motion.div>
              </div>

              {/* Recruiting Pool Details */}
              <motion.div 
                whileHover={{ x: 4 }}
                className="mt-6 p-4 rounded-xl bg-[#059669]/5 border border-trustGreen/20 flex gap-3 items-start cursor-default"
              >
                <Award className="w-5 h-5 text-trustGreen shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <span className="text-xs font-bold text-textPrimary block">Elite Dual-Lingual Academy</span>
                  <p className="text-xs text-textSecondary mt-1 leading-normal">
                    We recruit exclusively from top-tier faculties (Al-Alsun, AUC, and GUC), selecting fluent graduates with perfect regional accent-alignment.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 pt-4 border-t border-borderLight/60 flex items-center justify-between text-xs text-textMuted">
              <span>Cairo Hub Operates 24/7/365</span>
              <a 
                href="#services-portals"
                className="font-bold text-sunsetCrimson hover:text-activeCrimson inline-flex items-center gap-0.5"
              >
                <span>View Campaign Deliverables</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </motion.div>

          {/* Right Box (Elevate Holding timeline model) */}
          <motion.div 
            id="timeline-milestones-card"
            variants={itemVariants}
            className="lg:col-span-6 bg-white border border-borderLight rounded-2xl p-6 sm:p-8 shadow-cardSoft text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-sunsetGold animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest font-extrabold text-sunsetCrimson uppercase">
                  Continuous Scale Milestone Records
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-textPrimary leading-tight mb-4">
                Milestones & Operative Growth
              </h3>

              {/* Vertical Timeline Track */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-borderLight">
                {milestones.map((milestone) => {
                  const isActive = activeYear === milestone.year;
                  return (
                    <motion.div 
                      key={milestone.year}
                      onClick={() => setActiveYear(milestone.year)}
                      whileHover={{ x: 3 }}
                      className={`relative cursor-pointer transition-all duration-200 group ${
                        isActive ? 'scale-[1.01]' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Tracking Point Node */}
                      <span className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 transition-transform duration-300 ${
                        isActive 
                          ? 'bg-sunsetCrimson border-white scale-125 ring-4 ring-sunsetCrimson/10' 
                          : 'bg-white border-textMuted group-hover:border-sunsetCrimson'
                      }`}></span>

                      <div className="flex items-baseline gap-3">
                        <span className="text-sm font-extrabold font-mono text-textPrimary group-hover:text-sunsetCrimson transition-colors">
                          {milestone.year}
                        </span>
                        <span className="text-[10px] font-bold text-sunsetCrimson bg-sunsetCrimson/5 px-2 py-0.5 rounded-full">
                          {milestone.operatives}
                        </span>
                      </div>

                      <p className={`text-xs mt-1.5 leading-relaxed font-semibold transition-colors duration-200 ${
                        isActive ? 'text-textPrimary' : 'text-textSecondary'
                      }`}>
                        {milestone.milestone}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-borderLight/60 text-xs text-textMuted flex items-center justify-between">
              <span>Active Target: 2,000 Agents by Q4 2026</span>
              <span className="font-mono text-[11px] font-semibold text-textSecondary bg-offsetLight px-2 py-0.5 rounded">
                Elevate Certified
              </span>
            </div>

          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
