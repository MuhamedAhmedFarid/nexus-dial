import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, 
  Play, 
  Pause, 
  RefreshCw, 
  GraduationCap, 
  ShieldCheck, 
  HeartHandshake, 
  Cpu, 
  Database, 
  PhoneCall, 
  BarChart4, 
  Clock, 
  Smartphone,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AudioClip {
  id: number;
  scenario: string;
  objection: string;
  responsePreview: string;
  duration: string;
  agent: string;
  language: string;
  transcription: string;
}

export default function SourcingTechHub() {
  const [playingClip, setPlayingClip] = useState<number | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const audioClips: AudioClip[] = [
    {
      id: 1,
      scenario: 'Solar Vetting Objection: "Not Interested Redirection"',
      objection: '"We already have enough solar panels or we do not believe in the tax credit savings."',
      responsePreview: '"I completely understand, and most of your neighbors in Orlando felt the same way until Orlando Utilities introduced the 2026 direct rebate structure... "',
      duration: '0:22',
      agent: 'Amelia (Accent: US General Native)',
      language: 'English (US Native Accent Line)',
      transcription: '"I completely understand, and most of your neighbors in Orlando felt the exact same way until Orlando Utilities introduced the 2026 direct rebate structure. What my team does is simple: we verify if your physical roof orientation qualifies to wipe out up to 90% of your bill before the credits expire. It takes less than three minutes to check — are you currently at home?"'
    },
    {
      id: 2,
      scenario: 'Roofing Commercial: "We Have a Local Contractor"',
      objection: '"We already have a local builder we use for all our warehouse leaks."',
      responsePreview: '"That makes total sense. Having a local team on call is vital. Our program is actually a secondary audit backup... "',
      duration: '0:28',
      agent: 'Marc (Accent: US Southern Flavour)',
      language: 'English (Southern Accent Line)',
      transcription: '"That makes total sense, sir. Having a local team on call is vital for operations. Our program is actually a secondary audit backup completely managed by commercial insurance adjusters. If your local contractor misses any micro-fissuring from last week\'s storm, our drone thermal scan flags it gratis, so you can file before the claim window closes on July 1st. Would Monday at 10 AM fit your operations director?"'
    },
    {
      id: 3,
      scenario: 'Real Estate Investor: "Not Selling/Underpriced"',
      objection: '"Why would I sell to you? Home buyers just offer wholesale pennies."',
      responsePreview: '"You are totally right, a lot of wholesale firms blast lowball forms. We actually look to match exact property values... "',
      duration: '0:24',
      agent: 'Sarah (Accent: Mid-Atlantic Standard)',
      language: 'English (Neutral Mid-Atlantic Line)',
      transcription: '"You are totally right, ma\'am. A lot of wholesale firms blast lowball forms on properties. We actually look to match exact property values for active 1031-exchange investors who need to deploy capital immediately. That means we buy in as-is condition but pay premium market multipliers for non-renovated duplexes. If we can get you a price you are happy with, would you consider a cash offer with zero broker fees?"'
    }
  ];

  // Simulated audio playback progress loop
  useEffect(() => {
    if (playingClip !== null) {
      setPlaybackProgress(0);
      timerRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timerRef.current!);
            setPlayingClip(null);
            return 0;
          }
          return prev + 4; // increment progress
        });
      }, 150);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setPlaybackProgress(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playingClip]);

  const togglePlay = (id: number) => {
    if (playingClip === id) {
      setPlayingClip(null);
    } else {
      setPlayingClip(id);
    }
  };

  const currentPlaying = audioClips.find(c => c.id === playingClip);

  const tools = [
    {
      name: 'Salesforce CRM',
      category: 'Data Management',
      description: 'Native API pipeline integration. We log cold calls, record consent tags, and assign tasks instantly.',
      icon: <Database className="w-5 h-5 text-sunsetCrimson" />
    },
    {
      name: 'Twilio Voice APIs',
      category: 'Telephony Network',
      description: 'Ensuring carrier-level call quality, high answer rates, and localized caller ID matching.',
      icon: <PhoneCall className="w-5 h-5 text-sunsetCrimson" />
    },
    {
      name: 'Readymode Dialers',
      category: 'Outbound Dialing',
      description: 'Predictive dual-dialing with zero agent idle intervals to maximize contacts per rep per hour.',
      icon: <Volume2 className="w-5 h-5 text-sunsetCrimson" />
    },
    {
      name: 'Microsoft PowerBI',
      category: 'Live Dashboards',
      description: 'Daily visual metrics, call recording logs, answer speeds, and ROI mapping synced directly.',
      icon: <BarChart4 className="w-5 h-5 text-sunsetCrimson" />
    }
  ];

  return (
    <section 
      id="quality-hub" 
      className="py-20 bg-offsetLight/70 border-b border-borderLight text-color-accessibility"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
            Sourcing, QA & Technology
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
            How Nexus Dial Secures 100% Outbound Calibration
          </h2>
          <p className="text-textSecondary text-base sm:text-lg mt-4 col-textSecondary font-medium">
            Explore our elite Cairo recruitment standard, listen to real accent-aligned objection handlers, and survey our advanced dialer tech stack.
          </p>
        </div>

        {/* 3-Part Component Structure Layout */}
        <div 
          id="recruitment-qa-audio-grid"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          
          {/* Column A: Talent Sourcing Pathway (Sourced from TP Egypt) (lg:col-span-5) */}
          <div 
            id="talent-pathway-card" 
            className="lg:col-span-5 bg-white border border-borderLight rounded-2xl p-6 sm:p-8 shadow-cardSoft text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-sunsetCrimson" />
                <span className="text-[11px] font-mono tracking-widest font-extrabold text-sunsetCrimson uppercase">
                  Egypt Recruiting standard
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-textPrimary leading-tight">
                Talent Sourcing Pathway & Accent Alignment
              </h3>

              <p className="text-xs text-textSecondary mt-3 leading-relaxed">
                Our recruiting standard mimics local tech hubs. All agents hired for the US Outbound campaigns undergo multi-factor screening:
              </p>

              {/* Recruitment Pathway Steps */}
              <div className="mt-6 space-y-4">
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-sunsetCrimson/10 text-sunsetCrimson flex items-center justify-center text-[10px] font-bold font-mono shrink-0">1</span>
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary">Top-Tier University Hires</h4>
                    <p className="text-[11px] text-textSecondary leading-normal mt-0.5">
                      Recruits sourced exclusively from Cairo campuses (AUC, GUC, Al-Alsun) requiring pre-admission fluency tests.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-sunsetCrimson/10 text-sunsetCrimson flex items-center justify-center text-[10px] font-bold font-mono shrink-0">2</span>
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary">US Accent/Votation Screening</h4>
                    <p className="text-[11px] text-textSecondary leading-normal mt-0.5">
                      Phonetic and accent profiling matching localized US dialects (Western, Mid-Western, Deep South, East Coast Neutral).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-sunsetCrimson/10 text-sunsetCrimson flex items-center justify-center text-[10px] font-bold font-mono shrink-0">3</span>
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary">Objection Audits & Roleplay</h4>
                    <p className="text-[11px] text-textSecondary leading-normal mt-0.5">
                      Graduates complete 80 rigorous roleplay scenarios dealing with sudden hang-ups, angry homeowners, and complex rebuttals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Languages */}
              <div className="mt-6 pt-5 border-t border-borderLight/60">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">
                  Languages Supported Globally:
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['English (US/UK)', 'French (Canadian)', 'German (DACH)', 'Russian'].map((lang, lIdx) => (
                    <span key={lIdx} className="text-[10px] font-semibold text-textSecondary bg-offsetLight border border-borderLight/80 px-2.5 py-1 rounded">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics: Cairo speed average */}
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-sunsetCrimson/5 to-sunsetGold/5 border border-sunsetCrimson/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sunsetCrimson" />
                <span className="text-xs font-bold text-textPrimary">Dialer Sync latency</span>
              </div>
              <span className="text-xs font-extrabold font-mono text-sunsetCrimson">
                &lt; 3 Seconds Average Response Speed
              </span>
            </div>

          </div>

          {/* Column B: Objection Handling Sourcing (Sourced from vCallers) (lg:col-span-7) */}
          <div 
            id="objection-audits-card" 
            className="lg:col-span-7 bg-white border border-borderLight rounded-2xl p-6 sm:p-8 shadow-cardSoft text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-trustGreen" />
                  <span className="text-[11px] font-mono tracking-widest font-extrabold text-trustGreen uppercase">
                    Interactive Accent Demonstrations
                  </span>
                </div>
                <div className="hidden xs:flex items-center gap-1.5 text-[10px] text-textMuted bg-offsetLight border px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3 text-sunsetGold" /> Accent-Aligned
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-textPrimary leading-tight">
                Interactive Objection Handling Sourcing Portal
              </h3>

              <p className="text-xs text-textSecondary mt-2 leading-relaxed font-semibold">
                Most outbound dialers suffer due to flat, robotic agent responses. Hear how Nexus Dial agents effortlessly bypass common high-ticket sales objections:
              </p>

              {/* Audio Clips Listings Container */}
              <div className="mt-6 space-y-3" id="audio-objection-listings">
                {audioClips.map((clip) => {
                  const isPlaying = playingClip === clip.id;
                  return (
                    <div 
                      key={clip.id}
                      className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        isPlaying 
                          ? 'bg-[#059669]/5 border-[#059669]/30 shadow-sm' 
                          : 'bg-offsetLight/40 border-borderLight/80 hover:bg-offsetLight'
                      }`}
                    >
                      {/* Active Visualizer Waveform Overlay */}
                      {isPlaying && (
                        <div className="absolute bottom-2 right-4 flex items-end gap-[3px] h-8 opacity-40">
                          {[0.4, 0.6, 0.5, 0.7, 0.3, 0.8, 0.4, 0.9, 0.5].map((speed, i) => (
                            <motion.span 
                              key={i} 
                              className="w-[3px] bg-trustGreen rounded-t"
                              initial={{ height: 4 }}
                              animate={{ height: [4, 28, 4] }}
                              transition={{
                                duration: speed + 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-start gap-3.5">
                        {/* Play/Pause Circle button */}
                        <button
                          onClick={() => togglePlay(clip.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                            isPlaying 
                              ? 'bg-trustGreen text-white border-trustGreen scale-105 shadow-md' 
                              : 'bg-white text-textPrimary hover:border-sunsetCrimson hover:text-sunsetCrimson border-borderLight'
                          }`}
                          aria-label={isPlaying ? 'Pause Clip' : 'Play Clip'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4 fill-white pr-[0.5px]" /> : <Play className="w-4.5 h-4.5 pl-0.5" />}
                        </button>

                        <div className="w-full">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-bold text-textPrimary">{clip.scenario}</span>
                            <span className="text-[10px] font-mono font-bold text-textMuted bg-white border border-borderLight px-1.5 py-0.5 rounded">{clip.duration}</span>
                          </div>
                          
                          <p className="text-[11px] text-textSecondary italic mt-1 font-semibold">
                            Objection: "{clip.objection}"
                          </p>

                          <p className="text-[11px] text-textMuted mt-1 w-full truncate italic">
                            Agent Response: "{clip.responsePreview}"
                          </p>

                          {/* Progress bar (Only visible when active) */}
                          {isPlaying && (
                            <div className="w-full bg-borderLight h-1 rounded-full mt-3 overflow-hidden">
                              <div 
                                className="h-full bg-trustGreen rounded-full transition-all duration-150 ease-linear"
                                style={{ width: `${playbackProgress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Selected Audio Transcription */}
              {playingClip !== null && currentPlaying && (
                <div className="mt-4 p-4 rounded-xl bg-offsetLight/80 border border-trustGreen/20 text-xs animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-trustGreen uppercase tracking-widest block font-mono">
                      ✓ Real-time Accent playback transcript ({currentPlaying.agent})
                    </span>
                    <button 
                      onClick={() => setPlayingClip(null)}
                      className="text-[10px] font-bold text-textMuted hover:text-textPrimary"
                    >
                      Clear Player
                    </button>
                  </div>
                  <p className="text-textSecondary leading-relaxed italic pr-4 font-semibold">
                    {currentPlaying.transcription}
                  </p>
                </div>
              )}

            </div>

            {/* QA Certification tag */}
            <div className="mt-8 pt-4 border-t border-borderLight/60 text-xs text-textMuted flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-trustGreen stroke-[2.5]" />
                <span>Audio reviewed daily by COPC Lead Auditors</span>
              </span>
              <span className="font-mono text-[10px] text-textSecondary bg-offsetLight px-2 py-0.5 rounded border border-borderLight">
                100% Quality Guaranteed
              </span>
            </div>

          </div>

        </div>

        {/* Integrated CRM Tech Stack (Sourced from Elevate Holding) */}
        <div id="integrated-tech-stack-container" className="mt-12 pt-12 border-t border-borderLight/80">
          <div className="flex items-center gap-2.5 mb-8 justify-center lg:justify-start">
            <Cpu className="w-5 h-5 text-sunsetCrimson" />
            <h3 className="text-xl font-extrabold text-textPrimary tracking-tight text-center lg:text-left">
              Integrated CRM Cloud Tech Stack
            </h3>
          </div>

          <div 
            id="tech-stack-items-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch text-left"
          >
            {tools.map((tool, i) => (
              <div 
                key={i}
                className="bg-white border border-borderLight/90 rounded-xl p-5 shadow-cardSoft hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-offsetLight flex items-center justify-center border border-borderLight">
                    {tool.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-textPrimary">{tool.name}</h4>
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block font-sans">
                      {tool.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-textSecondary leading-relaxed">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>

          {/* Quick CRM Setup note */}
          <div className="mt-6 p-4 rounded-xl bg-offsetLight border border-borderLight/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-sunsetCrimson shrink-0" />
              <span className="text-xs text-textSecondary font-semibold">
                We design and configure custom outbound mapping directly inside your dialer. Zero setup fees.
              </span>
            </div>
            <a 
              href="#roi-calculator-section" 
              className="text-xs font-bold text-sunsetCrimson hover:text-activeCrimson inline-flex items-center gap-1 shrink-0 font-sans group"
            >
              <span>Calculate Custom CRM Return On Investment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
