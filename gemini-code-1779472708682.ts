import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, ArrowUpRight, Award, Layers, Terminal, BookOpen, Cpu } from 'lucide-react';

// --- GLOBAL TYLES & FONT INJECTION ---
// The component injects Google Font 'Kanit' and specific text gradient classes.
const DesignGlobals = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;900&display=swap');
    
    html, body, #root {
      background-color: #0C0C0C;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Kanit', sans-serif;
    }
    
    *, *:before, *:after {
      box-sizing: inherit;
    }

    .hero-heading {
      background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `}} />
);

// --- REUSABLE COMPONENTS ---

// 1. ContactButton Component
const ContactButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      style={{
        background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
        outline: '2px solid white',
        outlineOffset: '-3px'
      }}
      className="rounded-full pill text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base hover:scale-105 active:scale-95 transition-transform duration-200"
    >
      Contact Me
    </button>
  );
};

// 2. LiveProjectButton Component
const LiveProjectButton: React.FC<{ label?: string; href?: string }> = ({ label = "Live Project", href = "#" }) => {
  return (
    <a 
      href={href}
      className="inline-block rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base hover:bg-[#D7E2EA]/10 transition-colors duration-200 text-center"
    >
      {label}
    </a>
  );
};

// 3. FadeIn Framer Motion Wrapper
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
}
const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, duration = 0.7, x = 0, y = 30, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 4. Magnet Component for Mouse-Following Hover Effect
interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}
const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 150,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
  className = ""
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate3d(0px, 0px, 0px)");
  const [transition, setTransition] = useState(inactiveTransition);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < Math.max(rect.width, rect.height) / 2 + padding) {
        setTransition(activeTransition);
        setTransform(`translate3d(${distanceX / strength}px, ${distanceY / strength}px, 0px)`);
      } else {
        setTransition(inactiveTransition);
        setTransform("translate3d(0px, 0px, 0px)");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [padding, strength, activeTransition, inactiveTransition]);

  return (
    <div ref={ref} style={{ transform, transition, willChange: 'transform' }} className={className}>
      {children}
    </div>
  );
};

// 5. AnimatedText Character Scroll Reveal Component
const AnimatedText: React.FC<{ text: string }> = ({ text }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"]
  });

  const words = text.split(" ");

  return (
    <p ref={containerRef} className="text-[#D7E2EA] font-medium text-center leading-relaxed max-w-[640px] text-[clamp(1rem,2vw,1.35rem)] font-kanit">
      {words.map((word, wordIdx) => {
        return (
          <span key={wordIdx} className="inline-block mx-1 whitespace-nowrap">
            {word.split("").map((char, charIdx) => {
              // Approximate continuous activation index per character across text block
              const totalIndex = text.indexOf(word) + charIdx;
              const start = totalIndex / text.length;
              const end = (totalIndex + 1) / text.length;
              return <AnimatedChar key={charIdx} char={char} progress={scrollYProgress} range={[start, end]} />;
            })}
          </span>
        );
      })}
    </p>
  );
};

const AnimatedChar: React.FC<{ char: string; progress: any; range: [number, number] }> = ({ char, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span className="relative inline-block">
      <span className="opacity-20">{char}</span>
      <motion.span style={{ opacity }} className="absolute top-0 left-0 text-[#D7E2EA]">
        {char}
      </motion.span>
    </span>
  );
};


// --- CORE PORTFOLIO SECTIONS ---

// SECTION 1: HERO SECTION
const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex flex-col justify-between bg-[#0C0C0C] text-[#D7E2EA] overflow-hidden px-6 md:px-10 font-kanit">
      
      {/* Navbar */}
      <FadeIn delay={0} y={-20} className="w-full">
        <nav className="flex justify-between items-center pt-6 md:pt-8 w-full">
          <div className="text-sm md:text-lg lg:text-[1.4rem] font-bold tracking-widest text-[#BBCCD7]">
            M. IKRAMULLAH
          </div>
          <div className="flex gap-6 md:gap-10 lg:gap-14">
            {["About", "Expertise", "Experience", "Contact"].map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase()}`}
                className="text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-[#D7E2EA] hover:opacity-70 transition-opacity duration-200"
              >
                {link}
              </a>
            ))}
          </div>
        </nav>
      </FadeIn>

      {/* Hero Portrait (Absolutely Centered / Magnetic Background element) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0 z-10 pointer-events-auto">
        <FadeIn delay={0.6} y={30}>
          <Magnet 
            padding={150} 
            strength={3} 
            activeTransition="transform 0.3s ease-out" 
            inactiveTransition="transform 0.6s ease-in-out"
          >
            <img 
              src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" 
              alt="Portrait of Ikram"
              className="w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] object-contain drop-shadow-2xl mix-blend-screen opacity-70"
            />
          </Magnet>
        </FadeIn>
      </div>

      {/* Hero Massive Heading */}
      <div className="w-full overflow-hidden mt-6 sm:mt-4 md:-mt-5 relative z-20 select-none pointer-events-none">
        <FadeIn delay={0.15} y={40}>
          <h1 className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw] w-full text-center">
            Hi, i&apos;m ikram
          </h1>
        </FadeIn>
      </div>

      {/* Bottom Information Row */}
      <div className="flex justify-between items-end pb-7 sm:pb-8 md:pb-10 w-full relative z-20">
        <FadeIn delay={0.35} y={20}>
          <p className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug text-[clamp(0.75rem,1.4vw,1.5rem)] max-w-[160px] sm:max-w-[220px] md:max-w-[260px]">
            a tech educator & web developer driven by crafting future-ready talent and striking digital experiences
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <a href="#contact">
            <ContactButton />
          </a>
        </FadeIn>
      </div>
    </section>
  );
};

