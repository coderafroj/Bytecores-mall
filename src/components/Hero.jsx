import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, ShoppingBag, Zap, Star } from 'lucide-react';
import logo from '../assets/firefly1.png';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Premium Shopping Experience",
      subtitle: "Discover Amazing Deals at Bytecore's Mall",
      cta: "Shop Now",
      gradient: "from-blue-600 to-indigo-700",
      accent: "blue"
    },
    {
      title: "Latest Arrivals",
      subtitle: "Trending Products Just For You",
      cta: "Explore",
      gradient: "from-pink-500 to-rose-600",
      accent: "pink"
    },
    {
      title: "Unbeatable Prices",
      subtitle: "Quality Products at Best Prices",
      cta: "Shop Deals",
      gradient: "from-cyan-500 to-blue-600",
      accent: "cyan"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[90vh] overflow-hidden bg-slate-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient}`}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black rounded-full blur-[120px]" />
          </div>

          <div className="relative h-full max-w-[1920px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold mb-6 border border-white/20"
              >
                <Sparkles size={16} className="text-yellow-400" />
                <span>Special Offers Just for You</span>
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-5xl lg:text-8xl font-black text-white leading-[1.1] mb-6 tracking-tighter"
              >
                {slides[currentSlide].title}
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-white/80 font-medium mb-10 max-w-xl mx-auto lg:mx-0"
              >
                {slides[currentSlide].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link to="/products" className="group bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl">
                  {slides[currentSlide].cta}
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/products" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:bg-white/20">
                  View Collections
                </Link>
              </motion.div>
            </div>

            {/* Visual Element */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-full lg:w-1/2 flex items-center justify-center relative"
            >
              <div className="relative w-[300px] h-[300px] lg:w-[550px] lg:h-[550px] animate-float">
                <div className="w-full h-full rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white/20 rotate-3 transition-transform hover:rotate-0 duration-700">
                  <img src={logo} alt="Bytecore's Mall Premium" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-12">
                     <span className="text-white text-4xl lg:text-5xl font-black tracking-tighter uppercase">Bytecore's Mall</span>
                  </div>
                </div>
                
                {/* Floating Icons */}
                <div className="absolute top-1/4 -left-10 bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30 rotate-12 shadow-2xl">
                  <ShoppingBag className="text-white" size={32} />
                </div>
                <div className="absolute bottom-1/4 -right-10 bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30 -rotate-12 shadow-2xl">
                  <Zap className="text-white" size={32} />
                </div>
                <div className="absolute -top-10 right-1/4 bg-white/20 backdrop-blur-xl p-3 rounded-xl border border-white/30 rotate-45 shadow-2xl">
                  <Star className="text-yellow-400" size={24} fill="currentColor" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide ? 'w-12 h-3 bg-white' : 'w-3 h-3 bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
