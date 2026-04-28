import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, ChevronRight, ShieldCheck, RotateCcw, Shield, Tag, HeadphonesIcon, ShoppingCart, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D';
import ProductGrid from '../components/ProductGrid';

// Fallback high quality emojis to simulate the 3D icons from the mockup
const CATS = [
  { name: "FASHION", emoji: "👕", path: "/products/fashion", active: false },
  { name: "ACCESSORIES", emoji: "👜", path: "/products/fashion", active: false },
  { name: "TOYS", emoji: "🧸", path: "/products", active: false },
  { name: "BOOKS", emoji: "📚", path: "/products", active: false },
  { name: "GADGETS", emoji: "🎧", path: "/products/electronics", active: true },
  { name: "UNDER ₹99", emoji: "💰", path: "/products", active: true },
  { name: "FOOTWEAR", emoji: "👟", path: "/products/fashion", active: false },
  { name: "BEAUTY", emoji: "💄", path: "/products/beauty", active: false },
  { name: "MORE", emoji: "•••", path: "/products", active: false },
];

const TRUST = [
  { icon: <ShieldCheck size={28} />, t: "100% SECURE", t2: "PAYMENT" },
  { icon: <RotateCcw size={28} />, t: "EASY RETURNS", s: "7 Days Return Policy" },
  { icon: <Shield size={28} />, t: "TRUSTED BY", s: "10,000+ Customers" },
  { icon: <Tag size={28} />, t: "LOWEST PRICE", s: "Best Value Guarantee" },
  { icon: <HeadphonesIcon size={28} />, t: "24/7 SUPPORT", s: "We're Here to Help" },
];

