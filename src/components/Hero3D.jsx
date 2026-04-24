import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, ShoppingBag, Sparkles } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "PREMIUM FASHION",
    titleLine1: "STYLE",
    titleLine2: "& VIBE",
    subtitle: "Dresses, T-Shirts, Bags & More Accessories",
    price: "₹99",
    color: "#ff004c",
    bgGradient: "linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%)",
    glow: "rgba(255, 0, 76, 0.4)",
    items: [
      { emoji: "👗", label: "Dress", desktop: { x: 0, y: -30, z: 120, scale: 1.8, rotate: -5 }, mobile: { x: 0, y: -60, z: 60, scale: 1.4, rotate: -5 } },
      { emoji: "👕", label: "T-Shirt", desktop: { x: 120, y: 60, z: 80, scale: 1.2, rotate: 15 }, mobile: { x: 70, y: 30, z: 60, scale: 1.1, rotate: 15 } },
      { emoji: "👜", label: "Handbag", desktop: { x: -140, y: -10, z: 40, scale: 1.4, rotate: -10 }, mobile: { x: -80, y: 0, z: 40, scale: 1.2, rotate: -10 } },
      { emoji: "👠", label: "Heels", desktop: { x: 80, y: -90, z: 160, scale: 1.1, rotate: 10 }, mobile: { x: 50, y: -100, z: 100, scale: 0.9, rotate: 10 } },
      { emoji: "🕶️", label: "Glasses", desktop: { x: -100, y: 90, z: 100, scale: 1.3, rotate: -20 }, mobile: { x: -60, y: 80, z: 70, scale: 1, rotate: -20 } },
      { emoji: "💍", label: "Jewelry", desktop: { x: 160, y: -20, z: 90, scale: 1.1, rotate: 5 }, mobile: { x: 90, y: -40, z: 50, scale: 0.8, rotate: 5 } },
    ]
  },
  {
    id: 2,
    title: "GADGET MANIA",
    titleLine1: "SMART",
    titleLine2: "TECH",
    subtitle: "Headphones, Watches, Phones & Gaming Gear",
    price: "₹99",
    color: "#0055ff",
    bgGradient: "linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)",
    glow: "rgba(0, 85, 255, 0.4)",
    items: [
      { emoji: "🎧", label: "Audio", desktop: { x: 10, y: -20, z: 140, scale: 2.0, rotate: 5 }, mobile: { x: 10, y: -50, z: 100, scale: 1.6, rotate: 5 } },
      { emoji: "🎮", label: "Gaming", desktop: { x: -130, y: 40, z: 100, scale: 1.5, rotate: -15 }, mobile: { x: -70, y: 30, z: 70, scale: 1.2, rotate: -15 } },
      { emoji: "⌚", label: "Watch", desktop: { x: 120, y: 80, z: 60, scale: 1.3, rotate: 20 }, mobile: { x: 60, y: 70, z: 50, scale: 1.1, rotate: 20 } },
      { emoji: "📱", label: "Phone", desktop: { x: 140, y: -60, z: 110, scale: 1.4, rotate: 10 }, mobile: { x: 80, y: -40, z: 80, scale: 1.1, rotate: 10 } },
      { emoji: "🖱️", label: "Mouse", desktop: { x: -90, y: -100, z: 80, scale: 1.2, rotate: -5 }, mobile: { x: -60, y: -90, z: 60, scale: 1, rotate: -5 } },
      { emoji: "📷", label: "Camera", desktop: { x: -160, y: -20, z: 70, scale: 1.1, rotate: -10 }, mobile: { x: -90, y: -20, z: 40, scale: 0.9, rotate: -10 } },
    ]
  },
  {
    id: 3,
    title: "HOME ESSENTIALS",
    titleLine1: "COZY",
    titleLine2: "HOME",
    subtitle: "Plants, Decor, Lighting & Daily Utilities",
    price: "₹99",
    color: "#00c366",
    bgGradient: "linear-gradient(135deg, #f0fff5 0%, #e6ffed 100%)",
    glow: "rgba(0, 195, 102, 0.4)",
    items: [
      { emoji: "🪴", label: "Plant", desktop: { x: 0, y: -20, z: 130, scale: 1.9, rotate: -2 }, mobile: { x: 0, y: -50, z: 90, scale: 1.5, rotate: -2 } },
      { emoji: "🛋️", label: "Decor", desktop: { x: -120, y: -80, z: 90, scale: 1.4, rotate: -25 }, mobile: { x: -70, y: -90, z: 70, scale: 1.1, rotate: -25 } },
      { emoji: "🕯️", label: "Aroma", desktop: { x: 130, y: 30, z: 110, scale: 1.5, rotate: 15 }, mobile: { x: 70, y: 20, z: 80, scale: 1.2, rotate: 15 } },
      { emoji: "🖼️", label: "Art", desktop: { x: -90, y: 70, z: 70, scale: 1.2, rotate: -10 }, mobile: { x: -50, y: 60, z: 50, scale: 1, rotate: -10 } },
      { emoji: "☕", label: "Mug", desktop: { x: 110, y: -70, z: 150, scale: 1.3, rotate: 8 }, mobile: { x: 60, y: -70, z: 100, scale: 1, rotate: 8 } },
      { emoji: "🧸", label: "Toys", desktop: { x: -40, y: 120, z: 60, scale: 1.1, rotate: 10 }, mobile: { x: -20, y: 100, z: 40, scale: 0.9, rotate: 10 } },
    ]
  }
];