// SECTION 2: MARQUEE SECTION
const MarqueeSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      // Exact calculation requested: (window.scrollY - sectionTop + window.innerHeight) * 0.3
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      setScrollOffset(offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const row1Images = [
    "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
    "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
    "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
    "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
    "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
    "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
    "https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif",
    "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif",
    "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif",
    "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
    "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif"
  ];

  const row2Images = [
    "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
    "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
    "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
    "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
    "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
    "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif",
    "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif",
    "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
    "https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif",
    "https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif"
  ];

  // Tripled rows for continuous, seamless wrap
  const tripledRow1 = [...row1Images, ...row1Images, ...row1Images];
  const tripledRow2 = [...row2Images, ...row2Images, ...row2Images];

  return (
    <section ref={sectionRef} className="w-full bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden select-none">
      <div className="flex flex-col gap-3">
        
        {/* Row 1: Moves RIGHT on scroll */}
        <div 
          style={{ 
            transform: `translateX(${scrollOffset - 200}px)`, 
            willChange: 'transform' 
          }} 
          className="flex gap-3 whitespace-nowrap transition-transform duration-75 ease-out"
        >
          {tripledRow1.map((src, idx) => (
            <img 
              key={`r1-${idx}`}
              src={src} 
              alt="Design Preview Content" 
              loading="lazy"
              className="w-[420px] h-[270px] rounded-2xl object-cover flex-shrink-0"
            />
          ))}
        </div>

        {/* Row 2: Moves LEFT on scroll */}
        <div 
          style={{ 
            transform: `translateX(${- (scrollOffset - 200)}px)`, 
            willChange: 'transform' 
          }} 
          className="flex gap-3 whitespace-nowrap transition-transform duration-75 ease-out"
        >
          {tripledRow2.map((src, idx) => (
            <img 
              key={`r2-${idx}`}
              src={src} 
              alt="Design Preview Content" 
              loading="lazy"
              className="w-[420px] h-[270px] rounded-2xl object-cover flex-shrink-0"
            />
          ))}
        </div>

      </div>
    </section>
  );
};

// SECTION 3: ABOUT SECTION
const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative min-h-screen w-full bg-[#0C0C0C] px-5 sm:px-8 md:px-10 py-20 flex flex-col justify-center items-center overflow-hidden font-kanit">
      
      {/* Decorative Floating Assets */}
      <FadeIn delay={0.1} x={-80} y={0} duration={0.9} className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] z-0">
        <img src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png" className="w-[120px] sm:w-[160px] md:w-[210px]" alt="Moon Icon" />
      </FadeIn>

      <FadeIn delay={0.25} x={-80} y={0} duration={0.9} className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] z-0">
        <img src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png" className="w-[100px] sm:w-[140px] md:w-[180px]" alt="3D Shape" />
      </FadeIn>

      <FadeIn delay={0.15} x={80} y={0} duration={0.9} className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] z-0">
        <img src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png" className="w-[120px] sm:w-[160px] md:w-[210px]" alt="Lego Icon" />
      </FadeIn>

      <FadeIn delay={0.3} x={80} y={0} duration={0.9} className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] z-0">
        <img src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png" className="w-[130px] sm:w-[170px] md:w-[220px]" alt="3D Group" />
      </FadeIn>

      {/* Main Content Layout */}
      <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16 z-10 w-full">
        <FadeIn delay={0} y={40}>
          <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center text-[clamp(3rem,12vw,160px)]">
            About me
          </h2>
        </FadeIn>

        {/* Scroll-Revealed Text Profile tailored to Mohammed Ikramullah */}
        <AnimatedText 
          text="With more than fifteen years of comprehensive experience in computer science instruction, software development, and UI/UX process design, i focus on code literacy, modern cloud architecture, and immersive student engineering. I truly enjoy enabling teams and custom brands to map out high-performing ecosystems that stand out beautifully. Let's build something incredible together!" 
        />

        <FadeIn delay={0.2} y={20} className="mt-6 sm:mt-10 md:mt-12">
          <a href="#contact">
            <ContactButton />
          </a>
        </FadeIn>
      </div>
    </section>
  );
};

