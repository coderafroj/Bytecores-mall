import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, ShoppingBag } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "FASHION FRENZY",
    titleLine1: "MEGA",
    titleLine2: "FASHION",
    subtitle: "Premium Bags, Heels & Accessories",
    price: "₹99",
    color: "#ff004c",
    bgGradient: "linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%)",
    glow: "rgba(255, 0, 76, 0.4)",
    items: [
      { emoji: "👜", label: "Premium Bag", desktop: { x: 0, y: -30, z: 120, scale: 1.8, rotate: -5 }, mobile: { x: 0, y: -80, z: 80, scale: 1.5, rotate: -5 } },
      { emoji: "👠", label: "Red Heels", desktop: { x: 120, y: 60, z: 80, scale: 1.2, rotate: 15 }, mobile: { x: 70, y: 20, z: 60, scale: 1.1, rotate: 15 } },
      { emoji: "👗", label: "Summer Dress", desktop: { x: -140, y: -10, z: 40, scale: 1.4, rotate: -10 }, mobile: { x: -80, y: 0, z: 40, scale: 1.2, rotate: -10 } },
      { emoji: "🕶️", label: "Sunglasses", desktop: { x: 80, y: -90, z: 160, scale: 1.1, rotate: 10 }, mobile: { x: 50, y: -120, z: 100, scale: 0.9, rotate: 10 } },
      { emoji: "💄", label: "Lipstick", desktop: { x: -100, y: 90, z: 100, scale: 1.3, rotate: -20 }, mobile: { x: -60, y: 80, z: 70, scale: 1, rotate: -20 } },
    ]
  },
  {
    id: 2,
    title: "TECH GADGETS",
    titleLine1: "GADGET",
    titleLine2: "ZONE",
    subtitle: "Headphones, Controllers & Tech",
    price: "₹99",
    color: "#0055ff",
    bgGradient: "linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)",
    glow: "rgba(0, 85, 255, 0.4)",
    items: [
      { emoji: "🎧", label: "Headphones", desktop: { x: 10, y: -20, z: 140, scale: 2.0, rotate: 5 }, mobile: { x: 10, y: -70, z: 100, scale: 1.6, rotate: 5 } },
      { emoji: "🎮", label: "Controller", desktop: { x: -130, y: 40, z: 100, scale: 1.5, rotate: -15 }, mobile: { x: -70, y: 30, z: 70, scale: 1.2, rotate: -15 } },
      { emoji: "⌚", label: "Smartwatch", desktop: { x: 120, y: 80, z: 60, scale: 1.3, rotate: 20 }, mobile: { x: 60, y: 70, z: 50, scale: 1.1, rotate: 20 } },
      { emoji: "💻", label: "Laptop", desktop: { x: -90, y: -100, z: 80, scale: 1.2, rotate: -5 }, mobile: { x: -60, y: -120, z: 60, scale: 1, rotate: -5 } },
      { emoji: "📱", label: "Phone", desktop: { x: 140, y: -60, z: 110, scale: 1.4, rotate: 10 }, mobile: { x: 80, y: -50, z: 80, scale: 1.1, rotate: 10 } },
    ]
  },
  {
    id: 3,
    title: "KIDS & FUN",
    titleLine1: "TOYS &",
    titleLine2: "GAMES",
    subtitle: "Amazing Toys for Little Ones",
    price: "₹99",
    color: "#00c366",
    bgGradient: "linear-gradient(135deg, #f0fff5 0%, #e6ffed 100%)",
    glow: "rgba(0, 195, 102, 0.4)",
    items: [
      { emoji: "🧸", label: "Teddy Bear", desktop: { x: 0, y: -20, z: 130, scale: 1.9, rotate: -2 }, mobile: { x: 0, y: -60, z: 90, scale: 1.5, rotate: -2 } },
      { emoji: "🚀", label: "Rocket", desktop: { x: -120, y: -80, z: 90, scale: 1.4, rotate: -25 }, mobile: { x: -70, y: -110, z: 70, scale: 1.1, rotate: -25 } },
      { emoji: "🎪", label: "Circus", desktop: { x: 130, y: 30, z: 110, scale: 1.5, rotate: 15 }, mobile: { x: 70, y: 20, z: 80, scale: 1.2, rotate: 15 } },
      { emoji: "🎨", label: "Art Set", desktop: { x: -90, y: 70, z: 70, scale: 1.2, rotate: -10 }, mobile: { x: -50, y: 60, z: 50, scale: 1, rotate: -10 } },
      { emoji: "🎯", label: "Target", desktop: { x: 110, y: -70, z: 150, scale: 1.3, rotate: 8 }, mobile: { x: 60, y: -80, z: 100, scale: 1, rotate: 8 } },
    ]
  }
];

