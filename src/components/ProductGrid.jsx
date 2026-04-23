import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID } from '../appwrite/config';
import { Query } from 'appwrite';

const ProductGrid = ({ addToCart, category = null, limit = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      setProducts(response.documents);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
    
    // Show toast notification
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

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 px-6 lg:px-12 py-12">
        {[...Array(limit || 12)].map((_, i) => (
          <div key={i} className="aspect-square bg-slate-200 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 auto-rows-[280px]">
        {products.map((product, index) => {
          // Define a rotation of grid spans for a masonry/collage look
          const spanPatterns = [
            'col-span-1 sm:col-span-2 row-span-2', // Item 1
            'col-span-1 sm:col-span-2 row-span-1', // Item 2
            'col-span-1 sm:col-span-2 row-span-1', // Item 3
            'col-span-1 sm:col-span-2 row-span-1', // Item 4
            'col-span-1 sm:col-span-2 row-span-2', // Item 5
            'col-span-1 sm:col-span-2 row-span-1', // Item 6
          ];
          const gridClass = spanPatterns[index % spanPatterns.length];
          
          return (
            <motion.div
              key={product.$id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`${gridClass} group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500`}
            >
              <Link to={`/product/${product.$id}`} className="absolute inset-0 flex flex-col">
                <div className="relative flex-1 overflow-hidden bg-slate-50">
                  <img 
                    src={product.imageUrl || '/placeholder.jpg'} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.discount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-white/80 backdrop-blur-md">
                  <div className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
                    {product.category}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-red-500 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    
                    <button 
                      className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
