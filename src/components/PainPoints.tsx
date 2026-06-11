import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PainPointCard } from '../types';
import { TrendingDown, Clock, Link2Off, Cpu, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function PainPoints() {
  // Let's implement active card detail expansion or interactive toggles to make it engaging!
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const painPoints: PainPointCard[] = [
    {
      id: 1,
      title: 'Flat Revenue Growth',
      description: 'Top-line numbers falling short of B2B targets.',
      impact: 'Reps waste cold hours pacing empty pipelines while competitors close premium accounts.',
      solution: 'Deploy 5 dedicated dual-lingual agents hitting 1,200 CRM contacts daily, boosting meetings by 140%.',
    },
    {
      id: 2,
      title: 'Lengthy Sales Cycles',
      description: 'Unready prospects stretching deal timelines to 6-12 months.',
      impact: 'Dormant opportunities clog your sales pipeline, increasing cash burn without feedback.',
      solution: 'Pre-vetted interest qualification filters ensuring your account executives only talk with budget-holding decision-makers.',
    },
    {
      id: 3,
      title: 'Sales & Marketing Misalignment',
      description: 'Marketing handing off leads that sales cannot close.',
      impact: 'Valuable field reps lose drive working low-conversion leads or raw unscrubbed contacts.',
      solution: 'Direct API pipeline integration. Feedback loops that instantly refresh outbound filter parameters.',
    },
    {
      id: 4,
      title: 'Operational Bottlenecks',
      description: 'Repetitive tasks consuming sales execution bandwidth.',
      impact: 'Executive closers wasting up to 60% of their day dialing, leaving voice notes, or scrubbing spreadsheets.',
      solution: 'Full automated dialer routing. Hands-off calendar booking and automatic contact logging on Salesforce.',
    },
    {
      id: 5,
      title: 'Unreliable Lead Quality',
      description: 'Spending budget on lead lists without booked meetings.',
      impact: 'Purchasing outdated databases riddled with expired domains, disconnected landlines, and active DNC numbers.',
      solution: 'Real-time multi-stage cleaning. Cross-referencing against federal lists and active business registrations.',
    }
  ];

  const getIcon = (id: number) => {
    switch (id) {
      case 1: return <TrendingDown className="w-6 h-6 text-sunsetCrimson" />;
      case 2: return <Clock className="w-6 h-6 text-sunsetCrimson" />;
      case 3: return <Link2Off className="w-6 h-6 text-sunsetCrimson" />;
      case 4: return <Cpu className="w-6 h-6 text-sunsetCrimson" />;
      case 5: return <Trash2 className="w-6 h-6 text-sunsetCrimson" />;
      default: return <TrendingDown className="w-6 h-6 text-sunsetCrimson" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 150, damping: 15 }
    }
  };

  return (
    <section 
      id="pain-points-section" 
      className="py-20 bg-offsetLight/70 border-b border-borderLight text-color-accessibility"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
            Outbound Efficiency Gap
          </span>
          <h2 
            id="pain-points-title" 
            className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight"
          >
            What's holding your sales back?
          </h2>
          <p className="text-textSecondary text-base sm:text-lg mt-4">
            Most businesses fail to hit hyper-growth targets not due to bad products, but due to these outbound operational inefficiencies. Click a card to read the Nexus Dial Resolution.
          </p>
        </div>

        {/* Interactive 5-Card Grid: structured precisely */}
        <motion.div 
          id="pain-points-grid" 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch"
        >
          {painPoints.map((point) => {
            const isSelected = selectedCard === point.id;
            return (
              <motion.div
                key={point.id}
                id={`pain-point-card-${point.id}`}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelectedCard(isSelected ? null : point.id)}
                className={`group cursor-pointer bg-white border rounded-2xl p-6 shadow-cardSoft transition-shadow duration-300 ease-out flex flex-col justify-between text-left select-none relative overflow-hidden ${
                  isSelected 
                    ? 'border-sunsetCrimson ring-2 ring-sunsetCrimson/10 shadow-cardHover' 
                    : 'border-borderLight hover:border-sunsetCrimson/40 hover:shadow-cardHover'
                }`}
              >
                {/* Visual Glow Indicator */}
                <div className={`absolute top-0 left-0 w-full h-[3px] transition-colors duration-300 ${
                  isSelected ? 'bg-gradient-to-r from-sunsetCrimson to-sunsetGold' : 'bg-transparent group-hover:bg-sunsetCrimson/30'
                }`}></div>

                <div>
                  {/* Icon + Title Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-offsetLight flex items-center justify-center border border-borderLight group-hover:bg-sunsetCrimson/5 transition-colors">
                      {getIcon(point.id)}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] bg-trustGreen/10 text-trustGreen px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 animate-pulse" /> SOLVED
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-textPrimary leading-tight group-hover:text-sunsetCrimson transition-colors">
                    {point.title}
                  </h3>
                  
                  <p className="text-xs text-textSecondary font-medium mt-2 leading-relaxed">
                    {point.description}
                  </p>

                  {/* Immediate friction impact */}
                  <div className="mt-4 pt-4 border-t border-borderLight/60">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block mb-1">
                      Business Obstacle:
                    </span>
                    <p className="text-[11px] text-textSecondary italic leading-normal">
                      "{point.impact}"
                    </p>
                  </div>
                </div>

                {/* Resolving action trigger */}
                <div className="mt-6 pt-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sunsetCrimson group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    {isSelected ? 'Collapse Action' : 'View Nexus Antidote'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Nexus Resolution Overlay Box */}
        <AnimatePresence>
          {selectedCard !== null && (
            <motion.div 
              id="nexus-dial-resolved-panel"
              initial={{ opacity: 0, height: 0, y: 15 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -15 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white to-offsetLight border-2 border-sunsetCrimson/30 shadow-lg text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-sunsetCrimson/5 to-transparent rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-sunsetCrimson/10 text-sunsetCrimson flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-sunsetCrimson" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest font-extrabold text-sunsetCrimson uppercase block">
                    Nexus Dial Exclusive Deployment Resolution
                  </span>
                  <h4 className="text-lg font-extrabold text-textPrimary mt-1">
                    How We Resolve: {painPoints.find(p => p.id === selectedCard)?.title}
                  </h4>
                  <p className="text-sm text-textSecondary mt-2 leading-relaxed">
                    {painPoints.find(p => p.id === selectedCard)?.solution}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-semibold text-trustGreen flex items-center gap-1 bg-[#059669]/5 px-2.5 py-1 rounded-full border border-[#059669]/10">
                      ✓ Mitigated by default in 30-day initial ramp-up.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