export default function Hero3D() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
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
      x: direction > 0 ? 200 : -200,
      opacity: 0,
      rotateY: direction > 0 ? 20 : -20,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: { duration: 0.8, type: "spring", bounce: 0.3 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
      rotateY: direction < 0 ? 20 : -20,
      scale: 0.8,
      transition: { duration: 0.5 }
    })
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden font-['Barlow_Condensed',sans-serif] bg-white min-h-[700px] lg:min-h-[800px] flex items-center"
      style={{ perspective: "1500px" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentSlide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
          style={{ background: currentSlide.bgGradient }}
        />
      </AnimatePresence>

      {/* Decorative Text in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none z-0 overflow-hidden">
        <h2 className="text-[20vw] font-black whitespace-nowrap uppercase tracking-tighter">
          {currentSlide.titleLine1} {currentSlide.titleLine2}
        </h2>
      </div>

      <motion.div 
        animate={{ x: mousePos.x * -40, y: mousePos.y * -40 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full blur-[100px] lg:blur-[150px] pointer-events-none z-0"
        style={{ background: currentSlide.glow, opacity: 0.4 }}
      />
      <motion.div 
        animate={{ x: mousePos.x * 30, y: mousePos.y * 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] lg:w-[500px] lg:h-[500px] rounded-full blur-[80px] lg:blur-[130px] pointer-events-none z-0"
        style={{ background: currentSlide.glow, opacity: 0.3 }}
      />

      <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-12 h-full py-16 lg:py-0">
        
        {/* LEFT TEXT CONTENT */}
        <div className="w-full lg:w-[45%] z-20 flex flex-col items-center lg:items-start text-center lg:text-left pt-4 lg:pt-0">
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
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 font-black text-xs uppercase tracking-[0.2em] shadow-lg border-2"
                style={{ background: "#fff", color: currentSlide.color, borderColor: `${currentSlide.color}40` }}
              >
                <Sparkles size={14} className="animate-spin-slow" />
                {currentSlide.title}
              </div>
              
              <h1 className="font-black text-7xl md:text-8xl lg:text-[110px] leading-[0.85] tracking-tighter text-slate-900 mb-4 uppercase drop-shadow-sm">
                {currentSlide.titleLine1} <br/>
                <span style={{ color: currentSlide.color }} className="relative">
                  {currentSlide.titleLine2}
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 h-2 rounded-full opacity-30"
                    style={{ background: currentSlide.color }}
                  />
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 font-medium mb-10 max-w-md font-['Segoe_UI',sans-serif] leading-relaxed">
                {currentSlide.subtitle} — High quality, lowest price guaranteed.
              </p>

              <div className="flex items-center lg:items-end gap-6 mb-12">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Store Price</span>
                  <div className="flex items-center">
                    <span 
                      className="font-black text-[90px] lg:text-[120px] leading-none"
                      style={{ color: currentSlide.color }}
                    >
                      {currentSlide.price}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 pb-4">
                  <span className="line-through text-slate-300 font-black text-2xl tracking-tighter">₹999</span>
                  <span className="bg-green-500 text-white font-black px-3 py-1 rounded-lg text-sm uppercase shadow-md shadow-green-200">90% OFF</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/products" className="group relative overflow-hidden rounded-2xl bg-slate-900 text-white font-black px-10 py-5 uppercase tracking-[0.15em] flex items-center gap-4 transition-all hover:scale-105 shadow-2xl hover:shadow-slate-400/40 justify-center min-w-[200px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <ShoppingBag size={22} strokeWidth={2.5} />
                  Grab Now
                </Link>
                <Link to="/products" className="rounded-2xl bg-white/80 backdrop-blur-md text-slate-900 font-black px-10 py-5 uppercase tracking-[0.15em] flex items-center gap-4 transition-all shadow-xl hover:shadow-2xl border-2 border-white hover:bg-white justify-center min-w-[200px]">
                  Explore
                </Link>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT 3D COLLAGE */}
        <div className="w-full lg:w-[50%] h-[500px] lg:h-[700px] relative z-10 perspective-[2000px] flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`collage-${currentSlide.id}`}
              initial={{ opacity: 0, scale: 0.7, rotateY: direction > 0 ? 60 : -60, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateY: direction > 0 ? -60 : 60, rotateX: -20 }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="relative w-full h-full flex justify-center items-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              
              <div 
                className="absolute w-[250px] h-[250px] lg:w-[450px] lg:h-[450px] rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ 
                  background: currentSlide.color,
                  transform: "translateZ(-100px)",
                }}
              />

              {currentSlide.items.map((item, index) => {
                const pos = isMobile ? item.mobile : item.desktop;
                const parallaxX = !isMobile ? (mousePos.x * pos.z * 0.4) : (mousePos.x * 10);
                const parallaxY = !isMobile ? (mousePos.y * pos.z * 0.4) : (mousePos.y * 10);

                return (
                  <motion.div
                    key={`${currentSlide.id}-item-${index}`}
                    className="absolute flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: pos.y + 150, z: 0 }}
                    animate={{ 
                      opacity: 1, 
                      y: [pos.y, pos.y - 20, pos.y], 
                      x: pos.x + parallaxX,
                      z: pos.z + (mousePos.y * 30),
                      rotate: pos.rotate + (mousePos.x * 5),
                    }}
                    transition={{ 
                      opacity: { duration: 0.6, delay: index * 0.1 },
                      y: { repeat: Infinity, duration: 4 + index * 0.6, ease: "easeInOut" },
                      x: { type: "spring", stiffness: 40, damping: 25 },
                      z: { type: "spring", stiffness: 40, damping: 25 }
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <motion.div 
                      className="relative bg-white rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border-4 border-white flex items-center justify-center overflow-visible group cursor-pointer"
                      style={{ 
                        width: isMobile ? 90 * pos.scale : 120 * pos.scale, 
                        height: isMobile ? 90 * pos.scale : 120 * pos.scale,
                        transformStyle: "preserve-3d"
                      }}
                      whileHover={{ scale: 1.15, rotateY: 20, z: pos.z + 80 }}
                    >
                      <div className="absolute inset-0 rounded-[2rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity" style={{ background: currentSlide.color, transform: "translateZ(-30px)" }}></div>
                      
                      <span 
                        className="select-none"
                        style={{ 
                          fontSize: `${isMobile ? 4 * pos.scale : 5.5 * pos.scale}rem`,
                          transform: "translateZ(50px)",
                          filter: "drop-shadow(0 15px 15px rgba(0,0,0,0.25))"
                        }}
                      >
                        {item.emoji}
                      </span>

                      <div 
                        className="absolute -bottom-4 -right-4 rounded-full text-white font-black tracking-[0.1em] uppercase shadow-xl border-4 border-white scale-90 group-hover:scale-100 transition-transform"
                        style={{ 
                          background: currentSlide.color,
                          fontSize: isMobile ? '0.5rem' : '0.7rem',
                          padding: isMobile ? '5px 12px' : '8px 18px',
                          transform: "translateZ(70px)",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {item.label} • {currentSlide.price}
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
      <div className="absolute bottom-8 lg:bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30 bg-white/80 backdrop-blur-xl px-8 py-4 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] border-2 border-white/60">
        <button 
          onClick={handlePrev}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-slate-800 shadow-md hover:bg-slate-900 hover:text-white transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        
        <div className="flex items-center gap-4">
          {SLIDES.map((slide, idx) => (
            <button 
              key={slide.id}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className="relative h-3 rounded-full transition-all duration-500 overflow-hidden bg-slate-200"
              style={{ width: currentIndex === idx ? 48 : 12 }}
            >
              {currentIndex === idx && (
                <motion.div 
                  layoutId="activeSlideIndicatorPremium"
                  className="absolute inset-0 rounded-full"
                  style={{ background: slide.color }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-slate-800 shadow-md hover:bg-slate-900 hover:text-white transition-all hover:scale-110 active:scale-90"
        >
          <ChevronRight size={24} strokeWidth={3} />
        </button>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

    </div>
  );
}
