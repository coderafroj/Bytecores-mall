import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowRight, PackageX } from 'lucide-react';
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
    toast.className = 'fixed bottom-8 right-8 bg-slate-900 text-white px-8 py-4 rounded-full font-black shadow-2xl z-[9999] transition-all transform translate-y-0 opacity-100 flex items-center gap-3 border border-white/10';
    toast.innerHTML = `<span class="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center text-xs">✓</span> Added to cart!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-8 px-4 lg:px-8 py-12">
        {[...Array(limit || 12)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <PackageX size={48} />
        </div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">No Products Found</h3>
        <p className="text-slate-500 font-bold max-w-md mx-auto">
          We couldn't find any products in this category. Check back later or explore other sections!
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-8 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-xl"
        >
          Explore All Items
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-8">
        {products.map((product, index) => (
          <motion.div
            key={product.$id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: (index % 6) * 0.05 }}
            className="group relative bg-white rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 border border-slate-100 flex flex-col h-full"
          >
            <div className="flex flex-col h-full">
              {/* Image Section */}
              <Link to={`/product/${product.$id}`} className="relative aspect-square overflow-hidden bg-[#fdfdfd] flex items-center justify-center p-4 lg:p-8">
                <img 
                  src={product.imageUrl || '/placeholder.jpg'} 
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                />
                
                {product.originalPrice > product.price && (
                  <div className="absolute top-3 left-3 lg:top-5 lg:left-5 bg-red-600 text-white px-2 lg:px-3 py-1 rounded-full text-[8px] lg:text-[10px] font-black shadow-lg uppercase tracking-tighter z-10">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}
                
                <button 
                  onClick={(e) => handleAddToCart(e, product)}
                  className="absolute bottom-4 right-4 w-10 h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-600 hover:text-white z-20"
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                </button>
              </Link>
              
              {/* Info Section */}
              <div className="p-4 lg:p-6 bg-white flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-red-600">{product.category}</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[9px] font-bold text-slate-400">{product.rating || '4.5'}</span>
                  </div>
                </div>
                
                <h3 className="text-sm lg:text-lg font-black text-slate-900 line-clamp-1 mb-2 tracking-tight group-hover:text-red-600 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex flex-col mb-4">
                  {product.originalPrice > product.price && (
                    <span className="text-[10px] lg:text-xs font-bold text-slate-400 line-through leading-none mb-1">
                      ₹{product.originalPrice}
                    </span>
                  )}
                  <span className="text-xl lg:text-3xl font-black text-slate-900 tracking-tighter leading-none">
                    ₹{product.price}
                  </span>
                </div>

                <div className="mt-auto space-y-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleBuyNow(e, product)}
                    className="w-full py-4 bg-slate-900 text-white text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-3 group/buy"
                  >
                    <span>Buy Now</span>
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
