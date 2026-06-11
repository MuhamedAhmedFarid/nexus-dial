import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneCall, Play, Pause, Award, BadgeCheck, Star } from 'lucide-react';

interface Specialist {
  id: string;
  name: string;
  title: string;
  skills: string[];
  callingTools: string[];
  avatarUrl: string;
  pitch: string;
  voiceGender: 'male' | 'female';
}

export default function SdrSpecialists() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopSpeech();
    };
  }, []);

  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(0);
  };

  const speakPitch = (text: string, gender: 'male' | 'female') => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Direct translation to premium accent/voice settings where possible
    const voices = synthRef.current.getVoices();
    // Try to find a premium native english voice
    const englishVoice = voices.find(v => 
      v.lang.startsWith('en-US') && 
      v.name.toLowerCase().includes(gender === 'male' ? 'david' : 'zira')
    ) || voices.find(v => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    // Set natural calling rate & pitch parameters
    utterance.rate = 1.0;
    utterance.pitch = gender === 'male' ? 0.95 : 1.05;

    synthRef.current.speak(utterance);
  };

  const handleTogglePlay = (specialist: Specialist) => {
    if (playingId === specialist.id) {
      stopSpeech();
      setPlayingId(null);
    } else {
      stopSpeech();
      setPlayingId(specialist.id);
      
      // Fire up browser synthetic voice capability
      speakPitch(specialist.pitch, specialist.voiceGender);

      let currentProgress = 0;
      intervalRef.current = setInterval(() => {
        currentProgress += 2.5;
        if (currentProgress >= 100) {
          stopSpeech();
          setPlayingId(null);
        } else {
          setProgress(currentProgress);
        }
      }, 250); // Generates a ~10-second audition preview timeline
    }
  };

  const specialists: Specialist[] = [
    {
      id: 'marcus',
      name: 'Marcus Vance',
      title: 'Roofing Acquisitions SDR',
      skills: ['Storm Damage Outreach', 'Commercial Gatekeeper Navigation'],
      callingTools: ['Salesforce', 'Twilio', 'Readymode', 'Objection Frameworks'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80',
      pitch: "Hey there! This is Marcus with the outbound team. I saw storm damage reports around your commercial sector last weekend and wanted to see if you have a reliable thermal scan on file before your insurance claim window closes this quarter.",
      voiceGender: 'male',
    },
    {
      id: 'sarah',
      name: 'Sarah Chen',
      title: 'Solar Pre-Qualification Expert',
      skills: ['Energy Savings Calculus', 'Net-Metering Rebate Scripts'],
      callingTools: ['HubSpot', 'RingCentral', 'ViciDial', 'Rebate Modeling'],
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80',
      pitch: "Hello! This is Sarah from solar advisory. I was calling because your area was just selected for the zero-down net metering rebate program. If your current monthly bill is over a hundred dollars, you qualify to wipe out ninety percent of your utility rates.",
      voiceGender: 'female',
    },
    {
      id: 'devon',
      name: 'Devon Miller',
      title: 'Real Estate Acquisitions SDR',
      skills: ['Skiptrace List Verification', 'Motivated Seller Frameworks'],
      callingTools: ['Podio', 'SmrtPhone', 'BatchDialer', 'Equity Evaluation'],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&q=80',
      pitch: "Hi there, Devon here. I'm reaching out to home owners directly in the block regarding the property on Oak Street. We have cash buyers deploying 1031 capital in your exact ZIP code and can close in seven days with zero broker commissions.",
      voiceGender: 'male',
    },
    {
      id: 'elena',
      name: 'Elena Rostova',
      title: 'Web Design Appointment Setter',
      skills: ['Site Performance Audits', 'Outdated UX Pitches'],
      callingTools: ['Pipedrive', 'Aircall', 'Apollo.io', 'Speed Tests'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&q=80',
      pitch: "Hello! Quick message from Elena. I checked your portal loading speed on commercial mobile screens, and it took over five seconds, which actually gets flagged on search ranks. I wanted to hand you a free technical layout redesign.",
      voiceGender: 'female',
    }
  ];

  // Framer Motion entry variants for scroll loading
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

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const footerPanelVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 15,
        delay: 0.4
      }
    }
  };

  return (
    <section 
      id="sdr-specialists-section" 
      className="py-24 bg-white border-b border-[#E5E7EB]"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* Header Block Section */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-8">
          
          {/* Left: Text Titles */}
          <div className="max-w-3xl text-left">
            <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest block mb-3 font-mono">
              WORLD-CLASS TALENT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight">
              Meet Your Dedicated SDR Team
            </h2>
            <p className="text-base sm:text-lg text-[#4B5563] mt-5 leading-relaxed font-sans font-medium">
              We don't use generic dialers. We hand-select and align specialized outbound callers to act as a seamless, high-performance extension of your own sales floor.
            </p>
          </div>

          {/* Right: Permanent Capability Badges */}
          <div className="flex flex-col sm:flex-row gap-4 lg:self-center shrink-0">
            {/* Badge 1 */}
            <div className="flex items-center gap-3 bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 rounded-full hover:shadow-sm transition-shadow">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold text-[#111827] font-semibold tracking-wide uppercase">
                C1/C2 Certified English SDRs
              </span>
            </div>

            {/* Badge 2 */}
            <div className="flex items-center gap-3 bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 rounded-full hover:shadow-sm transition-shadow">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-extrabold text-[#111827] font-semibold tracking-wide uppercase">
                TCPA & DNC Compliant Operations
              </span>
            </div>
          </div>

        </div>

        {/* 4-Column Specialists Interactive Grid */}
        <motion.div 
          id="specialists-cards-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {specialists.map((specialist) => {
            const isPlaying = playingId === specialist.id;
            return (
              <motion.div
                key={specialist.id}
                id={`sdr-card-${specialist.id}`}
                variants={cardVariants}
                className="group relative bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:-translate-y-2 hover:border-[#F97316]/60 hover:shadow-[0_15px_30px_rgba(249,115,22,0.1)] text-left"
              >
                
                <div>
                  {/* Card Top: Visual Area */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                      <img 
                        src={specialist.avatarUrl} 
                        alt={specialist.name}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-full border-2 border-slate-100 object-cover"
                      />
                      {/* Active green status green dot */}
                      <span className="absolute bottom-1 right-1 flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" title="Active Dialing Status"></span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-1 rounded-full text-[10px] font-bold text-[#4B5563]">
                      <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                      <span>TOP SDR</span>
                    </div>
                  </div>

                  {/* Card Center: Title & Vertical Focus */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#F97316] transition-colors">
                      {specialist.name}
                    </h3>
                    <p className="text-xs font-extrabold text-[#F97316] mt-1 bg-[#F97316]/5 border border-[#F97316]/15 rounded py-1 px-2 inline-block">
                      {specialist.title}
                    </p>
                    
                    {/* Dialect Standard Badge */}
                    <div className="mt-3 flex items-center bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                      <span className="text-[10px] font-bold text-emerald-800 leading-snug">
                        🎙️ Flawless North American Dialect Alignment
                      </span>
                    </div>

                    {/* Skills Sub-tier */}
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block">
                        Vertical Sub-Specialties:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {specialist.skills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded"
                          >
                            • {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: calling tool stacks & interactive play preview */}
                <div className="mt-auto pt-5 border-t border-slate-100">
                  
                  {/* Tool stacks pills */}
                  <div className="mb-5">
                    <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block mb-2">
                      Calling Tool Stack:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {specialist.callingTools.map((tool, idx) => (
                        <span 
                          key={idx} 
                          className="text-[9px] font-bold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Audio simulation playback progress */}
                  <AnimatePresence>
                    {isPlaying && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 bg-orange-50 border border-orange-100 rounded-lg p-2.5 overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-[10px] text-orange-850 font-bold mb-1">
                          <span>Auditioning Live Voice Pitch...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        {/* Interactive dynamic wave bars */}
                        <div className="flex items-end gap-[3px] h-6 mt-2 mb-1 justify-center">
                          {[0.4, 0.7, 0.5, 0.9, 1.2, 0.6, 0.8, 1.4, 0.5, 0.9, 0.4].map((speed, i) => (
                            <motion.span 
                              key={i} 
                              className="w-[3px] bg-[#F97316] rounded-full"
                              initial={{ height: 4 }}
                              animate={{ height: [4, 20, 6, 24, 4] }}
                              transition={{
                                duration: speed,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.08
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Trigger Call Action Button */}
                  <button
                    onClick={() => handleTogglePlay(specialist)}
                    className={`w-full py-2.5 px-4 rounded-xl font-sans text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 border cursor-pointer ${
                      isPlaying 
                        ? 'bg-gradient-to-r from-[#F97316] to-[#F59E0B] border-transparent text-white shadow-md' 
                        : 'bg-white border-[#E5E7EB] text-[#111827] hover:border-[#F97316] hover:bg-[#F97316]/5'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                        <span>Playing Audition Demo</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#F97316] stroke-[2.5] group-hover:scale-110 transition-transform" />
                        <span>Listen to Voice Sample</span>
                      </>
                    )}
                  </button>

                </div>

              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer Capability Discovery Board */}
        <motion.div 
          id="specialists-capability-board"
          variants={footerPanelVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-8 md:p-10 text-left"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-slate-200">
            
            {/* Column 1 */}
            <div className="md:pr-8">
              <div className="flex items-center gap-2 text-[#F97316] mb-3">
                <BadgeCheck className="w-5 h-5 text-[#F97316]" />
                <h4 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider font-sans">
                  Framework-Driven Training
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                We do not use rigid scripts that sound robotic. Our SDRs are schooled in specific value-oriented frameworks, active listening, and advanced objection handling.
              </p>
            </div>

            {/* Column 2 */}
            <div className="md:px-8">
              <div className="flex items-center gap-2 text-[#F97316] mb-3">
                <Award className="w-5 h-5 text-[#F97316]" />
                <h4 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider font-sans">
                  Dedicated Vertical Focus
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                Every calling agent is trained specifically on your industry, terminology, target audience, and direct competitors before making their first dial.
              </p>
            </div>

            {/* Column 3 */}
            <div className="md:pl-8">
              <div className="flex items-center gap-2 text-[#F97316] mb-3">
                <PhoneCall className="w-5 h-5 text-[#F97316]" />
                <h4 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider font-sans">
                  Full Quality Supervision
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-medium">
                100% of calls are recorded and reviewed by dedicated account managers, maintaining an average meeting show-rate of 85%.
              </p>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
