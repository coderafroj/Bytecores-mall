import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowRight, PackageX, Zap } from 'lucide-react';
import databaseService from '../appwrite/db';
import { Query } from 'appwrite';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

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
    toast.className = 'fixed bottom-24 lg:bottom-12 right-6 lg:right-12 bg-slate-950 text-white px-6 py-4 rounded-3xl font-black shadow-2xl z-[9999] transition-all transform translate-y-0 opacity-100 flex items-center gap-4 border border-white/10 backdrop-blur-xl';
    toast.innerHTML = `<div class="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center"><Zap size={14} fill="white" /></div> Added to cart!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-10 px-6 lg:px-12 py-12">
        {[...Array(limit || 12)].map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-[2rem] lg:rounded-[3rem]" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center text-center px-6">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
          <PackageX size={48} />
        </div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Registry Empty</h3>
        <p className="text-slate-500 font-bold max-w-sm mx-auto">No objects found in this sector. Try exploring other coordinates.</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-10 bg-slate-950 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all active:scale-95 shadow-2xl"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-10">
        {products.map((product, index) => (
          <motion.div
            key={product.$id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: (index % 6) * 0.05, duration: 0.5 }}
            className="group relative bg-white rounded-[2rem] lg:rounded-[3.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-slate-200 transition-all duration-700 border border-slate-100 flex flex-col h-full"
          >
            <div className="flex flex-col h-full">
              {/* Image Section */}
              <Link to={`/product/${product.$id}`} className="relative aspect-[4/5] overflow-hidden bg-slate-50/50 flex items-center justify-center p-6 lg:p-10">
                <img 
                  src={product.imageUrl || '/placeholder.jpg'} 
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                />
                
                {product.originalPrice > product.price && (
                    <div className="absolute top-4 left-4 lg:top-8 lg:left-8 bg-red-600 text-white px-3 py-1 rounded-xl text-[9px] font-black shadow-2xl uppercase tracking-tighter z-10">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                )}
                
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden lg:block" />
                
                <button 
                  onClick={(e) => handleAddToCart(e, product)}
                  className="absolute bottom-6 right-6 w-12 h-12 lg:w-16 lg:h-16 bg-white text-slate-950 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shadow-2xl lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-500 hover:bg-red-600 hover:text-white z-30"
                >
                  <ShoppingCart size={22} strokeWidth={3} />
                </button>
              </Link>
              
              {/* Info Section */}
              <div className="p-6 lg:p-10 bg-white flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{product.category}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-black text-slate-900">{product.rating || '4.5'}</span>
                  </div>
                </div>
                
                <h3 className="text-sm lg:text-xl font-black text-slate-900 line-clamp-1 mb-4 tracking-tighter group-hover:text-red-600 transition-colors uppercase">
                  {product.name}
                </h3>
                
                <div className="mt-auto">
                    <div className="flex flex-col mb-6">
                        {product.originalPrice > product.price && (
                            <span className="text-[10px] font-bold text-slate-300 line-through mb-1">
                                ₹{product.originalPrice}
                            </span>
                        )}
                        <span className="text-2xl lg:text-4xl font-black text-slate-950 tracking-tighter leading-none">
                            ₹{product.price}
                        </span>
                    </div>

                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.preventDefault(); navigate(`/product/${product.$id}`); }}
                        className="w-full py-4 lg:py-5 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-950 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 group/buy shadow-inner"
                    >
                        <span>Inspect</span>
                        <ArrowRight size={14} className="group-hover/buy:translate-x-1 transition-transform" />
                    </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
