import { PartnerLogo } from '../types';

export default function PartnerSlider() {
  const partners: PartnerLogo[] = [
    {
      name: 'SOLAR FLOW',
      industry: 'Solar',
      svgPath: 'M20,10 L35,25 L25,25 L35,40 L15,40 L25,25 L15,25 Z'
    },
    {
      name: 'APEX ROOFING',
      industry: 'Roofing',
      svgPath: 'M10,40 L25,15 L40,40 Z'
    },
    {
      name: 'ELEVATE HOMES',
      industry: 'Real Estate',
      svgPath: 'M10,40 L10,20 L25,10 L40,20 L40,40 Z'
    },
    {
      name: 'NEXUS WEB CORP',
      industry: 'Web Dev',
      svgPath: 'M15,15 L35,15 L35,35 L15,35 Z M10,10 L40,10 L40,40 L10,40 Z'
    },
    {
      name: 'vCAL REALTY',
      industry: 'Real Estate',
      svgPath: 'M10,20 L25,5 L40,20 L30,20 L30,40 L20,40 L20,20 Z'
    },
    {
      name: 'SUMMIT RENEWABLES',
      industry: 'Solar',
      svgPath: 'M25,5 L10,35 L40,35 Z'
    }
  ];

  // Triplicate the partner logos to ensure continuous marquee effect even on ultra-wide screens
  const marqueeItems = [...partners, ...partners, ...partners];

  return (
    <section 
      id="trusted-partner-slider" 
      className="py-12 bg-white border-b border-borderLight/30 overflow-hidden text-color-accessibility"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Section Header (H3) with accessibility class mappings */}
        <h3 
          className="text-xs uppercase tracking-widest font-extrabold text-textMuted text-color-accessibility mb-6" 
          id="partner-slider-header"
        >
          Used by over 10,000 brands all over the world
        </h3>
      </div>

      {/* Infinite Scrolling Marquee Wrapper */}
      <div className="relative w-full overflow-hidden bg-offsetLight/40 py-6 border-y border-borderLight" id="infinite-scroller-container">
        
        {/* We use two flex rows side by side for a seamless translation loops */}
        <div className="flex w-max animate-[marquee_30s_linear_infinite]" id="marquee-scrolling-ribbon">
          
          {marqueeItems.map((partner, index) => (
            <div 
              key={`${partner.name}-${index}`} 
              className="flex items-center gap-3.5 mx-8 sm:mx-12 select-none group shrink-0"
              title={`${partner.name} - ${partner.industry}`}
            >
              {/* Abstract Logo Symbol */}
              <div className="w-10 h-10 rounded bg-borderLight/60 group-hover:bg-sunsetCrimson/10 flex items-center justify-center p-2 transition-all duration-300">
                <svg 
                  className="w-full h-full text-textMuted group-hover:text-sunsetCrimson/80 transition-colors" 
                  viewBox="0 0 50 50" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={partner.svgPath} />
                </svg>
              </div>

              {/* Logo Typography text-color-accessibility */}
              <div className="flex flex-col text-left">
                <span className="font-sans font-extrabold text-sm text-textSecondary uppercase tracking-wide group-hover:text-textPrimary transition-colors">
                  {partner.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-textMuted group-hover:text-sunsetCrimson transition-colors">
                  {partner.industry}
                </span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
