import { useState, memo, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, ShoppingCart, ArrowRight, PackageX, Zap, Heart } from 'lucide-react';
import databaseService from '../appwrite/db';
import { Query } from 'appwrite';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';

const ProductCard = memo(({ product, index, navigate, handleAddToCart, handleToggleWishlist, isWishlisted }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
  <motion.div
    ref={ref}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group relative bg-white rounded-[1.5rem] sm:rounded-3xl p-2 sm:p-3 flex flex-col border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 h-full"
  >
    {/* Image Container */}
    <div className="relative aspect-square w-full rounded-xl sm:rounded-[1.5rem] overflow-hidden bg-slate-50 mb-3 sm:mb-4 cursor-pointer" onClick={() => navigate(`/product/${product.$id}`)}>
      <img 
        src={product.imageUrl || '/placeholder.jpg'} 
        alt={product.name}
        loading="lazy"
        className="w-full h-full object-contain mix-blend-multiply p-3 sm:p-6 transition-transform duration-500 group-hover:scale-110"
      />
      {product.originalPrice > product.price && (
        <span className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">
          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
        </span>
      )}
      <button 
        onClick={(e) => { e.stopPropagation(); handleToggleWishlist(e, product); }}
        className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110 active:scale-95 ${isWishlisted ? 'bg-red-50 text-red-600' : 'bg-white/80 text-slate-400 hover:text-red-500'}`}
      >
        <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={isWishlisted ? 0 : 2} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
        className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm text-slate-900 rounded-full flex items-center justify-center shadow-lg lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white hover:scale-110 active:scale-95"
      >
        <ShoppingCart size={18} strokeWidth={2.5} />
      </button>
    </div>

    {/* Content Container */}
    <div className="px-2 pb-2 flex flex-col flex-1">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{product.category}</p>
        <div className="flex items-center gap-1 text-amber-400 bg-amber-50 px-2 py-0.5 rounded-md">
          <Star size={10} fill="currentColor" />
          <span className="text-[10px] font-black text-amber-600">{product.rating || '4.8'}</span>
        </div>
      </div>
      
      <h3 
        onClick={() => navigate(`/product/${product.$id}`)}
        className="text-sm font-black text-slate-900 line-clamp-2 leading-tight cursor-pointer hover:text-red-600 transition-colors mb-4"
      >
        {product.name}
      </h3>
      
      <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="flex flex-col">
          {product.originalPrice > product.price && (
            <span className="text-[10px] text-slate-400 line-through font-bold">₹{product.originalPrice}</span>
          )}
          <span className="text-lg sm:text-xl font-black text-slate-900 leading-none tracking-tight">₹{product.price}</span>
        </div>
        
        <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.$id}`); }}
            className="px-4 py-2 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-md active:scale-95 flex-shrink-0"
        >
            Buy
        </button>
      </div>
    </div>
  </motion.div>
)});

const ProductGrid = ({ category = null, limit = null, searchQuery = '', sortBy = 'newest' }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist.items);
  const navigate = useNavigate();

  const fetchProducts = async () => {
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
    return response.documents;
  };

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products', category, limit],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
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

  // Algorithm: Fuzzy Filter and Sort
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const fuse = new Fuse(result, {
        keys: ['name', 'category'],
        threshold: 0.3,
      });
      result = fuse.search(searchQuery).map(res => res.item);
    }

    return result.sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-10 px-4 sm:px-6 lg:px-12 py-6 sm:py-12">
        {[...Array(limit || 8)].map((_, i) => (
          <div key={i} className="aspect-[4/6] bg-slate-100 animate-pulse rounded-[1.5rem] sm:rounded-[3rem]" />
        ))}
      </div>
    );
  }

  if (filteredAndSortedProducts.length === 0) {
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
    <div className="w-full px-4 sm:px-6 lg:px-12 py-6 sm:py-12">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-10">
        {filteredAndSortedProducts.map((product, index) => (
          <ProductCard 
            key={product.$id} 
            product={product} 
            index={index} 
            navigate={navigate} 
            handleAddToCart={handleAddToCart}
            handleToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlistItems.some(item => item.$id === product.$id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
