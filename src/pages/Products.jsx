import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search, ChevronRight, X } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';

const Products = ({ addToCart }) => {
  const { category: urlCategory } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');

  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'fashion', name: 'Fashion', icon: '👕' },
    { id: 'home', name: 'Home & Living', icon: '🏠' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'books', name: 'Books', icon: '📚' }
  ];

  useEffect(() => {
    setActiveCategory(urlCategory || 'all');
  }, [urlCategory]);

  const handleCategoryChange = (categoryId) => {
    if (categoryId === 'all') {
      navigate('/products');
    } else {
      navigate(`/products/${categoryId}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-slate-50 pt-32 pb-12"
    >
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-3 text-xl font-black text-slate-900 mb-8 tracking-tighter">
              <Filter className="text-red-500" /> Categories
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all duration-300 ${
                    activeCategory === cat.id 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 translate-x-2' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-red-500'
                  }`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight size={16} className={activeCategory === cat.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-8">
          <header className="bg-white p-6 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">
                {categories.find(c => c.id === activeCategory)?.name || 'Products'}
              </h1>
              <p className="text-slate-500 font-bold">Discover our curated collection of amazing items.</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-colors"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </header>

          <div className="-mx-6 lg:-mx-12">
            <ProductGrid 
              addToCart={addToCart} 
              category={activeCategory === 'all' ? null : activeCategory} 
            />
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default Products;
