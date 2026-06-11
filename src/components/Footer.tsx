import { Mail, Phone, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ServiceVertical } from '../types';

interface FooterProps {
  onNavigateToSection: (sectionId: string) => void;
  onSelectService: (serviceId: ServiceVertical['id']) => void;
  onOpenBookingModal: () => void;
}

export default function Footer({
  onNavigateToSection,
  onSelectService,
  onOpenBookingModal,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      id="global-page-footer" 
      className="bg-offsetLight border-t border-borderLight py-16 text-color-accessibility text-left"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* Company Column (col-span-4) */}
        <div className="md:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {/* Typographic Honeycomb Brand Indicator */}
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-sunsetCrimson to-sunsetGold flex items-center justify-center text-white font-bold text-xs select-none shadow">
                ND
              </div>
              <span className="font-sans font-extrabold text-lg text-textPrimary">
                Nexus <span className="text-sunsetCrimson">Dial</span>
              </span>
            </div>
            
            <p className="text-xs text-textSecondary leading-relaxed max-w-sm">
              We fill premium high-ticket outbound campaigns with highly trained, dual-lingual calling specialists operating directly from state-of-the-art facilities in Cairo, Egypt. Inspired by standard BPO models.
            </p>
          </div>

          <div className="mt-6 space-y-2.5 text-xs text-textSecondary">
            <a href="mailto:info@nexusdial.com" className="flex items-center gap-2 hover:text-sunsetCrimson transition-colors font-semibold">
              <Mail className="w-4 h-4 text-textMuted" />
              <span>info@nexusdial.com</span>
            </a>
            <a href="tel:+18017626680" className="flex items-center gap-2 hover:text-sunsetCrimson transition-colors font-semibold">
              <Phone className="w-4 h-4 text-textMuted" />
              <span>+1 (801) 762-6680</span>
            </a>
            <div className="flex items-center gap-2 font-semibold">
              <MapPin className="w-4 h-4 text-textMuted" />
              <span>Cairo Operations HQ • Cairo, Egypt</span>
            </div>
          </div>
        </div>

        {/* Specialized Solutions Specializations Column (col-span-3) */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-extrabold text-textPrimary uppercase tracking-widest mb-4">
            Campaign Portals
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-textSecondary">
            {[
              { id: 'solar', label: 'Solar Outreach Portal' },
              { id: 'roofing', label: 'Roofing Leads Portal' },
              { id: 'realestate', label: 'Real Estate Acquisitions' },
              { id: 'webdev', label: 'Web Dev & Audit Teams' }
            ].map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => {
                    onSelectService(link.id as any);
                    onNavigateToSection('services-portals');
                  }}
                  className="hover:text-sunsetCrimson transition-colors text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources & Sourcing/QA Tech Column (col-span-2) */}
        <div className="md:col-span-2">
          <h4 className="text-xs font-extrabold text-textPrimary uppercase tracking-widest mb-4">
            Quality Hub
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-textSecondary">
            <li>
              <button onClick={() => onNavigateToSection('quality-hub')} className="hover:text-sunsetCrimson transition-colors text-left">
                Talent Sourcing
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToSection('quality-hub')} className="hover:text-sunsetCrimson transition-colors text-left">
                Integrated CRM Stack
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToSection('faq')} className="hover:text-sunsetCrimson transition-colors text-left">
                Compliance & NDA
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateToSection('blog')} className="hover:text-sunsetCrimson transition-colors text-left">
                Velocity B2B Blog
              </button>
            </li>
          </ul>
        </div>

        {/* Call-to-action Column (col-span-3) */}
        <div className="md:col-span-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-textPrimary uppercase tracking-widest mb-4">
              Outbound Discovery
            </h4>
            <p className="text-xs text-textSecondary leading-normal mb-4">
              Schedule a free 15-minute diagnostic modeling strategy session with an outbound specialist coordinator.
            </p>
          </div>
          
          <button
            onClick={onOpenBookingModal}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-sunsetCrimson to-sunsetGold text-white font-bold text-xs tracking-wider uppercase shadow hover:scale-[1.02] transform transition-all duration-300"
          >
            Confirm Free Consultation
          </button>
        </div>

      </div>

      {/* Global Bottom Ribbon for Trust */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-borderLight/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-textMuted">
        <div className="space-y-1">
          <p>© {currentYear} Nexus Dial Ltd. All Rights Reserved. Compliant Cairo Gateways.</p>
          <p className="font-medium text-textSecondary leading-normal max-w-lg">
            Guarantees calibrated with operational frameworks from Elevate Holding and Teleperformance compliance models. Full skip-tracing capabilities compliant with TCPA rules.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-trustGreen">
            <ShieldCheck className="w-4 h-4 text-trustGreen stroke-[2.5]" />
            <span>TCPA Safe Guard</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-trustGreen">
            <CheckCircle2 className="w-4 h-4 text-trustGreen" />
            <span>DNC Scrubbed</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
