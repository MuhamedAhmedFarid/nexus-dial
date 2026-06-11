import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Star, Sparkles, TrendingUp, Info } from 'lucide-react';

interface RoiCalculatorProps {
  onOpenBookingModal: () => void;
}

export default function RoiCalculator({ onOpenBookingModal }: RoiCalculatorProps) {
  // 6.1 States for targeted spend (x) and average contract value (y)
  const [monthlySpend, setMonthlySpend] = useState<number>(3000); // Default: $3,000
  const [contractValue, setContractValue] = useState<number>(10000); // Default: $10,000

  // Animation controls for reactive values
  const monthlyControls = useAnimation();
  const annualControls = useAnimation();
  const roiControls = useAnimation();

  // Trigger brief scale up when values change
  useEffect(() => {
    monthlyControls.start({ scale: [1, 1.04, 1], transition: { duration: 0.2 } });
    annualControls.start({ scale: [1, 1.04, 1], transition: { duration: 0.2 } });
    roiControls.start({ scale: [1, 1.06, 1], transition: { duration: 0.25 } });
  }, [monthlySpend, contractValue]);

  // 6.1 Baseline constants
  const baselineMeetings = 15; // (m)
  const baselineDeals = 3;     // (d)

  // 6.1 Mathematical formula implementations
  const projectedMonthlyRevenue = baselineDeals * contractValue;
  const projectedAnnualRevenue = projectedMonthlyRevenue * 12;
  
  // Prevent division by zero just in case
  const estimatedRoiPercentage = monthlySpend > 0 
    ? (projectedAnnualRevenue / (monthlySpend * 12)) * 100 
    : 0;

  // Formatting utilities
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getRoiColorClass = (roi: number) => {
    if (roi >= 400) return 'text-trustGreen';
    if (roi >= 200) return 'text-sunsetCrimson';
    return 'text-textPrimary';
  };

  return (
    <section 
      id="roi-calculator-section" 
      className="py-20 bg-white border-b border-borderLight text-color-accessibility"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3 animate-[pulse_5s_infinite]">
            B2B Economic Modeler
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
            Perform Nexus Dial Outbound ROI Calculations
          </h2>
          <p className="text-textSecondary text-base sm:text-lg mt-4 col-textSecondary font-medium">
            Adjust the sliders below to see your potential contract wins, projected annual revenues, and return on investment percentages with our compliant Cairo calling programs.
          </p>
        </div>

        {/* Calculator Widget Wrapper */}
        <motion.div 
          id="roi-calculator-widget" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-offsetLight border border-borderLight rounded-3xl p-6 sm:p-10 shadow-cardSoft max-w-5xl mx-auto text-left relative overflow-hidden"
        >
          {/* Top subtle visual indicator */}
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-sunsetCrimson via-sunsetGold to-trustGreen"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Box: Controls & Sliders (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-borderLight p-6 sm:p-8 rounded-2xl">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-sunsetGold fill-sunsetGold" />
                  <span className="text-xs font-extrabold text-textPrimary uppercase tracking-wider font-sans">
                    Custom Investment Input States
                  </span>
                </div>

                {/* Slider 1: Target Monthly Spend ($x) */}
                <div className="mb-8" id="slider-monthly-spend-group">
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="spend-range" className="text-xs sm:text-sm font-bold text-textPrimary flex items-center gap-1.5 font-sans">
                      <span>Target Monthly BPO Spend ($x):</span>
                      <Info className="w-4 h-4 text-textMuted cursor-help" title="Your total monthly budget covering dedicated agents, dialers and list scrubbing." />
                    </label>
                    <span className="text-lg font-extrabold text-sunsetCrimson font-mono">
                      {formatCurrency(monthlySpend)}
                    </span>
                  </div>
                  <input
                    id="spend-range"
                    type="range"
                    min="1500"
                    max="25000"
                    step="500"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full h-2 bg-borderLight rounded-lg appearance-none cursor-pointer accent-sunsetCrimson focus:outline-none focus:ring-2 focus:ring-sunsetCrimson/10"
                    style={{
                      background: `linear-gradient(to right, #F97316 0%, #F59E0B ${(monthlySpend - 1500) / (25000 - 1500) * 100}%, #E2E8F0 ${(monthlySpend - 1500) / (25000 - 1500) * 100}%, #E2E8F0 100%)`
                    }}
                    aria-label="Target Monthly BPO Spend Slider"
                  />
                  <div className="flex justify-between text-[10px] text-textMuted font-mono mt-1">
                    <span>$1,500</span>
                    <span>$5k</span>
                    <span>$10k</span>
                    <span>$15k</span>
                    <span>$20k</span>
                    <span>$25k</span>
                  </div>
                </div>

                {/* Slider 2: Average Contract Value ($y) */}
                <div className="mb-6" id="slider-contract-value-group">
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="contract-range" className="text-xs sm:text-sm font-bold text-textPrimary flex items-center gap-1.5 font-sans">
                      <span>Average High-Ticket Contract Value ($y):</span>
                      <Info className="w-4 h-4 text-textMuted cursor-help" title="The gross margin or lifetime value of a single closed customer contract." />
                    </label>
                    <span className="text-lg font-extrabold text-[#059669] font-mono">
                      {formatCurrency(contractValue)}
                    </span>
                  </div>
                  <input
                    id="contract-range"
                    type="range"
                    min="2500"
                    max="100000"
                    step="2500"
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full h-2 bg-borderLight rounded-lg appearance-none cursor-pointer accent-trustGreen focus:outline-none focus:ring-2 focus:ring-trustGreen/10"
                    style={{
                      background: `linear-gradient(to right, #059669 0%, #10B981 ${(contractValue - 2500) / (100000 - 2500) * 100}%, #E2E8F0 ${(contractValue - 2500) / (100000 - 2500) * 100}%, #E2E8F0 100%)`
                    }}
                    aria-label="Average High-Ticket Contract Value Slider"
                  />
                  <div className="flex justify-between text-[10px] text-textMuted font-mono mt-1">
                    <span>$2,500</span>
                    <span>$25k</span>
                    <span>$50k</span>
                    <span>$75k</span>
                    <span>$100k</span>
                  </div>
                </div>

              </div>

              {/* Baseline Metrics Footnotes */}
              <div className="mt-6 pt-5 border-t border-borderLight/60 text-xs text-textMuted bg-offsetLight/40 p-4 rounded-xl">
                <span className="font-bold text-textSecondary uppercase tracking-wide text-[10px] block mb-1">
                  Baseline Calculation Constants:
                </span>
                <div className="grid grid-cols-2 gap-3" id="roi-baseline-constants">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-sunsetCrimson rounded-full animate-ping"></span>
                    <span>Qualified Meetings (m): <strong>15/mo</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-ping"></span>
                    <span>Closed Deals (d): <strong>3/mo</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Yield & Outcomes Dashboard (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white border border-borderLight rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-cardSoft">
              <div className="flex flex-col gap-6">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-borderLight/60">
                  <span className="text-xs font-bold text-textMuted uppercase tracking-wider block">
                    Calculated Outreach Yield
                  </span>
                  <div className="px-2 py-0.5 rounded bg-trustGreen/10 text-trustGreen text-[10px] font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-trustGreen animate-pulse" /> Live Estimate
                  </div>
                </div>

                {/* Value 1: Monthly revenue */}
                <div id="projected-monthly-yield">
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest block font-sans">
                    Projected Monthly Revenue:
                  </span>
                  <motion.div 
                    animate={monthlyControls}
                    className="text-3xl font-extrabold text-textPrimary mt-1 font-sans"
                  >
                    {formatCurrency(projectedMonthlyRevenue)}
                  </motion.div>
                  <span className="text-[10px] text-textSecondary font-semibold">
                    Based on 15 cold discovery hand-offs.
                  </span>
                </div>

                {/* Value 2: Annual revenue */}
                <div id="projected-annual-yield">
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest block font-sans">
                    Projected Annual Revenue:
                  </span>
                  <motion.div 
                    animate={annualControls}
                    className="text-3xl font-extrabold text-textPrimary mt-1 font-sans bg-gradient-to-r from-sunsetCrimson to-sunsetGold bg-clip-text text-transparent"
                  >
                    {formatCurrency(projectedAnnualRevenue)}
                  </motion.div>
                  <span className="text-[10px] text-textSecondary font-semibold">
                    12-month scaling trajectory.
                  </span>
                </div>

                {/* Value 3: Estimated ROI Percentage */}
                <div className="p-4 rounded-xl bg-offsetLight border border-borderLight/80">
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest block font-sans">
                    Calculated Potential ROI:
                  </span>
                  <motion.div 
                    animate={roiControls}
                    className={`text-3xl font-extrabold mt-1 font-mono ${getRoiColorClass(estimatedRoiPercentage)}`}
                  >
                    {estimatedRoiPercentage.toFixed(0)}%
                  </motion.div>
                  <span className="text-[10px] text-textSecondary font-semibold block mt-0.5">
                    ({(estimatedRoiPercentage / 100).toFixed(1)}x multiple on spend)
                  </span>
                </div>

              </div>

              <div className="mt-8 pt-4 border-t border-borderLight/60">
                <motion.button
                  whileHover={{ scale: 1.02, shadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenBookingModal}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-sans font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Reserve This Campaign Yield</span>
                </motion.button>
              </div>

            </div>

          </div>

          {/* Sourced from BPO Hive - Quality standards certifications */}
          <div className="mt-8 pt-6 border-t border-borderLight bg-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <span className="text-xs font-bold text-textSecondary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-trustGreen animate-pulse"></span>
              Outbound model calculated daily with audited CRM performance matrices.
            </span>
            <div className="text-[11px] font-mono text-textMuted uppercase tracking-widest">
              Nexus Dial Model • Verified ISO 9001
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
