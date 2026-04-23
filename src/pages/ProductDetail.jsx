import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Minus, Plus, Truck, Shield, RotateCcw, Award, ChevronLeft } from 'lucide-react';
import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID } from '../appwrite/config';

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await databases.getDocument(
        DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        id
      );
      setProduct(response);
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
    addToCart(product, quantity);
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-8 py-4 rounded-full font-bold shadow-2xl z-[9999] transition-all transform translate-y-0 opacity-100';
    toast.textContent = `Added ${quantity} item${quantity > 1 ? 's' : ''} to cart! 🛒`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
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
            className="relative aspect-square bg-slate-50 rounded-[3rem] overflow-hidden group shadow-2xl"
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
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                {product.name}
              </h1>
              
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
      </div>
    </motion.div>
  );
};

export default ProductDetail;