// SECTION 4: SERVICES SECTION
interface ServiceItem {
  id: string;
  title: string;
  desc: string;
}
const ServicesSection: React.FC = () => {
  const services: ServiceItem[] = [
    { id: "01", title: "Full-Stack Web Dev", desc: "Expert engineering across HTML5, CSS3, JavaScript, Bootstrap, React, and PHP/SQL to construct custom responsive interfaces and data models." },
    { id: "02", title: "UX / UI Design Systems", desc: "Google certified architecture centered around profound user research, structural high-fidelity wireframing, prototyping, and end-to-end interface logic." },
    { id: "03", title: "Computer Science Pedagogy", desc: "Diverse curriculum integration, specialized technical training alignment, and comprehensive education in modern cloud setups and algorithms." },
    { id: "04", title: "Data & Business Analytics", desc: "Advanced data manipulation, complex pipeline optimization, database server scripting, and intelligence reporting powered by Python and SQL Server." },
    { id: "05", title: "STEM & Autonomous Robotics", desc: "Immersive development ecosystems utilizing RobotC platforms, embedded microcontrollers, 3D systems modeling, and network infrastructure." }
  ];

  return (
    <section id="expertise" className="bg-white rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 text-[#0C0C0C] font-kanit relative z-20">
      <div className="max-w-5xl mx-auto">
        
        <h2 className="font-black uppercase text-center text-[clamp(3rem,12vw,160px)] mb-16 sm:mb-20 md:mb-28 leading-none">
          Services
        </h2>

        <div className="flex flex-col border-t border-[rgba(12,12,12,0.15)]">
          {services.map((svc, i) => (
            <FadeIn key={svc.id} delay={i * 0.1} y={30} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-8 sm:py-10 md:py-12 border-b border-[rgba(12,12,12,0.15)] gap-4 sm:gap-10">
                
                {/* Number ID */}
                <div className="font-black text-[clamp(3rem,10vw,140px)] color-[#0C0C0C] leading-none tracking-tight select-none sm:w-1/4">
                  {svc.id}
                </div>

                {/* Stacking Info block */}
                <div className="flex flex-col flex-1 gap-2">
                  <h3 className="font-medium uppercase text-[clamp(1.4rem,2.2vw,2.1rem)] tracking-tight">
                    {svc.title}
                  </h3>
                  <p className="font-light leading-relaxed max-w-2xl text-[clamp(0.85rem,1.6vw,1.25rem)] text-[#0C0C0C]/70">
                    {svc.desc}
                  </p>
                </div>

              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
};

// SECTION 5: PROJECTS SECTION (Sticky-Stacking Cards)
interface ProjectData {
  id: string;
  category: string;
  title: string;
  img1: string;
  img2: string;
  img3: string;
}
const ProjectsSection: React.FC = () => {
  const projects: ProjectData[] = [
    {
      id: "01",
      category: "IT ACADEMY LEAD",
      title: "Mather High Web Infrastructure",
      img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85",
      img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85",
      img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85"
    },
    {
      id: "02",
      category: "UI/UX ARCHITECTURE",
      title: "Google Design Systems Integration",
      img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85",
      img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85",
      img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85"
    },
    {
      id: "03",
      category: "STEM & CLOUD RUN",
      title: "Catalyst Maria Robotics & PLTW",
      img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85",
      img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85",
      img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85"
    }
  ];

  return (
    <section id="experience" className="bg-[#0C0C0C] text-[#D7E2EA] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 pt-20 pb-32 px-5 sm:px-8 md:px-10 relative z-30 font-kanit">
      <div className="max-w-6xl mx-auto">
        
        <FadeIn>
          <h2 className="hero-heading font-black uppercase text-center text-[clamp(3rem,12vw,160px)] mb-20 leading-none">
            Project
          </h2>
        </FadeIn>

        {/* Sticky Container Stack */}
        <div className="flex flex-col gap-24 relative w-full">
          {projects.map((proj, idx) => {
            return (
              <StickyCard 
                key={proj.id} 
                project={proj} 
                index={idx} 
                totalCards={projects.length} 
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};

// Interactive Sticky Tracking Individual Card Child
const StickyCard: React.FC<{ project: ProjectData; index: number; totalCards: number }> = ({ project, index, totalCards }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Custom scroll tracking for interactive scale down calculation requested
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start start", "end start"]
  });

  // Scale calculation calculation: targetScale = 1 - (totalCards - 1 - index) * 0.03
  const baseScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [baseScale, baseScale * 0.95]);

  return (
    <div 
      ref={cardRef}
      style={{ top: `${index * 28}px` }}
      className="sticky h-[85vh] w-full flex items-center justify-center z-10"
    >
      <motion.div 
        style={{ scale, willChange: 'transform' }}
        className="w-full h-full border-2 border-[#D7E2EA] bg-[#0C0C0C] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-4 overflow-hidden shadow-2xl"
      >
        {/* Top Data Content Row */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4 sm:gap-8">
            <span className="font-black text-[clamp(2.5rem,6vw,80px)] text-[#BBCCD7] leading-none">
              {project.id}
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-[#D7E2EA]/60 uppercase tracking-widest font-light">
                {project.category}
              </span>
              <h3 className="font-bold text-base sm:text-xl md:text-2xl uppercase tracking-tight text-[#D7E2EA]">
                {project.title}
              </h3>
            </div>
          </div>
          
          <LiveProjectButton label="Live Project" href="#" />
        </div>

        {/* Bottom Two-Column Balanced Responsive Image Grid */}
        <div className="grid grid-cols-10 gap-3 w-full flex-1 items-stretch mt-4">
          
          {/* Left Block (40% width) - 2 Stacked Images */}
          <div className="col-span-4 flex flex-col gap-3 justify-between h-full">
            <img 
              src={project.img1} 
              alt={`${project.title} Context 1`}
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
              className="w-full object-cover rounded-[20px] sm:rounded-[30px] md:rounded-[40px]"
            />
            <img 
              src={project.img2} 
              alt={`${project.title} Context 2`}
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
              className="w-full object-cover flex-1 rounded-[20px] sm:rounded-[30px] md:rounded-[40px]"
            />
          </div>

          {/* Right Block (60% width) - 1 Hero Tall Image */}
          <div className="col-span-6 h-full">
            <img 
              src={project.img3} 
              alt={`${project.title} Visual Master`}
              className="w-full h-full object-cover rounded-[20px] sm:rounded-[30px] md:rounded-[40px]"
            />
          </div>

        </div>

      </motion.div>
    </div>
  );
};

// SECTION 6: FOOTER / CONTACT SECTION
const ContactSection: React.FC = () => {
  return (
    <footer id="contact" className="w-full bg-[#0C0C0C] py-24 px-6 md:px-10 text-[#D7E2EA] text-center border-t border-[#D7E2EA]/10 font-kanit">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <Award className="w-12 h-12 text-[#B600A8] animate-pulse" />
        <h2 className="hero-heading font-black text-4xl sm:text-6xl uppercase tracking-tight">
          Let&apos;s Build the Future
        </h2>
        <p className="text-[#D7E2EA]/70 max-w-xl text-sm sm:text-base font-light">
          Get in touch to collaborate on advanced web ecosystems, educational integrations, or comprehensive user design strategy workshops.
        </p>
        <div className="text-[#BBCCD7] font-medium text-lg mt-4">
          sendikram@gmail.com &nbsp;|&nbsp; 708-955-5503
        </div>
        <div className="text-xs text-[#D7E2EA]/40 mt-12 uppercase tracking-widest">
          © {new Date().getFullYear()} Mohammed Ikramullah. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// --- MAIN WRAPPER CONTAINER ---
export default function PortfolioPage() {
  return (
    <div className="w-full bg-[#0C0C0C] min-h-screen selection:bg-[#B600A8] selection:text-white overflow-x-hidden" style={{ overflowX: 'clip' }}>
      <DesignGlobals />
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}