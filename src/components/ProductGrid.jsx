import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID } from '../appwrite/config';
import { Query } from 'appwrite';

const PROMO_PRODUCTS = [
  { $id: 'p1', name: "Nekza 500ml Bottle", price: 49, originalPrice: 199, imageUrl: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-11-03at9.18.09PM.jpg?v=1731398151&width=533", category: "Essentials", discount: 75 },
  { $id: 'p2', name: "Buddha Gamla Pot", price: 79, originalPrice: 299, imageUrl: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-11-03at9.08.48PM_2.jpg?v=1731491751&width=533", category: "Decor", discount: 70 },
  { $id: 'p3', name: "Tokyo Multi Tiffin", price: 79, originalPrice: 349, imageUrl: "https://99martonline.com/cdn/shop/files/Screenshot-2024-11-12-13-38-38-156_com.whatsapp.w4b.jpg?v=1731398983&width=533", category: "Kitchen", discount: 77 },
  { $id: 'p4', name: "Khawaish Basket", price: 49, originalPrice: 149, imageUrl: "https://99martonline.com/cdn/shop/files/Screenshot-2024-11-18-15-06-36-808_com.whatsapp.w4b.jpg?v=1731926520&width=533", category: "Home", discount: 67 },
  { $id: 'p5', name: "Steel Sports Bottle", price: 79, originalPrice: 499, imageUrl: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-12-22at2.30.15PM_1.jpg?v=1734859235&width=533", category: "Gadgets", discount: 84 },
  { $id: 'p6', name: "Navigo Smart Tiffin", price: 69, originalPrice: 249, imageUrl: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-12-23at3.35.17PM.jpg?v=1735031619&width=533", category: "Kitchen", discount: 72 },
  { $id: 'p7', name: "Nexon Pro Bottle", price: 59, originalPrice: 199, imageUrl: "https://99martonline.com/cdn/shop/files/Screenshot-2024-11-12-13-26-38-830_com.whatsapp.w4b.jpg?v=1731398301&width=533", category: "Sports", discount: 70 },
  { $id: 'p8', name: "RP Patla Stool", price: 89, originalPrice: 399, imageUrl: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-11-03at6.10.30PM.jpg?v=1730638462&width=533", category: "Home", discount: 77 },
  { $id: 'p9', name: "Umbrella Classic", price: 99, originalPrice: 499, imageUrl: "https://99martonline.com/cdn/shop/files/WhatsApp_Image_2024-11-03_at_6.10.35_PM.jpg?v=1730638168&width=533", category: "Essentials", discount: 80 },
  { $id: 'p10', name: "Royal Combo Set", price: 149, originalPrice: 999, imageUrl: "https://99martonline.com/cdn/shop/files/WhatsAppImage2024-12-22at2.30.13PM_2.jpg?v=1734858522&width=533", category: "Home", discount: 85 },
  { $id: 'p11', name: "Square Flowerpot", price: 39, originalPrice: 149, imageUrl: "https://99martonline.com/cdn/shop/files/Screenshot-2024-11-18-15-06-16-834_com.whatsapp.w4b.jpg?v=1731925917&width=533", category: "Decor", discount: 73 },
  { $id: 'p12', name: "Bottle Combo 4pc", price: 99, originalPrice: 599, imageUrl: "https://99martonline.com/cdn/shop/files/Screenshot-2024-11-18-15-04-35-993_com.whatsapp.w4b.jpg?v=1731923723&width=533", category: "Kitchen", discount: 83 },
  { $id: 'p13', name: "7-Piece Breakfast Set", price: 99, originalPrice: 699, imageUrl: "https://m.media-amazon.com/images/I/61SUnz8M6nL._SL1500_.jpg", category: "Kitchen", discount: 85 },
  { $id: 'p14', name: "Radha Krishna Idol", price: 149, originalPrice: 899, imageUrl: "https://m.media-amazon.com/images/I/71zV-i-l2pL._SL1500_.jpg", category: "Decor", discount: 83 },
  { $id: 'p15', name: "Premium Coffee Set", price: 99, originalPrice: 599, imageUrl: "https://m.media-amazon.com/images/I/71R2Hl-N+KL._SL1500_.jpg", category: "Kitchen", discount: 83 },
  { $id: 'p16', name: "Bartan Basket Pro", price: 79, originalPrice: 399, imageUrl: "https://m.media-amazon.com/images/I/61rS-y+mE+L._SL1500_.jpg", category: "Home", discount: 80 },
  { $id: 'p17', name: "Stylish Kurti Collection", price: 149, originalPrice: 999, imageUrl: "https://m.media-amazon.com/images/I/71H2N7B7o-L._SL1500_.jpg", category: "Fashion", discount: 85 },
  { $id: 'p18', name: "Ceramic Mug Set", price: 89, originalPrice: 499, imageUrl: "https://m.media-amazon.com/images/I/61G5m07F81L._SL1500_.jpg", category: "Kitchen", discount: 82 },
  { $id: 'p19', name: "Couple Love Figurine", price: 99, originalPrice: 549, imageUrl: "https://m.media-amazon.com/images/I/71-0G5tZ50L._SL1500_.jpg", category: "Decor", discount: 82 },
  { $id: 'p20', name: "Royal Serving Set", price: 199, originalPrice: 1299, imageUrl: "https://m.media-amazon.com/images/I/61Y0p1+U-DL._SL1500_.jpg", category: "Kitchen", discount: 84 },
];

const ProductGrid = ({ addToCart, category = null, limit = null }) => {
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
      
      if (category) {
        queries.push(Query.equal('category', category));
      }
      
      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        queries
      );
      
      let allProducts = [...response.documents];
      
      if (!category || category === 'all') {
         allProducts = [...PROMO_PRODUCTS, ...allProducts];
      } else {
         const filteredPromo = PROMO_PRODUCTS.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
         allProducts = [...filteredPromo, ...allProducts];
      }

      if (limit) {
        allProducts = allProducts.slice(0, limit);
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(PROMO_PRODUCTS.slice(0, limit || PROMO_PRODUCTS.length));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-8 py-4 rounded-full font-bold shadow-2xl z-[9999] transition-all transform translate-y-0 opacity-100';
    toast.textContent = 'Added to cart! 🛒';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    addToCart(product);
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
                
                {product.discount && (
                  <div className="absolute top-3 left-3 lg:top-5 lg:left-5 bg-red-600 text-white px-2 lg:px-3 py-1 rounded-full text-[8px] lg:text-[10px] font-black shadow-lg uppercase tracking-tighter z-10">
                    -{product.discount}%
                  </div>
                )}
                
                {/* Floating Add to Cart for Quick Action */}
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
                    <span className="text-[9px] font-bold text-slate-400">4.9</span>
                  </div>
                </div>
                
                <h3 className="text-sm lg:text-lg font-black text-slate-900 line-clamp-1 mb-2 tracking-tight group-hover:text-red-600 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex flex-col mb-4">
                  <span className="text-[10px] lg:text-xs font-bold text-slate-400 line-through leading-none mb-1">
                    ₹{product.originalPrice || (product.price * 1.5).toFixed(0)}
                  </span>
                  <span className="text-xl lg:text-3xl font-black text-slate-900 tracking-tighter leading-none">
                    ₹{product.price}
                  </span>
                </div>

                {/* Buttons Container */}
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
