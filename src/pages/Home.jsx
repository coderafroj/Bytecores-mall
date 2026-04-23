import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RotateCcw, Award, ChevronRight, Heart } from 'lucide-react';
import logo from '../assets/firefly1.png';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';

const Home = ({ addToCart }) => {
  const categories = [
    { id: 'electronics', name: 'Electronics', icon: '📱', desc: 'Gadgets & Tech', color: 'bg-blue-50' },
    { id: 'fashion', name: 'Fashion', icon: '👕', desc: 'Trending Styles', color: 'bg-pink-50' },
    { id: 'home', name: 'Home & Living', icon: '🏠', desc: 'Decor & Essentials', color: 'bg-cyan-50' },
    { id: 'beauty', name: 'Beauty', icon: '💄', desc: 'Skincare & Makeup', color: 'bg-rose-50' },
    { id: 'sports', name: 'Sports', icon: '⚽', desc: 'Fitness & Outdoor', color: 'bg-emerald-50' },
    { id: 'books', name: 'Books', icon: '📚', desc: 'Read & Learn', color: 'bg-amber-50' }
  ];

  const benefits = [
    { icon: <Truck size={32} />, title: "Free Delivery", desc: "On orders above ₹999" },
    { icon: <ShieldCheck size={32} />, title: "Secure Payment", desc: "100% protected transactions" },
    { icon: <RotateCcw size={32} />, title: "Easy Returns", desc: "7-day return policy" },
    { icon: <Award size={32} />, title: "Quality Products", desc: "Verified sellers only" }
  ];

  return (
    <div className="w-full bg-white">
      <Helmet>
        <title>Bytecore's Mall | Best Online Shopping in India</title>
        <meta name="description" content="Welcome to Bytecore's Mall - Your ultimate destination for premium electronics, fashion, and home essentials at unbeatable prices. Shop the latest trends today!" />
        <meta name="keywords" content="online shopping, electronics, fashion, home decor, deals, bytecore's mall" />
        <link rel="canonical" href="https://bytecores-mall.vercel.app/" />
      </Helmet>
      
      <Hero />
      
      {/* Featured Products */}
      <section className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 py-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4">
              Featured <span className="text-red-500">Products</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium">Discover our handpicked selection of amazing deals at unbeatable prices.</p>
          </div>
          <a href="/products" className="group flex items-center gap-2 text-lg font-black text-slate-900 hover:text-red-500 transition-colors">
            View All Products
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
              <ChevronRight size={20} />
            </div>
          </a>
        </div>
        
        <ProductGrid addToCart={addToCart} limit={12} />
      </section>

      {/* Shop by Category */}
      <section className="w-full bg-slate-50 py-24">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4">
              Shop by <span className="text-red-500">Category</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Explore our wide range of categories tailored to your lifestyle needs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {categories.map((cat, index) => (
              <motion.a
                key={cat.id}
                href={`/products/${cat.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative ${cat.color} p-8 rounded-[2.5rem] text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}
              >
                <div className="text-7xl mb-6 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{cat.name}</h3>
                <p className="text-sm font-bold text-slate-500">{cat.desc}</p>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                   <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500">
                     <ChevronRight size={24} />
                   </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 py-24">
        <div className="bg-slate-950 rounded-[3rem] p-12 lg:p-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] mb-2 rotate-3">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-black text-white">{benefit.title}</h3>
              <p className="text-slate-400 font-medium">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* FAQ Section */}
      <section className="w-full max-w-[1920px] mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4">
            Got <span className="text-red-500">Questions?</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium">Everything you need to know about shopping at Bytecore's Mall.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {[
            { q: "What is the delivery time?", a: "Standard delivery takes 3-5 business days across India. Express shipping is available for select cities." },
            { q: "Do you offer Cash on Delivery?", a: "Yes! We offer COD on all orders below ₹5000 to ensure a risk-free shopping experience." },
            { q: "How can I return a product?", a: "We have a no-questions-asked 7-day return policy. Simply head to your profile or contact support." },
            { q: "Are the products genuine?", a: "Absolutely. We source directly from brands and verified distributors to ensure 100% authenticity." }
          ].map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-red-200 transition-all group"
            >
              <h3 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-4">
                <span className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm font-black">?</span>
                {faq.q}
              </h3>
              <p className="text-lg text-slate-500 font-medium pl-14">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full py-24 bg-red-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-4">
              Join the <span className="text-black/30">Bytecore's</span> Club
            </h2>
            <p className="text-xl text-white/80 font-bold">Subscribe to get exclusive early access to our May 1st launch deals!</p>
          </div>
          
          <div className="w-full max-w-xl bg-white p-3 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-transparent px-8 py-5 font-bold text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button className="bg-red-500 hover:bg-black text-white px-10 py-5 rounded-2xl font-black transition-all active:scale-95 whitespace-nowrap">
              Notify Me
            </button>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="w-full bg-white pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
               <span className="text-2xl font-black tracking-tighter uppercase">Bytecore's Mall</span>
            </div>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Your ultimate destination for premium products at unbeatable prices. We believe in quality, style, and value for every customer.
            </p>
          </div>
          
          <div>
            <h4 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4 font-bold text-slate-500">
              <li><a href="/products" className="hover:text-red-500 transition-colors">All Products</a></li>
              <li><a href="/products/electronics" className="hover:text-red-500 transition-colors">Electronics</a></li>
              <li><a href="/products/fashion" className="hover:text-red-500 transition-colors">Fashion</a></li>
              <li><a href="/cart" className="hover:text-red-500 transition-colors">Shopping Cart</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest">Customer Care</h4>
            <ul className="space-y-4 font-bold text-slate-500">
              <li><a href="#" className="hover:text-red-500 transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Return Policy</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4 mb-8">
              {['FB', 'IG', 'TW', 'YT'].map(social => (
                <div key={social} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                  {social}
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-slate-400">© 2026 Bytecore's Mall. All Rights Reserved.</p>
          </div>
        </div>
        
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 pt-12 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-2 text-slate-400 font-bold">
             <Heart size={16} className="text-red-400 fill-red-400" />
             <span>Made with love for our customers</span>
           </div>
           <div className="flex gap-8 text-sm font-black text-slate-400 uppercase tracking-widest">
             <a href="#">Privacy Policy</a>
             <a href="#">Terms of Service</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
