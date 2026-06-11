import { motion } from 'motion/react';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  imagePath: string;
  fallbackImage?: string; // For Hesham's native picture source element
}

export default function LeadershipTeam() {
  const leadershipTeam: TeamMember[] = [
    {
      id: 'amr-a',
      name: 'Malak Tamer',
      title: 'CEO & Founder',
      imagePath: '../../public/Marie.jpeg',
      bio: 'Visionary leader with 10+ years in B2B sales and business development. Passionate about helping companies scale efficiently.'
    },
    {
      id: 'abdullah',
      name: 'Mohamed Ahmed',
      title: 'CEO',
      imagePath: '../../public/Moe.jpeg',
      bio: 'Expert in building high-performing sales teams and developing winning strategies for complex B2B sales cycles.'
    },
    // {
    //   id: 'amr-m',
    //   name: 'Amr M.',
    //   title: 'Strategic Advisor',
    //   imagePath: '../../public/one.jpeg',
    //   bio: 'Brings strategic insight and industry expertise to guide our clients through complex market challenges.'
    // },
    {
      id: 'mai',
      name: 'Mai Khater',
      title: 'Operations Manager',
      imagePath: '../../public/tow.jpeg',
      bio: 'Ensures smooth operations and exceptional service delivery across all client engagements.'
    },
    // {
    //   id: 'layla',
    //   name: 'Layla M.',
    //   title: 'Account Management',
    //   imagePath: 'assets/about-us/team-photos/Layla.m1.webp',
    //   bio: 'Dedicated to building lasting client relationships and ensuring campaign success at every stage.'
    // },
    // {
    //   id: 'maira',
    //   name: 'Maira Osama',
    //   title: 'Recruitment Manager',
    //   imagePath: 'assets/about-us/team-photos/Maira-Osama.webp',
    //   bio: 'Finds and nurtures top talent to ensure our team delivers exceptional results for every client.'
    // },
    // {
    //   id: 'hesham',
    //   name: 'Hesham',
    //   title: 'Data & IT Manager',
    //   imagePath: 'assets/about-us/team-photos/Hesham.webp',
    //   fallbackImage: 'assets/about-us/team-photos/Hesham.jpg',
    //   bio: 'Oversees data infrastructure and IT systems, ensuring seamless operations and data-driven insights for all client campaigns.'
    // }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 15
      }
    }
  };

  return (
    <section id="leadership-section" className="py-20 bg-white border-b border-gray-100">
      {/* FIXED: Re-added missing structural wrapper div */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block Section */}
<div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-sunsetCrimson uppercase tracking-widest bg-sunsetCrimson/5 px-3.5 py-1.5 rounded-full border border-sunsetCrimson/10 inline-block mb-3">
            LEADERSHIP
          </span>
          <h2 
            id="pain-points-title" 
            className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight"
          >
            Meet Our Leadership Team
          </h2>
          <p className="text-textSecondary text-base sm:text-lg mt-4">
           Experienced professionals dedicated to driving your success.
          </p>
        </div>

        {/* Leadership Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {leadershipTeam.map((member) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl text-left"
            >
              {/* Aspect Ratio Box */}
              <div className="relative overflow-hidden aspect-[4/5] bg-gray-50">
                {member.fallbackImage ? (
                  <picture>
                    <source srcSet={member.imagePath} type="image/webp" />
                    <img 
                      src={member.fallbackImage} 
                      alt={`${member.name} - ${member.title}`}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-102" 
                      loading="lazy"
                    />
                  </picture>
                ) : (
                  <img 
                    src={member.imagePath} 
                    alt={`${member.name} - ${member.title}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-102" 
                    loading="lazy"
                  />
                )}
              </div>

              {/* Body Details Block */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-belkins-dark">{member.name}</h3>
                  <p className="text-bpo-blue font-medium mb-3 mt-0.5">{member.title}</p>
                  <p className="text-belkins-gray text-sm mb-4 leading-relaxed">{member.bio}</p>
                </div>

                <a 
                  href="https://www.linkedin.com/company/bpohive" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-[#0A66C2] hover:underline text-sm font-medium mt-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button Block */}
        {/* <div className="text-center mt-12">
          <button 
            type="button"
            className="inline-flex items-center px-8 py-4 bg-belkins-orange text-white font-semibold rounded-full text-lg shadow-md hover:opacity-95 transition-all cursor-pointer"
          >
            Join 1,000+ Companies We've Helped
          </button>
        </div> */}

      </div>
    </section>
  );
}