import { motion } from 'motion/react';
import { CheckCircle2, ShieldCheck, Clock, MessageSquare, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenBookingModal: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export default function HeroSection({ onOpenBookingModal, onNavigateToSection }: HeroSectionProps) {
  // Container animation configuration for staggered items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.21, 1.02, 0.43, 1.01] } 
    }
  };

  return (
    <section 
      id="hero-header-section" 
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-slate-900 bg-slate-950"
    >
      {/* Background Video Element covering the entire container */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80 select-none animate-[fade-in_1s_ease-out]"
      >
        <source src="https://www.pexels.com/download/video/5452542/" type="video/mp4" />
        <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-working-at-a-call-center-41584-large.mp4" type="video/mp4" />
      </video>

      {/* Premium Balanced Dark Overlay for high visibility and WCAG readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/35 to-slate-950/85 z-10 pointer-events-none"></div>

      {/* Floating Ambient Glowing Blobs to add elegance and blend the video edges */}
      <motion.div 
        className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-sunsetCrimson/15 to-transparent rounded-full blur-3xl pointer-events-none z-10"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-20 max-w-4xl mx-auto px-6 sm:px-8 py-20 lg:py-28 text-center">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Compliance Badge Pill with slow pulse */}
          <motion.div 
            id="compliance-badge"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-8 cursor-pointer shadow-[0_2px_15px_rgba(16,185,129,0.1)]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>✓ Enterprise-Grade Outbound Sales Pipelines</span>
          </motion.div>

          {/* Main Headline (H1) */}
          <motion.h1 
            id="hero-main-title" 
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.12] tracking-tight font-sans max-w-3xl"
          >
            We Fill your <span className="bg-gradient-to-r from-sunsetCrimson to-sunsetGold bg-clip-text text-transparent">Pipeline</span> with Sales-Qualified Leads.
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p 
            id="hero-subphrase" 
            variants={itemVariants}
            className="text-slate-300 text-base sm:text-lg lg:text-xl mt-6 leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Stop wasting sales cycles on unqualified contacts. Leverage highly trained, bilingual outbound calling teams using native CRM workflows to book ready-to-buy appointments.
          </motion.p>

          {/* Double CTA Row */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full sm:w-auto" 
            id="hero-cta-group"
          >
            <motion.button
              id="hero-primary-cta"
              onClick={onOpenBookingModal}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 20px -3px rgba(249, 115, 22, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-sans font-bold text-base tracking-wide shadow-lg transition-all duration-300 cursor-pointer text-center"
            >
              Book Your Free Consultation
            </motion.button>
            
            <motion.button
              id="hero-secondary-cta"
              onClick={() => onNavigateToSection('pain-points-section')}
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white hover:border-white/40 font-sans font-semibold text-base transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <span>How It Works</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </motion.button>
          </motion.div>

          {/* Sourced from vCallers Horizontal Trust Badges */}
          <motion.div 
            id="horizontal-trust-badges-grid" 
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10 w-full"
          >
            {[
              { icon: <Clock className="w-4 h-4" />, text: "🇺🇸 US Timezone Alignment" },
              { icon: <ShieldCheck className="w-4 h-4" />, text: "✅ Full TCPA & DNC Scrubbing" },
              { icon: <MessageSquare className="w-4 h-4" />, text: "🎙️ Native/Bilingual Fluency" },
              { icon: <CheckCircle2 className="w-4 h-4" />, text: "🔒 Mutual NDA Data Protection" }
            ].map((badge, idx) => {
              const getIconColors = (idx: number) => {
                if (idx === 0) return { text: "text-sunsetCrimson", bg: "bg-sunsetCrimson/10", border: "border-sunsetCrimson/25" };
                if (idx === 1) return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" };
                if (idx === 2) return { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25" };
                return { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" };
              };
              const styleSet = getIconColors(idx);
              return (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="flex items-center gap-2.5 cursor-default p-2.5 rounded-xl bg-slate-900/40 border border-white/10 hover:bg-slate-900/60 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styleSet.text} ${styleSet.bg} shrink-0 border ${styleSet.border}`}>
                    {badge.icon}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-white leading-tight text-left">
                    {badge.text}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