export default function Hero3D() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Check window size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Parallax mouse effect (Desktop only)
  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    
    // Normalize coordinates (-1 to 1)
    const x = (clientX - left) / width * 2 - 1;
    const y = (clientY - top) / height * 2 - 1;
    setMousePos({ x, y });
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      rotateY: direction > 0 ? 15 : -15,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: { duration: 0.8, type: "spring", bounce: 0.4 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      rotateY: direction < 0 ? 15 : -15,
      scale: 0.9,
      transition: { duration: 0.5 }
    })
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden font-['Segoe_UI',Arial,sans-serif] bg-white min-h-[600px] lg:min-h-[700px] flex items-center"
      style={{ perspective: "1200px" }}
    >
      {/* Dynamic Background Gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentSlide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
          style={{ background: currentSlide.bgGradient }}
        />
      </AnimatePresence>

      {/* Glow Orbs behind everything */}
      <motion.div 
        animate={{ 
          x: mousePos.x * -30, 
          y: mousePos.y * -30,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="absolute top-1/4 left-1/4 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full blur-[80px] lg:blur-[120px] pointer-events-none z-0"
        style={{ background: currentSlide.glow, opacity: 0.6 }}
      />
      <motion.div 
        animate={{ 
          x: mousePos.x * 20, 
          y: mousePos.y * 20,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] rounded-full blur-[60px] lg:blur-[100px] pointer-events-none z-0"
        style={{ background: currentSlide.glow, opacity: 0.5 }}
      />

      <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 h-full py-12 lg:py-0">
        
        {/* LEFT TEXT CONTENT */}
        <div className="w-full lg:w-[45%] z-20 flex flex-col items-center lg:items-start text-center lg:text-left pt-8 lg:pt-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`text-${currentSlide.id}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col items-center lg:items-start"
            >
              <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 font-bold text-xs uppercase tracking-widest shadow-sm"
                style={{ background: "#fff", color: currentSlide.color, border: `1px solid ${currentSlide.color}30` }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: currentSlide.color }}></span>
                {currentSlide.title}
              </div>
              
              <h1 className="font-black text-6xl md:text-7xl lg:text-[90px] leading-[0.9] tracking-tighter text-slate-900 font-['Barlow_Condensed',sans-serif] mb-2 uppercase">
                {currentSlide.titleLine1} <br/>
                <span style={{ color: currentSlide.color }}>{currentSlide.titleLine2}</span>
              </h1>
              
              <p className="text-base lg:text-lg text-slate-600 font-medium mb-8 max-w-md">
                {currentSlide.subtitle} — Quality guaranteed, delivered fast.
              </p>

              <div className="flex items-end gap-4 mb-10">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Only At</span>
                  <span 
                    className="font-black text-[80px] lg:text-[100px] leading-none font-['Barlow_Condensed',sans-serif]"
                    style={{ color: currentSlide.color }}
                  >
                    {currentSlide.price}
                  </span>
                </div>
                <div className="pb-4">
                  <span className="line-through text-slate-400 font-bold text-lg mr-2">₹999</span>
                  <span className="bg-green-100 text-green-700 font-black px-2 py-1 rounded text-sm uppercase">90% OFF</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 w-full">
                <Link to="/products" className="group relative overflow-hidden rounded-xl bg-slate-900 text-white font-black px-8 py-4 uppercase tracking-widest flex items-center gap-3 transition-transform hover:-translate-y-1 shadow-xl hover:shadow-2xl w-full sm:w-auto justify-center">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <ShoppingBag size={20} />
                  Shop Now
                </Link>
                <Link to="/products" className="rounded-xl bg-white text-slate-900 font-black px-8 py-4 uppercase tracking-widest flex items-center gap-3 transition-all shadow-md hover:shadow-xl border border-slate-100 hover:border-slate-300 w-full sm:w-auto justify-center">
                  View Deals
                </Link>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT 3D COLLAGE */}
        <div className="w-full lg:w-[55%] h-[450px] lg:h-[600px] relative z-10 perspective-[1000px] mt-10 lg:mt-0 flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`collage-${currentSlide.id}`}
              initial={{ opacity: 0, scale: 0.8, rotateY: direction > 0 ? 45 : -45 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotateY: direction > 0 ? -45 : 45 }}
              transition={{ duration: 0.9, type: "spring", bounce: 0.3 }}
              className="relative w-full h-full flex justify-center items-center preserve-3d"
              style={{ transformStyle: "preserve-3d" }}
            >
              
              {/* Central Glowing Platform */}
              <motion.div 
                className="absolute w-[200px] h-[200px] lg:w-[350px] lg:h-[350px] rounded-full shadow-2xl"
                style={{ 
                  background: "radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0) 70%)",
                  transform: "translateZ(-50px)",
                }}
              />

              {/* Floating 3D Items */}
              {currentSlide.items.map((item, index) => {
                const pos = isMobile ? item.mobile : item.desktop;
                // Add parallax factor based on Z-depth (closer items move more)
                const parallaxX = !isMobile ? (mousePos.x * pos.z * 0.3) : 0;
                const parallaxY = !isMobile ? (mousePos.y * pos.z * 0.3) : 0;

                return (
                  <motion.div
                    key={`${currentSlide.id}-item-${index}`}
                    className="absolute flex flex-col items-center justify-center cursor-pointer group"
                    initial={{ opacity: 0, y: pos.y + 100, x: pos.x, z: 0 }}
                    animate={{ 
                      opacity: 1, 
                      y: [pos.y, pos.y - 15, pos.y], 
                      x: pos.x + parallaxX,
                      z: pos.z,
                      rotate: pos.rotate,
                    }}
                    transition={{ 
                      opacity: { duration: 0.5, delay: index * 0.1 },
                      y: { repeat: Infinity, duration: 3 + index * 0.5, ease: "easeInOut" },
                      x: { type: "spring", stiffness: 50, damping: 20 }, // Parallax smooth follow
                      z: { duration: 0.8, type: "spring" }
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* The 3D Block Container */}
                    <motion.div 
                      className="relative bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-white flex items-center justify-center overflow-visible"
                      style={{ 
                        width: isMobile ? 80 * pos.scale : 100 * pos.scale, 
                        height: isMobile ? 80 * pos.scale : 100 * pos.scale,
                        transformStyle: "preserve-3d"
                      }}
                      whileHover={{ scale: 1.1, rotateY: 15, rotateX: 10, z: pos.z + 50 }}
                    >
                      {/* Inner glowing shadow */}
                      <div className="absolute inset-0 rounded-3xl opacity-30 blur-xl" style={{ background: currentSlide.color, transform: "translateZ(-20px)" }}></div>
                      
                      {/* The Emoji/Item itself */}
                      <span 
                        style={{ 
                          fontSize: `${isMobile ? 3.5 * pos.scale : 4.5 * pos.scale}rem`,
                          transform: "translateZ(30px)", // Pop out of card
                          filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.2))"
                        }}
                      >
                        {item.emoji}
                      </span>

                      {/* 3D Label Tag */}
                      <div 
                        className="absolute -bottom-3 -right-3 rounded-full text-white font-black tracking-widest uppercase shadow-lg border-2 border-white"
                        style={{ 
                          background: currentSlide.color,
                          fontSize: isMobile ? '0.45rem' : '0.55rem',
                          padding: isMobile ? '4px 8px' : '6px 12px',
                          transform: "translateZ(40px)", // Pop even further out
                          whiteSpace: "nowrap"
                        }}
                      >
                        {item.label}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30 bg-white/70 backdrop-blur-md px-6 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/50">
        <button 
          onClick={handlePrev}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-slate-800 shadow-md hover:bg-slate-900 hover:text-white transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft size={20} strokeWidth={3} />
        </button>
        
        <div className="flex items-center gap-3">
          {SLIDES.map((slide, idx) => (
            <button 
              key={slide.id}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className="relative rounded-full transition-all duration-300 overflow-hidden"
              style={{ 
                width: currentIndex === idx ? 32 : 10, 
                height: 10, 
                background: currentIndex === idx ? slide.color : "#cbd5e1" 
              }}
            >
              {currentIndex === idx && (
                <motion.div 
                  layoutId="activeSlideIndicator"
                  className="absolute inset-0 rounded-full"
                  style={{ background: slide.color }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-slate-800 shadow-md hover:bg-slate-900 hover:text-white transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </div>

    </div>
  );
}
