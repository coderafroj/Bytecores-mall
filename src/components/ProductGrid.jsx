import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowRight, PackageX, Zap } from 'lucide-react';
import databaseService from '../appwrite/db';
import { Query } from 'appwrite';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

const ProductCard = memo(({ product, index, navigate, handleAddToCart }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ delay: (index % 6) * 0.05, duration: 0.5, ease: "easeOut" }}
    className="group relative h-full flex flex-col bg-white rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
  >
    {/* Image Area */}
    <Link to={`/product/${product.$id}`} className="relative aspect-square overflow-hidden bg-slate-50/50 flex items-center justify-center p-6">
      <img 
        src={product.imageUrl || '/placeholder.jpg'} 
        alt={product.name}
        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
      />
        
        {product.originalPrice > product.price && (
            <div className="absolute top-6 left-6 lg:top-10 lg:left-10 bg-red-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-2xl uppercase tracking-tighter z-10 animate-reveal">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Matrix Discount
            </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        <button 
          onClick={(e) => handleAddToCart(e, product)}
          className="absolute bottom-4 right-4 w-12 h-12 lg:w-14 lg:h-14 bg-white/90 backdrop-blur-md text-slate-900 hover:text-white rounded-full flex items-center justify-center shadow-lg border border-white lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300 hover:bg-red-600 active:scale-95 z-30"
        >
          <ShoppingCart size={20} className="lg:w-5 lg:h-5" strokeWidth={2.5} />
        </button>
      </Link>
      
      {/* Information Area */}
      <div className="p-6 lg:p-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{product.category}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
            <Star size={10} className="text-amber-400" fill="currentColor" />
            <span className="text-[11px] font-black text-slate-900">{product.rating || '4.8'}</span>
          </div>
        </div>
        
        <h3 className="text-base lg:text-xl font-black text-slate-900 line-clamp-2 mb-4 tracking-tighter group-hover:text-red-600 transition-colors uppercase leading-tight">
          {product.name}
        </h3>
        
        <div className="mt-auto">
            <div className="flex flex-col mb-8">
                {product.originalPrice > product.price && (
                    <span className="text-[11px] font-bold text-slate-300 line-through mb-1">
                        ₹{product.originalPrice}
                    </span>
                )}
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl lg:text-5xl font-black text-slate-950 tracking-tighter leading-none">
                        ₹{product.price}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INR</span>
                </div>
            </div>

            <Link 
                to={`/product/${product.$id}`}
                className="relative w-full py-3 lg:py-4 bg-slate-950 overflow-hidden text-white text-xs font-black uppercase tracking-widest rounded-xl lg:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-md hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] active:scale-95"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Buy Now</span>
                <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
        </div>
      </div>
  </motion.div>
));

const ProductGrid = ({ category = null, limit = null }) => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queries = [Query.orderDesc('$createdAt')];
      
      if (category && category !== 'all') {
        queries.push(Query.equal('category', category));
      }
      
      if (limit) {
        queries.push(Query.limit(limit));
      } else {
        queries.push(Query.limit(100));
      }

      const response = await databaseService.getProducts(queries);
      
      if (response) {
        setProducts(response.documents);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 lg:bottom-12 right-6 lg:right-12 glass-dark text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl z-[9999] transition-all transform translate-y-0 opacity-100 flex items-center gap-5 border border-white/10 animate-reveal';
    toast.innerHTML = `<div class="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg"><Zap size={18} fill="white" /></div> Object Cached in Cart!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 px-6 lg:px-12 py-12">
        {[...Array(limit || 8)].map((_, i) => (
          <div key={i} className="aspect-[4/6] bg-slate-100 animate-pulse rounded-[3rem]" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center text-center px-6">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-10 animate-pulse">
          <PackageX size={64} />
        </div>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-6 uppercase">Registry Nullified</h3>
        <p className="text-xl text-slate-500 font-bold max-w-sm mx-auto">No objects detected in this sector. Try recalibrating coordinates.</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-12 bg-slate-950 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-red-600 transition-all active:scale-95 shadow-2xl"
        >
          Reset Protocol
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {products.map((product, index) => (
          <ProductCard 
            key={product.$id} 
            product={product} 
            index={index} 
            navigate={navigate} 
            handleAddToCart={handleAddToCart} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