const Home = ({ addToCart }) => {
  return (
    <div className="w-full bg-[#f8f9fa] font-['Segoe_UI',Arial,sans-serif]">
      <Helmet>
        <title>Bytecore's Mall | Best Online Shopping in India</title>
        <meta name="description" content="Welcome to Bytecore's Mall - Your ultimate destination for premium electronics, fashion, and home essentials at unbeatable prices. Shop the latest trends today!" />
        <meta name="keywords" content="online shopping, electronics, fashion, home decor, deals, bytecore's mall" />
        <link rel="canonical" href="https://bytecores-mall.vercel.app/" />
      </Helmet>
      
      {/* Hero Section */}
      <Hero3D />

      {/* Mobile App Search Bar (Visible only on mobile) */}
      <div className="lg:hidden px-4 -mt-4 relative z-30">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
             <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search for toys, bottles, decor..." 
            className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Categories Strip */}
      <section className="relative z-20 max-w-[1400px] mx-auto px-4 lg:px-8 mt-8 lg:-mt-8 mb-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] py-6 px-4 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 pb-2">
            {CATS.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="flex flex-col items-center gap-3 min-w-[80px] lg:min-w-[100px] group cursor-pointer"
              >
                <div className={`w-[60px] h-[60px] lg:w-[70px] lg:h-[70px] rounded-full flex items-center justify-center transition-all duration-300 ${
                  cat.active 
                    ? 'bg-red-50 border-2 border-red-200 shadow-sm' 
                    : 'bg-[#f4f6f8] border border-transparent group-hover:bg-red-50 group-hover:border-red-100'
                }`}>
                  <span className={`text-3xl lg:text-4xl ${cat.name === 'MORE' ? 'text-slate-400 font-bold -mt-2' : ''}`}>
                    {cat.emoji}
                  </span>
                </div>
                <span className={`text-[10px] lg:text-[11px] font-black tracking-wide ${cat.active ? 'text-red-600' : 'text-slate-600 group-hover:text-red-600'}`}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip (Solid Red Bar) */}
      <section className="w-full bg-[#cc181e] text-white py-6 shadow-inner">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-y-6 gap-x-4">
            {TRUST.map((b, i) => (
              <div key={i} className="flex items-center gap-3 w-full sm:w-[45%] lg:w-auto">
                <div className="flex-shrink-0">{b.icon}</div>
                <div className="flex flex-col">
                  <div className="font-black text-[12px] lg:text-[13px] tracking-wide leading-tight">{b.t}</div>
                  {b.t2 && <div className="font-black text-[12px] lg:text-[13px] tracking-wide leading-tight">{b.t2}</div>}
                  {b.s && <div className="text-[10px] lg:text-[11px] font-medium opacity-90">{b.s}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEGA DEALS SECTION */}
      <section className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
          <div className="p-8 lg:p-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 animate-pulse">
                Limited Time Offer
              </div>
              <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-none mb-4 font-['Barlow_Condensed',sans-serif]">
                EVERYTHING <span className="text-red-500 italic">ONLY ₹99</span>
              </h2>
              <p className="text-slate-400 font-bold max-w-md">Small items, Big joy! Grab these essentials before they're gone.</p>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-8 bg-white/5 backdrop-blur-md p-6 lg:p-8 rounded-[2.5rem] border border-white/10">
              <div className="flex flex-col items-center">
                <span className="text-3xl lg:text-5xl font-black text-red-500">23</span>
                <span className="text-[10px] font-black uppercase text-slate-400">Hours</span>
              </div>
              <div className="w-[1px] h-12 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl lg:text-5xl font-black text-white">45</span>
                <span className="text-[10px] font-black uppercase text-slate-400">Mins</span>
              </div>
              <div className="w-[1px] h-12 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl lg:text-5xl font-black text-white">12</span>
                <span className="text-[10px] font-black uppercase text-slate-400">Secs</span>
              </div>
            </div>
          </div>

          {/* Special Deal Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 divide-x divide-y divide-slate-50">
            {[
              { name: "Mini Pro Pods", price: 99, img: "🎧", cat: "Electronics" },
              { name: "Sleek Wallet", price: 99, img: "👛", cat: "Fashion" },
              { name: "Smart Band V2", price: 99, img: "⌚", cat: "Gadgets" },
              { name: "Designer Mug", price: 99, img: "☕", cat: "Home" },
              { name: "Toy Car Set", price: 99, img: "🏎️", cat: "Toys" },
              { name: "Perfume Mist", price: 99, img: "🧴", cat: "Beauty" },
              { name: "LED Desk Lamp", price: 99, img: "💡", cat: "Home" },
              { name: "Gaming Mouse", price: 99, img: "🖱️", cat: "Gadgets" },
              { name: "Cookware Mini", price: 99, img: "🍳", cat: "Kitchen" },
              { name: "Story Books", price: 99, img: "📚", cat: "Books" },
              { name: "Soft Plushie", price: 99, img: "🧸", cat: "Toys" },
              { name: "Beauty Kit", price: 99, img: "💄", cat: "Beauty" },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ backgroundColor: "#fff5f5" }}
                className="p-6 lg:p-8 flex flex-col items-center text-center group cursor-pointer transition-colors"
              >
                <div className="text-5xl lg:text-6xl mb-4 group-hover:scale-125 transition-transform duration-500">
                  {item.img}
                </div>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">{item.cat}</span>
                <h4 className="text-sm font-black text-slate-900 mb-4 line-clamp-1 group-hover:text-red-600">{item.name}</h4>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-black text-slate-900">₹99</span>
                  <span className="text-[10px] text-slate-400 line-through">₹499</span>
                </div>
                <button 
                  onClick={() => addToCart({ $id: `deal-${idx}`, name: item.name, price: item.price, category: item.cat, imageUrl: null })}
                  className="mt-6 w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all hover:bg-red-600 shadow-lg"
                >
                  Quick Add
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Deals Grid (Admin Functionality retained) */}
      <section className="w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-16 lg:py-20 bg-[#f8f9fa] relative z-0">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2 font-['Barlow_Condensed',sans-serif]">
              TRENDING <span className="text-[#cc181e]">COLLECTION</span>
            </h2>
            <p className="text-sm lg:text-base text-slate-500 font-medium">Discover our premium range of products at the best market prices.</p>
          </div>
          <Link to="/products" className="group flex items-center gap-2 text-xs lg:text-sm font-black text-slate-900 uppercase tracking-widest hover:text-[#cc181e] transition-colors">
            View All Products
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:bg-[#cc181e] group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={18} />
            </div>
          </Link>
        </div>
        
        <ProductGrid addToCart={addToCart} limit={12} />
      </section>

      {/* WHY CHOOSE US - 3D EXPERIENCE */}
      <section className="w-full py-24 bg-white overflow-hidden relative">
        {/* Subtle geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4 font-['Barlow_Condensed',sans-serif]">
              THE <span className="text-red-600">BYTECORE</span> PROMISE
            </h2>
            <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {[
              { 
                t: "Premium Sourcing", 
                d: "We handpick every item from verified manufacturers to ensure top-tier quality at unbeatable prices.", 
                icon: "💎", 
                color: "bg-blue-600" 
              },
              { 
                t: "Lightning Delivery", 
                d: "Our optimized logistics network ensures your ₹99 treasures reach you in record time, nationwide.", 
                icon: "⚡", 
                color: "bg-amber-500" 
              },
              { 
                t: "10,000+ Happy Souls", 
                d: "Join our growing community of satisfied customers who love our transparent pricing and quality.", 
                icon: "🥰", 
                color: "bg-emerald-600" 
              }
            ].map((box, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -15 }}
                className="group relative p-12 rounded-[4rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden"
              >
                <div className={`w-20 h-20 rounded-[2rem] ${box.color} flex items-center justify-center text-4xl mb-8 shadow-xl shadow-slate-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {box.icon}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{box.t}</h3>
                <p className="text-slate-500 font-bold leading-relaxed text-lg">{box.d}</p>
                
                {/* Decorative 3D elements in background of card */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-200/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPER BARGAIN CORNER - ITEMS UNDER 99 */}
      <section className="w-full bg-[#0a0a0a] py-20 lg:py-32 relative overflow-hidden">
        {/* Animated background elements for depth */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[150px] animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-16 lg:mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full mb-6"
            >
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
              <span className="text-red-500 font-black text-xs uppercase tracking-[0.3em]">Lowest Prices Ever</span>
            </motion.div>
            <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter mb-6 font-['Barlow_Condensed',sans-serif]">
              SUPER <span className="text-red-600">BARGAIN</span> CORNER
            </h2>
            <p className="text-slate-400 font-bold text-lg lg:text-xl max-w-2xl mx-auto italic">Everything here is less than ₹99. Incredible value, limited stock!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { name: "Nekza 500ml Bottle", price: 49, original: 199, img: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-11-03at9.18.09PM.jpg?v=1731398151&width=533", cat: "Essentials", id: "p1" },
              { name: "Buddha Gamla Pot", price: 79, original: 299, img: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-11-03at9.08.48PM_2.jpg?v=1731491751&width=533", cat: "Decor", id: "p2" },
              { name: "Tokyo Multi Tiffin", price: 79, original: 349, img: "https://99martonline.com/cdn/shop/files/Screenshot-2024-11-12-13-38-38-156_com.whatsapp.w4b.jpg?v=1731398983&width=533", cat: "Kitchen", id: "p3" },
              { name: "Khawaish Basket", price: 49, original: 149, img: "https://99martonline.com/cdn/shop/files/Screenshot-2024-11-18-15-06-36-808_com.whatsapp.w4b.jpg?v=1731926520&width=533", cat: "Home", id: "p4" },
              { name: "Steel Sports Bottle", price: 79, original: 499, img: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-12-22at2.30.15PM_1.jpg?v=1734859235&width=533", cat: "Gadgets", id: "p5" },
              { name: "Navigo Smart Tiffin", price: 69, original: 249, img: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-12-23at3.35.17PM.jpg?v=1735031619&width=533", cat: "Kitchen", id: "p6" },
              { name: "Nexon Pro Bottle", price: 59, original: 199, img: "https://99martonline.com/cdn/shop/files/Screenshot-2024-11-12-13-26-38-830_com.whatsapp.w4b.jpg?v=1731398301&width=533", cat: "Sports", id: "p7" },
              { name: "RP Patla Stool", price: 89, original: 399, img: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-11-03at6.10.30PM.jpg?v=1730638462&width=533", cat: "Home", id: "p8" },
            ].map((prod, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -20, rotateY: 10, rotateX: 5 }}
                className="group relative bg-[#1a1a1a] rounded-[3rem] p-8 border border-white/5 shadow-2xl hover:shadow-red-600/20 transition-all duration-500 flex flex-col items-center"
                style={{ perspective: "1000px" }}
              >
                <div className="absolute top-6 right-6 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full z-20 shadow-lg">
                  SALE
                </div>
                
                <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-[#222] mb-8 relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                </div>

                <div className="text-center w-full">
                  <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">{prod.cat}</span>
                  <h3 className="text-white text-xl font-black mb-4 tracking-tight group-hover:text-red-500 transition-colors">{prod.name}</h3>
                  
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <span className="text-4xl font-black text-white tracking-tighter">₹{prod.price}</span>
                    <span className="text-lg text-slate-500 line-through font-bold">₹{prod.original}</span>
                  </div>

                  <button 
                    onClick={() => addToCart({ $id: prod.id, name: prod.name, price: prod.price, category: prod.cat, imageUrl: prod.img })}
                    className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart size={18} strokeWidth={3} />
                    Add To Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link to="/products" className="inline-flex items-center gap-4 text-white font-black uppercase tracking-[0.3em] text-sm hover:text-red-500 transition-all group">
               Explore Full Catalog
               <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600 transition-all">
                  <ChevronRight size={24} />
               </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white pt-16 pb-8">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand col */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-[42px] h-[42px] bg-[#cc181e] rounded-lg flex items-center justify-center font-['Barlow_Condensed',sans-serif] font-black text-[22px] text-white">B</div>
                <div>
                  <div className="font-['Barlow_Condensed',sans-serif] font-black text-[22px] leading-none">
                    <span className="text-white">BYTE</span><span className="text-[#cc181e]">CORE'S</span>
                  </div>
                  <div className="text-[9px] tracking-[0.3em] text-slate-400 font-bold mt-1 uppercase">— MALL —</div>
                </div>
              </div>
              <p className="text-[12px] lg:text-[13px] text-slate-400 leading-relaxed mb-6 font-medium">
                India's #1 value store. Everything at ₹99 — quality products, fast delivery, guaranteed happiness.
              </p>
              
              <div className="flex mb-6 rounded bg-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#cc181e] transition-all">
                <input type="email" placeholder="Enter email..." className="flex-1 bg-transparent border-none text-white px-4 py-2.5 text-xs outline-none" />
                <button className="bg-[#cc181e] text-white px-4 py-2.5 font-black text-[10px] tracking-wider uppercase hover:bg-red-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Links */}
            {[
              { h: "Quick Links", l: ["Home","About Us","Contact","Blog","Careers"] },
              { h: "Categories", l: ["Fashion","Gadgets","Toys","Books","Beauty"] },
              { h: "Support", l: ["Help Center","Track Order","Returns","Privacy","Terms"] }
            ].map(col => (
              <div key={col.h}>
                <h4 className="font-black text-[11px] text-white uppercase tracking-widest mb-5 opacity-90">
                  {col.h}
                </h4>
                <ul className="list-none space-y-3">
                  {col.l.map(li => (
                    <li key={li}>
                      <button className="bg-none border-none text-slate-400 text-[12px] font-medium hover:text-[#cc181e] transition-colors p-0">
                        {li}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-500 font-semibold">© 2026 ByteCore's Mall. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold mr-2">Payments:</span>
              {["💳","🏦","📱","💰","🔐"].map((p, i) => (
                <span key={i} className="bg-[#1a1a1a] border border-slate-800 px-2 py-1 rounded text-xs">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
