import { useState } from 'react';
import { FAQItem, TestimonialItem, BlogPost } from '../types';
import { Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileCode, Shield, Award, CheckCircle } from 'lucide-react';

export default function ReviewFaasBlogs() {
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  const testimonials: TestimonialItem[] = [
    {
      name: 'Julian Henderson',
      role: 'VP of Business Development',
      company: 'Apex Roofing & Restoration',
      content: 'We integrated Nexus Dial\'s weather-mapped campaign directly after the Central Florida hailstorms. Within 45 days, their agents booked 160 roof inspections, resulting in over $1.2M in insurance-approved commercial contracts. The accent alignment and lead pre-qualification have been flawless.',
      rating: 5,
      avatarText: 'JH'
    },
    {
      name: 'Elena Rostova',
      role: 'Director of Growth Operations',
      company: 'NextGen Solar Developers Inc.',
      content: 'Before Nexus Dial, my sales reps were wasting 75% of their days calling unscrubbed lists. Nexus Dial designed a custom zero-down Solar pre-qualification routing checklist. Now we only talk with pre-vetted homeowners with utility bills exceeding $200. Best outbound agency in the industry!',
      rating: 5,
      avatarText: 'ER'
    },
    {
      name: 'Marcus Sterling',
      role: 'Managing Principal Broker',
      company: 'Sterling RE Acquisitions Group',
      content: 'Skip-tracing absentee property owners manually is a nightmare. Nexus Dial deployed a team of three real estate virtual assistants. They handle all cold calling, vet distress ratings and asking prices, and feed them straight into Podio CRM. Unparalleled response speed!',
      rating: 5,
      avatarText: 'MS'
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: 'How do you train Nexus Dial agents on our specific CRM and industry terminologies?',
      answer: 'All Cairo outbound calling candidates go through our exclusive Nexus Dial Training Academy, which includes mandatory module testing on roofing inspections, solar tax credit changes, skip-tracing CRM integrations, and SaaS diagnostic audits. We map your CRM workflows (Salesforce, HubSpot, etc.) in our sandbox during the 14-day deployment phase.',
      category: 'Training & Setup'
    },
    {
      question: 'Are your calling campaigns compliant with Federal TCPA & DNC List scrubbing?',
      answer: 'Yes, 100%. Compliance is our absolute highest priority. We use automatic scrubbing systems that verify all lead databases against local, state, and Federal Do Not Call list directories every 24 hours. We carry a comprehensive Mutual Non-Disclosure Agreement (NDA) and carry tier-1 liability insurance protections.',
      category: 'Compliance'
    },
    {
      question: 'What is the average setup speed prior to campaign launch?',
      answer: 'We typically stand up a dedicated vertical outpatient campaign team within 10 to 14 business days. This timeframe covers phone number provisioning (matching local US caller IDs), custom script validation, CRM sandbox configuration, and agent training calibration.',
      category: 'Onboarding'
    },
    {
      question: 'Do you support full-time agent voice recordings audits?',
      answer: 'Absolutely. Every outbound call is recorded and cataloged under Microsoft PowerBI dashboards. Our COPC-certified Quality Assurance managers audit at least 5 calls per agent per shift to ensure pitch pacing, accent alignment, objection handling, and lead verification compliance.',
      category: 'Quality Control'
    }
  ];

  const blogPosts: BlogPost[] = [
    {
      title: 'The Storm Chaser Playbook: Sourcing $25k Roofing Inspections with Post-Storm Zip Code Dialers',
      excerpt: 'Discover how Nexus Dial uses geographic utility systems to map hail storm coordinate damages straight into automated outbound call scripts within 12 hours of declarations.',
      category: 'Roofing Outreach',
      readTime: '6 min read',
      date: 'June 4, 2026'
    },
    {
      title: 'Solar Pre-Qualification Redirection: Bypassing Net-Metering Hesitancy in Florida and Texas',
      excerpt: 'Vetting homeowners is getting tougher. Read about the new zero-down, utility savings equations our dual-track Cairo agents utilize to secure solar consult meetings.',
      category: 'Solar Systems',
      readTime: '8 min read',
      date: 'May 28, 2026'
    },
    {
      title: 'Absentee Owner Skip-Tracing: Scaling Off-Market Real Estate Deal Pipelines on a Budget',
      excerpt: 'How real-estate acquisitions firms scale their monthly deal pipelines using pre-trained virtual outbound calling models with direct Podio integration.',
      category: 'Real Estate Leads',
      readTime: '5 min read',
      date: 'May 12, 2026'
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeT = testimonials[activeTestimonial];

  return (
    <section className="bg-transparent text-color-accessibility" id="brand-trust-reputation-blocks">
      
      {/* Client Review Panel (Sourced from vCallers) */}
      <div className="py-20 bg-offsetLight/40 border-b border-borderLight" id="reputation-testimonials">
        <div className="max-w-4xl mx-auto px-6 text-center">
          
          <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
            Client Success Records
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
            Loved By Premium Outbound Closers
          </h2>
          <p className="text-textSecondary text-sm sm:text-base mt-2 col-textSecondary font-medium max-w-xl mx-auto">
            See how major roofing companies, solar developers, and investor brokers use Nexus Dial to book qualified accounts.
          </p>

          {/* Testimonial Carousel Panel */}
          <div 
            id="testimonial-carousel-panel"
            className="mt-12 bg-white border border-borderLight p-6 sm:p-10 rounded-3xl shadow-cardSoft relative overflow-hidden text-left"
          >
            {/* Background Quotes graphic indicator */}
            <div className="absolute top-4 right-8 text-8xl font-serif text-borderLight/40 select-none pointer-events-none">
              “
            </div>

            <div className="flex flex-col justify-between h-full min-h-[220px]">
              
              {/* Star ratings */}
              <div className="flex items-center gap-1 mb-5">
                {[...Array(activeT.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-sunsetGold fill-sunsetGold" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-sm sm:text-base text-textPrimary font-semibold leading-relaxed mb-6 italic" id="active-testimonial-quotes">
                "{activeT.content}"
              </p>

              {/* Reviewer Details */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-borderLight/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sunsetCrimson to-sunsetGold text-white flex items-center justify-center font-bold text-sm tracking-wide shrink-0 shadow-md">
                    {activeT.avatarText}
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-extrabold text-textPrimary block">{activeT.name}</span>
                    <span className="text-xs text-textMuted">{activeT.role}, <strong>{activeT.company}</strong></span>
                  </div>
                </div>

                {/* Left/Right Carousel Triggers */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTestimonial}
                    className="w-9 h-9 rounded-full bg-offsetLight border border-borderLight flex items-center justify-center text-textSecondary hover:bg-white hover:text-sunsetCrimson transition-all shadow-sm"
                    aria-label="Previous Testimonial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="w-9 h-9 rounded-full bg-offsetLight border border-borderLight flex items-center justify-center text-textSecondary hover:bg-white hover:text-sunsetCrimson transition-all shadow-sm"
                    aria-label="Next Testimonial"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Compliance Footer Grid (Sourced from Elevate Holding) */}
      <div className="bg-white py-12 border-b border-borderLight" id="quality-compliance-badges-ribbon">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-6">
            Verified Quality certifications & Operational Security alignments
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center max-w-4xl mx-auto">
            {/* Cert 1 */}
            <div className="p-4 rounded-xl bg-offsetLight/60 border border-borderLight/70 flex items-center gap-3 justify-center">
              <Award className="w-5 h-5 text-sunsetCrimson" />
              <div className="text-left">
                <span className="text-xs font-bold text-textPrimary block">COPC standards</span>
                <span className="text-[10px] text-textMuted uppercase block">Quality Verified</span>
              </div>
            </div>
            {/* Cert 2 */}
            <div className="p-4 rounded-xl bg-offsetLight/60 border border-borderLight/70 flex items-center gap-3 justify-center">
              <Shield className="w-5 h-5 text-trustGreen" />
              <div className="text-left">
                <span className="text-xs font-bold text-textPrimary block">PCI DSS compliance</span>
                <span className="text-[10px] text-textMuted uppercase block">Data Secured</span>
              </div>
            </div>
            {/* Cert 3 */}
            <div className="p-4 rounded-xl bg-offsetLight/60 border border-borderLight/70 flex items-center gap-3 justify-center">
              <Award className="w-5 h-5 text-sunsetGold" />
              <div className="text-left">
                <span className="text-xs font-bold text-textPrimary block">ISO 9001 quality</span>
                <span className="text-[10px] text-textMuted uppercase block">Operational Audited</span>
              </div>
            </div>
            {/* Cert 4 */}
            <div className="p-4 rounded-xl bg-offsetLight/60 border border-borderLight/70 flex items-center gap-3 justify-center">
              <Shield className="w-5 h-5 text-[#3B82F6]" />
              <div className="text-left">
                <span className="text-xs font-bold text-textPrimary block">ISO 27001 secure</span>
                <span className="text-[10px] text-textMuted uppercase block">CRM Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible FAQ Accordion (Sourced from vCallers) */}
      <div className="py-20 bg-offsetLight/40 border-b border-borderLight" id="faq">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
              FAQ Solutions Registry
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
              Frequently Asked Hub Queries
            </h2>
            <p className="text-textSecondary text-sm sm:text-base mt-2 col-textSecondary font-medium">
              Find transparent directions regarding pricing budgets, timezone routing compliance grids, and Cairo sourcing metrics.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4 max-w-3xl mx-auto" id="collapsible-faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFAQIndex === index;
              return (
                <div 
                  key={index} 
                  className="bg-white border border-borderLight rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFAQIndex(isOpen ? null : index)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between text-base font-extrabold text-textPrimary bg-transparent hover:bg-offsetLight/40 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-sunsetCrimson shrink-0" /> : <ChevronDown className="w-4 h-4 text-textMuted shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-textSecondary leading-relaxed border-t border-borderLight/30 pt-3 font-semibold animate-fade-in text-left">
                      <p>{faq.answer}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#059669] font-mono">
                        <CheckCircle className="w-3.5 h-3.5 text-[#059669]" />
                        <span>VERIFIED COPC & TCPA ANSWER</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Velocity Blog Feed (Sourced from vCallers) */}
      <div className="py-20 bg-white border-b border-borderLight" id="blog">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div className="text-left">
              <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
                Velocity Industry Blog
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
                Outbound Velocity Knowledge
              </h2>
              <p className="text-textSecondary text-sm sm:text-base mt-2 col-textSecondary font-medium">
                Pristine guides, lead-sourcing campaigns analysis, and tactical updates.
              </p>
            </div>
            
            <button 
              onClick={() => {
                const el = document.getElementById('services-portals');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-sunsetCrimson hover:text-activeCrimson border shadow-sm rounded-lg px-4 py-2 bg-white inline-flex items-center gap-1 self-start sm:self-auto mt-4 sm:mt-0 group"
            >
              <span>Explore Campaign Scenarios</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* 3-Column Blog Feed Grid */}
          <div id="velocity-blogs-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {blogPosts.map((post, i) => (
              <article 
                key={i}
                className="bg-white border border-borderLight rounded-2xl overflow-hidden shadow-cardSoft hover:shadow-cardHover hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between text-left group"
              >
                <div className="p-6">
                  {/* Category and Date info */}
                  <div className="flex items-center gap-3.5 mb-4 text-[10px] text-textMuted font-mono">
                    <span className="font-bold text-sunsetCrimson uppercase bg-sunsetCrimson/5 px-2 py-0.5 rounded border border-sunsetCrimson/10">
                      {post.category}
                    </span>
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>

                  {/* Blog Title */}
                  <h3 className="text-base font-extrabold text-textPrimary leading-tight group-hover:text-sunsetCrimson transition-colors">
                    {post.title}
                  </h3>

                  {/* Blog Excerpt */}
                  <p className="text-xs text-textSecondary mt-3 leading-relaxed font-semibold">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read Full Article trigger */}
                <div className="px-6 pb-6 pt-4 border-t border-borderLight/50 flex items-center justify-between text-xs font-bold text-textPrimary">
                  <span className="group-hover:text-sunsetCrimson transition-colors">Read Article</span>
                  <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                </div>
              </article>
            ))}
          </div>

        </div>
      </div>

    </section>
  );
}
