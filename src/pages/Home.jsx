import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowLeft, Heart, Monitor, Cpu, Wifi, BookOpen, ShoppingBag, ShieldCheck, Truck, HeadphonesIcon, RotateCcw } from 'lucide-react';
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
      
      {/* 99 Mall Style E-commerce Hero - Exactly like the reference image */}
      <section className="w-full mx-auto mb-20 lg:mb-32">
        <div className="relative w-full min-h-[100svh] h-auto pb-32 lg:pb-0 lg:min-h-[800px] bg-[#C62828] overflow-hidden flex flex-col pt-28 lg:pt-32">
            
            {/* Subtle background forest/texture (like the image) */}
            <motion.div 
              className="absolute inset-0 w-full h-full opacity-[0.03]" 
              style={{ 
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                y: backgroundY 
              }} 
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full h-full max-w-[1400px] mx-auto px-6 lg:px-20 pb-10">
                
                {/* Left Navigation Arrow (Like image) */}
                <div className="hidden lg:flex items-center gap-4 text-white/50 hover:text-white transition-colors cursor-pointer absolute left-10 top-1/2 -translate-y-1/2 z-30">
                    <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="text-sm font-medium">Previous</span>
                </div>

                {/* Main Content */}
                <motion.div 
                    className="w-full lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left z-20 mt-10 lg:mt-0 relative"
                    style={{ y: textY }}
                >
                    <h2 className="text-white/90 text-xl sm:text-2xl lg:text-3xl font-medium tracking-wide mb-2 lg:mb-0">Mega Shopping Festival</h2>
                    <h1 className="text-6xl sm:text-7xl lg:text-[130px] font-serif italic text-white font-bold tracking-tighter leading-[0.8] mb-8 lg:mb-12 drop-shadow-lg">
                        ₹99 Store
                    </h1>
                    
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        <Link to="/products" className="group flex items-center gap-3 bg-white text-[#C62828] px-8 py-4 lg:px-10 lg:py-5 rounded-full font-bold text-sm lg:text-base hover:shadow-2xl hover:scale-105 transition-all">
                            Shop This Collection
                            <Heart size={18} className="text-[#C62828] group-hover:fill-current transition-colors" />
                        </Link>
                    </div>

                    <div className="mt-12 lg:mt-24 max-w-sm hidden lg:block">
                        <h3 className="text-white text-xl lg:text-2xl font-serif mb-3">Grab the best deals...</h3>
                        <p className="text-white/80 text-sm lg:text-sm font-medium leading-relaxed">
                            Selling from ₹9 to ₹999. Discover premium quality products across all categories, exclusively curated and available for you. Don't miss out!
                        </p>
                    </div>
                </motion.div>

                {/* Center 3D Floating Element (Like the Christmas Tree) */}
                <div className="w-full lg:w-[50%] h-[250px] sm:h-[350px] lg:h-[600px] relative z-20 flex items-center justify-center mt-12 lg:mt-0 lg:absolute lg:right-20 lg:top-1/2 lg:-translate-y-1/2">
                    <motion.img 
                        initial={{ opacity: 0, y: 50, rotate: -5 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ y: imageY }}
                        src="https://pngimg.com/uploads/shopping_cart/shopping_cart_PNG38.png" 
                        alt="99 Mall Shopping" 
                        className="w-[90%] lg:w-full max-w-[700px] h-auto object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.5)]"
                    />
                </div>

                {/* Right Navigation Arrow (Like image) */}
                <div className="hidden lg:flex items-center gap-4 text-white hover:text-white transition-colors cursor-pointer absolute right-10 top-1/2 -translate-y-1/2 z-30">
                    <span className="text-sm font-medium">Next</span>
                    <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center">
                        <ArrowRight size={20} />
                    </div>
                </div>

            </div>
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
