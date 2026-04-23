import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RotateCcw, Award, ChevronRight } from 'lucide-react';
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
    </div>
  );
};

export default Home;
