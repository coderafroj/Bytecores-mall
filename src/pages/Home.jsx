import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import HeroAnimated99 from '../components/HeroAnimated99';

const DEPARTMENTS = [
  { name: "Tech & Laptops", img: "https://pngimg.com/uploads/laptop/laptop_PNG59177.png", path: "/products" },
  { name: "Audio & Music", img: "https://pngimg.com/uploads/headphones/headphones_PNG101979.png", path: "/products" },
  { name: "Smart Watches", img: "https://pngimg.com/uploads/watches/watches_PNG9859.png", path: "/products" },
  { name: "Fashion Bags", img: "https://pngimg.com/uploads/handbag/handbag_PNG8009.png", path: "/products" },
  { name: "Premium Jewelry", img: "https://pngimg.com/uploads/necklace/necklace_PNG68.png", path: "/products" },
  { name: "Home & Kitchen", img: "https://pngimg.com/uploads/teapot/teapot_PNG28.png", path: "/products" },
  { name: "Beauty & Perfume", img: "https://pngimg.com/uploads/perfume/perfume_PNG10287.png", path: "/products" },
  { name: "Accessories", img: "https://pngimg.com/uploads/sunglasses/sunglasses_PNG145.png", path: "/products" }
];

const Home = () => {

  return (
    <div className="w-full bg-[#FAFAFA] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#C62828] selection:text-white pb-20 lg:pb-0">
      <Helmet>
        <title>Bytecores Mall | Premium Tech & Essentials</title>
        <meta name="description" content="Discover premium tech, laptops, study kits, and gadgets." />
      </Helmet>
      
      {/* Animated Video 99-Store Hero */}
      <HeroAnimated99 />

      {/* Blinkit Style Departments Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Shop by Department</h2>
                <Link to="/products" className="text-sm font-bold text-red-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    See All <ArrowRight size={14} />
                </Link>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 lg:gap-6">
                {DEPARTMENTS.map((dept, i) => (
                    <Link key={i} to={dept.path} className="group flex flex-col items-center text-center">
                        <div className="w-full aspect-square bg-[#F8FAFC] rounded-3xl mb-3 overflow-hidden p-4 flex items-center justify-center border border-slate-100 group-hover:border-red-500/30 group-hover:shadow-[0_10px_20px_rgba(239,68,68,0.1)] transition-all">
                            <motion.img 
                                initial={{ scale: 0.9 }}
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                src={dept.img} 
                                alt={dept.name} 
                                className="w-[85%] h-[85%] object-contain drop-shadow-md mix-blend-multiply" 
                            />
                        </div>
                        <h3 className="text-[11px] lg:text-xs font-black text-slate-700 uppercase tracking-tight leading-tight group-hover:text-red-600 transition-colors">
                            {dept.name}
                        </h3>
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
