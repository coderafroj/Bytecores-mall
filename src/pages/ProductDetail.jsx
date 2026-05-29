import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addRecentlyViewed, toggleWishlist } from '../store/wishlistSlice';
import { ShoppingCart, Star, Minus, Plus, Truck, Shield, RotateCcw, Award, ChevronLeft, ZoomIn, X, Heart } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { Helmet } from 'react-helmet-async';
import databaseService from '../appwrite/db';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist?.items || []);
  const recentlyViewed = useSelector(state => state.wishlist?.recentlyViewed || []);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await databaseService.getProduct(id);
      setProduct(response);
      dispatch(addRecentlyViewed(response));
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'minus' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'plus') {
      setQuantity(quantity + 1);
    }
  };

  const onAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white gap-6">
        <h2 className="text-4xl font-black text-slate-900">Product Not Found</h2>
        <Link to="/products" className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black">Back to Shop</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-white pt-32 pb-24"
    >
      <Helmet>
        <title>{product.name} | Bytecores Mall</title>
        <meta name="description" content={`Buy ${product.name} for ₹${product.price} at Bytecores Mall. 100% genuine products.`} />
        <link rel="canonical" href={`https://mall.bytecores.in/product/${product.$id}`} />
        <meta property="og:title" content={`${product.name} | Bytecores Mall`} />
        <meta property="og:description" content={`Buy ${product.name} for ₹${product.price} at Bytecores Mall. 100% genuine products.`} />
        <meta property="og:image" content={product.imageUrl || 'https://mall.bytecores.in/favicon.png'} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": [product.imageUrl || 'https://mall.bytecores.in/favicon.png'],
            "description": product.description || `Buy ${product.name} at Bytecores Mall.`,
            "sku": product.$id,
            "offers": {
              "@type": "Offer",
              "url": `https://mall.bytecores.in/product/${product.$id}`,
              "priceCurrency": "INR",
              "price": product.price,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold mb-12 transition-colors">
          <ChevronLeft size={20} />
          Back to Collections
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-32">
          {/* Product Image */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative aspect-square bg-slate-50 rounded-[3rem] overflow-hidden group shadow-2xl cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
          >
            <img 
              src={product.imageUrl || '/placeholder.jpg'} 
              alt={product.name} 
              className="w-full h-full object-contain p-12 transition-transform duration-700 group-hover:scale-110"
            />
            {product.discount && (
              <div className="absolute top-8 right-8 bg-red-500 text-white px-6 py-2 rounded-full font-black shadow-xl">
                -{product.discount}% OFF
              </div>
            )}
            <div className="absolute bottom-8 right-8 w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 shadow-xl opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <ZoomIn size={24} />
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col gap-10"
          >
            <div>
              <span className="inline-block px-4 py-1.5 bg-red-100 text-red-500 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                {product.category}
              </span>
              <div className="flex justify-between items-start mb-6">
                  <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                    {product.name}
                  </h1>
                  <button 
                      onClick={() => dispatch(toggleWishlist(product))}
                      className={`w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 border ${wishlistItems.some(i => i.$id === product.$id) ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-400 hover:text-red-500 border-slate-200'}`}
                  >
                      <Heart size={24} fill={wishlistItems.some(i => i.$id === product.$id) ? 'currentColor' : 'none'} strokeWidth={wishlistItems.some(i => i.$id === product.$id) ? 0 : 2} />
                  </button>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-slate-400 font-bold border-l-2 border-slate-100 pl-6">
                  {product.reviews || 0} customer reviews
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-6">
              <span className="text-6xl font-black text-slate-900 tracking-tighter">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-3xl text-slate-300 line-through font-bold">₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              {product.description || "Experience the pinnacle of quality with Bytecore's Mall. This premium selection offers unmatched value and style for your everyday needs."}
            </p>

            <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-8">
              <div className="flex items-center gap-8">
                <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Quantity</span>
                <div className="flex items-center bg-white rounded-2xl border-2 border-slate-100 overflow-hidden">
                  <button className="p-4 hover:bg-slate-50 text-slate-900 transition-colors" onClick={() => handleQuantityChange('minus')}>
                    <Minus size={20} strokeWidth={3} />
                  </button>
                  <div className="w-16 text-center font-black text-xl">{quantity}</div>
                  <button className="p-4 hover:bg-slate-50 text-slate-900 transition-colors" onClick={() => handleQuantityChange('plus')}>
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <button 
                onClick={onAddToCart}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-xl py-6 rounded-3xl transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-4 active:scale-95"
              >
                <ShoppingCart size={24} strokeWidth={3} />
                Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <Truck />, label: "Free Delivery" },
                { icon: <RotateCcw />, label: "7 Days Return" },
                { icon: <Shield />, label: "Secure Checkout" },
                { icon: <Award />, label: "Quality Assured" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-900 font-bold">
                  <div className="text-red-500">{item.icon}</div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Algorithm: Recommendation Engine - Related Products */}
        {product.category && (
          <div className="mt-32 pt-16 border-t border-slate-100">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 text-center">
              You Might Also Like
            </h2>
            <p className="text-slate-500 font-bold text-center mb-12">
              Explore more {product.category} products from our premium collection
            </p>
            <div className="-mx-6 lg:-mx-12">
              <ProductGrid category={product.category} limit={4} />
            </div>
          </div>
        )}

        {/* Algorithm: Recently Viewed Items */}
        {recentlyViewed.filter(p => p.$id !== product.$id).length > 0 && (
          <div className="mt-20 pt-16 border-t border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 text-center">
              Recently Viewed
            </h2>
            <p className="text-slate-500 font-bold text-center mb-12">
              Pick up right where you left off
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyViewed.filter(p => p.$id !== product.$id).slice(0, 4).map(item => (
                    <Link to={`/product/${item.$id}`} key={item.$id} className="group bg-white rounded-3xl p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="aspect-square bg-slate-50 rounded-[1.5rem] p-4 mb-4">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 px-2">{item.name}</h3>
                        <p className="text-red-600 font-black px-2 mt-2">₹{item.price}</p>
                    </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-12 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
              className="absolute top-8 right-8 lg:top-12 lg:right-12 w-12 h-12 lg:w-16 lg:h-16 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-2xl z-50"
            >
              <X size={28} />
            </button>
            <motion.img 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              src={product.imageUrl || '/placeholder.jpg'} 
              alt={product.name}
              className="w-full h-full object-contain max-h-[90vh] select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductDetail;
