import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowLeft, Heart, Monitor, Cpu, Wifi, BookOpen, ShoppingBag, ShieldCheck, Truck, HeadphonesIcon, RotateCcw, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';

const CATS = [
  { name: "Laptops", icon: <Monitor size={32} strokeWidth={1.5} />, path: "/products", img: "https://pngimg.com/uploads/laptop/laptop_PNG59177.png" },
  { name: "Audio", icon: <HeadphonesIcon size={32} strokeWidth={1.5} />, path: "/products", img: "https://pngimg.com/uploads/headphones/headphones_PNG101979.png" },
  { name: "Accessories", icon: <Cpu size={32} strokeWidth={1.5} />, path: "/products", img: "https://pngimg.com/uploads/gamepad/gamepad_PNG74.png" },
];

const TRUST = [
  { icon: <ShieldCheck size={28} />, t: "Secure Checkout", s: "Protected Payments" },
  { icon: <RotateCcw size={28} />, t: "Easy Returns", s: "7 Days Policy" },
  { icon: <Truck size={28} />, t: "Free Delivery", s: "Orders Over ₹999" },
  { icon: <HeadphonesIcon size={28} />, t: "24/7 Support", s: "Expert Tech Help" },
];

const Home = () => {
  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 800], [0, 200]);
  const imageY = useTransform(scrollY, [0, 800], [0, -150]);
  const backgroundY = useTransform(scrollY, [0, 800], [0, 100]);

  return (
    <div className="w-full bg-[#FAFAFA] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#C62828] selection:text-white pb-20 lg:pb-0">
      <Helmet>
        <title>Bytecores Mall | Premium Tech & Essentials</title>
        <meta name="description" content="Discover premium tech, laptops, study kits, and gadgets." />
      </Helmet>
      
      {/* Cinematic Bento Grid Hero */}
      <section className="w-full max-w-[1920px] mx-auto px-4 lg:px-8 pt-28 lg:pt-32 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:gap-6 min-h-[auto] lg:min-h-[750px]">
          
          {/* Main Large Bento Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3 lg:row-span-2 rounded-[2.5rem] lg:rounded-[3.5rem] relative overflow-hidden flex flex-col justify-end p-8 lg:p-16 group min-h-[500px] aurora-bg shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent z-10" />
            
            {/* Dynamic floating elements */}
            <motion.img 
              style={{ y: imageY }}
              src="https://pngimg.com/uploads/macbook/macbook_PNG8.png" 
              alt="Premium Tech" 
              className="absolute right-[-10%] top-[10%] lg:right-[5%] lg:top-1/2 lg:-translate-y-1/2 w-[80%] lg:w-[65%] object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.4)] z-0 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />

            <div className="relative z-20 w-full lg:w-[60%]">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Now
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-[110px] font-black text-white leading-[0.9] tracking-tighter mb-6 drop-shadow-lg">
                Future <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Tech.</span>
              </h1>
              <p className="text-slate-300 text-lg lg:text-xl font-medium mb-10 max-w-md leading-relaxed">
                Experience the pinnacle of innovation. Curated premium gadgets and exclusive tech essentials starting at ₹99.
              </p>
              <Link to="/products" className="btn-premium inline-flex items-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-full font-black text-sm lg:text-base hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all z-20">
                Explore Collection <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>

          {/* Top Right Small Bento Box */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-red-600 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden group min-h-[300px] shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex justify-between items-start">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                <Zap size={28} />
              </div>
              <div className="bg-white text-red-600 font-bold px-3 py-1 rounded-full text-xs">-80%</div>
            </div>
            <div className="relative z-10 mt-auto">
              <h3 className="text-white font-black text-3xl mb-2 tracking-tight">Flash Sale</h3>
              <p className="text-red-100 font-medium text-sm">Grab electronics at unbeatable prices today.</p>
            </div>
          </motion.div>

          {/* Bottom Right Small Bento Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border-2 border-slate-100 rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden group min-h-[300px] shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <div className="relative z-10 flex justify-between items-start">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <ShoppingBag size={28} />
              </div>
            </div>
            
            <img 
              src="https://pngimg.com/uploads/headphones/headphones_PNG101979.png" 
              alt="Audio" 
              className="absolute -right-4 -bottom-4 w-48 object-contain opacity-50 group-hover:opacity-100 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700"
            />

            <div className="relative z-10 mt-auto">
              <h3 className="text-slate-900 font-black text-3xl mb-2 tracking-tight">New Audio</h3>
              <Link to="/products" className="text-red-500 font-bold text-sm hover:text-red-700 flex items-center gap-1">
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Clean Categories Section (Matches image's bottom section) */}
      <section className="py-12 lg:py-20 px-6 lg:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-20 border-b border-slate-100 pb-20">
        <div className="w-full lg:w-1/3 text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-serif text-slate-900 tracking-tight leading-tight mb-6">
                Explore our range of <br/> festive collection
            </h2>
            <p className="text-slate-500 text-sm lg:text-base leading-relaxed mb-8">
                HO HO HO! Merriest time of year is here. Decorate your desk or office with our range of tech utility collection. If you want to make this more fun please explore our range of commodities.
            </p>
            <Link to="/products" className="inline-block bg-[#C62828] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#b71c1c] transition-colors shadow-lg shadow-red-500/20">
                Explore The Range
            </Link>
        </div>
        <div className="w-full lg:w-2/3 flex items-center justify-center">
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                 {CATS.slice(0,3).map((cat, i) => (
                    <Link key={i} to={cat.path} className="group flex flex-col items-center bg-white rounded-[2rem] p-4 lg:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all border border-slate-50">
                        <div className="w-full aspect-square bg-slate-50/80 rounded-2xl mb-4 overflow-hidden p-6 flex items-center justify-center">
                            <motion.img 
                                initial={{ y: 0 }}
                                whileHover={{ y: -10, rotate: 2 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                src={cat.img} 
                                alt={cat.name} 
                                className="w-[85%] h-[85%] object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]" 
                            />
                        </div>
                        <h3 className="text-sm lg:text-base font-bold text-slate-900 tracking-tight uppercase">{cat.name}</h3>
                    </Link>
                 ))}
             </div>
        </div>
      </section>

      {/* Dynamic Products */}
      <section className="py-20 lg:py-32 px-6 lg:px-12 max-w-[1600px] mx-auto bg-[#FAFAFA]">
        <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl lg:text-5xl font-serif text-slate-900 tracking-tight leading-tight mb-4">
                Finish your shopping checklist
            </h2>
            <p className="text-slate-500 text-sm lg:text-base max-w-2xl mx-auto">
                Discover the best items throughout the season, so to save any last-minute dashes, here's our checklist.
            </p>
        </div>

        <div className="-mx-4 lg:mx-0">
            <ProductGrid limit={4} />
        </div>
      </section>

      {/* Modern Newsletter / Trust Banner */}
      <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="bg-slate-50 rounded-[3rem] p-10 lg:p-20 flex flex-col lg:flex-row items-center justify-between border border-slate-100 gap-10">
            <div className="w-full lg:w-1/2">
                <h2 className="text-3xl lg:text-5xl font-serif text-slate-900 tracking-tight mb-4">Let's drop in some <br/> notifications</h2>
            </div>
            
            <div className="flex w-full lg:w-1/2 bg-white rounded-full p-2 shadow-sm border border-slate-200">
                <input type="email" placeholder="Your email address" className="flex-1 bg-transparent border-none outline-none px-6 text-sm text-slate-900 placeholder:text-slate-400" />
                <button className="w-12 h-12 rounded-full bg-[#C62828] text-white flex items-center justify-center hover:bg-[#b71c1c] transition-colors shadow-md">
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
