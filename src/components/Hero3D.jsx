import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, ShoppingBag, Sparkles, TrendingUp, Zap } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "PREMIUM FASHION",
    titleLine1: "CURATED",
    titleLine2: "STYLE",
    subtitle: "Dresses, T-Shirts, Bags & More Accessories",
    price: "₹99",
    color: "#ff004c",
    bgGradient: "linear-gradient(135deg, #fff0f5 0%, #ffe6f0 100%)",
    glow: "rgba(255, 0, 76, 0.4)",
    mainEmoji: "👗",
    items: [
      { emoji: "👗", label: "Dress", desktop: { x: 0, y: -30, z: 120, scale: 1.8, rotate: -5 }, mobile: { x: 0, y: -30, z: 60, scale: 1.4, rotate: -5 } },
      { emoji: "👕", label: "T-Shirt", desktop: { x: 120, y: 60, z: 80, scale: 1.2, rotate: 15 }, mobile: { x: 60, y: 40, z: 60, scale: 1.1, rotate: 15 } },
      { emoji: "👜", label: "Handbag", desktop: { x: -140, y: -10, z: 40, scale: 1.4, rotate: -10 }, mobile: { x: -60, y: 10, z: 40, scale: 1.2, rotate: -10 } },
    ]
  },
  {
    id: 2,
    title: "GADGET MANIA",
    titleLine1: "ULTRA",
    titleLine2: "TECH",
    subtitle: "Headphones, Watches, Phones & Gaming Gear",
    price: "₹99",
    color: "#0055ff",
    bgGradient: "linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)",
    glow: "rgba(0, 85, 255, 0.4)",
    mainEmoji: "🎧",
    items: [
      { emoji: "🎧", label: "Audio", desktop: { x: 10, y: -20, z: 140, scale: 2.0, rotate: 5 }, mobile: { x: 0, y: -30, z: 100, scale: 1.6, rotate: 5 } },
      { emoji: "🎮", label: "Gaming", desktop: { x: -130, y: 40, z: 100, scale: 1.5, rotate: -15 }, mobile: { x: -60, y: 40, z: 70, scale: 1.2, rotate: -15 } },
      { emoji: "⌚", label: "Watch", desktop: { x: 120, y: 80, z: 60, scale: 1.3, rotate: 20 }, mobile: { x: 60, y: 50, z: 50, scale: 1.1, rotate: 20 } },
    ]
  },
  {
    id: 3,
    title: "HOME ESSENTIALS",
    titleLine1: "MODERN",
    titleLine2: "DECOR",
    subtitle: "Plants, Decor, Lighting & Daily Utilities",
    price: "₹99",
    color: "#00c366",
    bgGradient: "linear-gradient(135deg, #f0fff5 0%, #e6ffed 100%)",
    glow: "rgba(0, 195, 102, 0.4)",
    mainEmoji: "🪴",
    items: [
      { emoji: "🪴", label: "Plant", desktop: { x: 0, y: -20, z: 130, scale: 1.9, rotate: -2 }, mobile: { x: 0, y: -30, z: 90, scale: 1.5, rotate: -2 } },
      { emoji: "🛋️", label: "Decor", desktop: { x: -120, y: -80, z: 90, scale: 1.4, rotate: -25 }, mobile: { x: -60, y: -40, z: 70, scale: 1.1, rotate: -25 } },
      { emoji: "🕯️", label: "Aroma", desktop: { x: 130, y: 30, z: 110, scale: 1.5, rotate: 15 }, mobile: { x: 60, y: 20, z: 80, scale: 1.2, rotate: 15 } },
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

  const currentSlide = SLIDES[currentIndex];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] bg-white min-h-[650px] md:min-h-[750px] lg:min-h-[850px] flex items-center"
      style={{ perspective: "2000px" }}
    >
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

      {/* Decorative Text in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] select-none pointer-events-none z-0 overflow-hidden">
        <h2 className="text-[25vw] font-black whitespace-nowrap uppercase tracking-tighter italic">
            {currentSlide.titleLine2}
        </h2>
      </div>

      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 py-20 lg:py-0">
        
        {/* LEFT TEXT CONTENT */}
        <div className="w-full lg:w-[50%] z-20 flex flex-col items-center lg:items-start text-center lg:text-left">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`text-${currentSlide.id}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full flex flex-col items-center lg:items-start"
            >
              <div 
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full mb-8 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl bg-white border border-slate-100"
                style={{ color: currentSlide.color }}
              >
                <Zap size={14} fill="currentColor" />
                {currentSlide.title}
              </div>
              
              <h1 className="font-black text-6xl md:text-8xl lg:text-[130px] leading-[0.8] tracking-tighter text-slate-900 mb-6 uppercase">
                <span className="block opacity-90">{currentSlide.titleLine1}</span>
                <span style={{ color: currentSlide.color }} className="relative italic">
                  {currentSlide.titleLine2}
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute -bottom-4 left-0 h-3 rounded-full opacity-20"
                    style={{ background: currentSlide.color }}
                  />
                </span>
              </h1>
              
              <p className="text-lg lg:text-2xl text-slate-500 font-bold mb-12 max-w-lg leading-relaxed">
                {currentSlide.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Starting At</span>
                    <span 
                      className="font-black text-7xl lg:text-9xl tracking-tighter leading-none"
                      style={{ color: currentSlide.color }}
                    >
                      {currentSlide.price}
                    </span>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                        <TrendingUp size={12} /> Save 90%
                    </div>
                    <span className="text-2xl font-black text-slate-300 line-through tracking-tighter">₹999</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                <Link to="/products" className="group relative overflow-hidden rounded-[2rem] bg-slate-950 text-white font-black px-12 py-6 uppercase tracking-[0.2em] flex items-center gap-4 transition-all hover:scale-105 shadow-2xl hover:shadow-slate-950/40 justify-center min-w-[240px] text-xs">
                  <ShoppingBag size={20} strokeWidth={3} />
                  Shop The Look
                </Link>
                <Link to="/products" className="rounded-[2rem] bg-white/50 backdrop-blur-md text-slate-900 font-black px-12 py-6 uppercase tracking-[0.2em] flex items-center gap-4 transition-all shadow-xl border-2 border-white/50 hover:bg-white justify-center min-w-[240px] text-xs">
                  Collections
                </Link>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT VISUAL CONTENT */}
        <div className="w-full lg:w-[45%] h-[400px] lg:h-[700px] relative z-10 flex justify-center items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={`visual-${currentSlide.id}`}
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className="relative w-full h-full flex justify-center items-center"
                >
                    {/* Main Focus Object */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-20"
                    >
                        <div 
                            className="absolute inset-0 bg-white/30 rounded-full blur-[100px] -z-10"
                            style={{ background: `${currentSlide.color}30` }}
                        />
                        <span className="text-[12rem] md:text-[18rem] lg:text-[24rem] select-none filter drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]">
                            {currentSlide.mainEmoji}
                        </span>
                        
                        {/* Interactive Floaties */}
                        {currentSlide.items.slice(1).map((item, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-white/80 backdrop-blur-md rounded-[2rem] shadow-2xl border-4 border-white p-6 flex items-center justify-center z-30"
                                style={{ 
                                    width: isMobile ? '80px' : '120px', 
                                    height: isMobile ? '80px' : '120px',
                                    top: i === 0 ? '-10%' : '70%',
                                    left: i === 0 ? '-10%' : '80%',
                                }}
                                animate={{ y: [0, i % 2 === 0 ? 15 : -15, 0] }}
                                transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <span className="text-4xl md:text-6xl">{item.emoji}</span>
                                <div className="absolute -bottom-3 -right-3 px-3 py-1 bg-slate-950 text-white rounded-lg text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg">
                                    {item.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>

      </div>

      {/* Modern Indicators */}
      <div className="absolute bottom-12 lg:bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-12 z-30">
        <div className="flex items-center gap-4">
          {SLIDES.map((slide, idx) => (
            <button 
              key={slide.id}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className="group relative flex flex-col items-center"
            >
              <div className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${currentIndex === idx ? 'w-16 bg-slate-950' : 'w-4 bg-slate-300 group-hover:bg-slate-400'}`}>
                {currentIndex === idx && (
                    <motion.div 
                        layoutId="activeHeroBar"
                        className="h-full bg-slate-950"
                        style={{ background: slide.color }}
                    />
                )}
              </div>
              <span className={`mt-3 text-[10px] font-black uppercase tracking-widest transition-all ${currentIndex === idx ? 'text-slate-900 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>
                0{idx + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
