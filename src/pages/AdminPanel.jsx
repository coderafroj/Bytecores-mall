import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Loader2, 
  Package, 
  Image as ImageIcon,
  Tag,
  DollarSign,
  FileText,
  ChevronRight
} from 'lucide-react';
import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID, ORDERS_COLLECTION_ID } from '../appwrite/config';
import { ID, Query } from 'appwrite';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'electronics',
    imageUrl: '',
    rating: '5',
    reviews: '0'
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        ORDERS_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      setOrders(response.documents);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await databases.createDocument(
        DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        ID.unique(),
        {
          ...productForm,
          price: parseFloat(productForm.price),
          originalPrice: parseFloat(productForm.originalPrice),
          rating: parseFloat(productForm.rating),
          reviews: parseInt(productForm.reviews)
        }
      );
      alert('Product added successfully!');
      setProductForm({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: 'electronics',
        imageUrl: '',
        rating: '5',
        reviews: '0'
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'addProduct', label: 'Add Product', icon: <PlusCircle size={20} /> },
    { id: 'orders', label: 'Manage Orders', icon: <ShoppingBag size={20} /> },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                 {user.name?.[0]?.toUpperCase() || 'A'}
               </div>
               <div>
                 <h3 className="text-lg font-black text-slate-900 leading-none mb-1">Admin Panel</h3>
                 <p className="text-sm font-bold text-slate-500">Welcome back, {user.name || 'Admin'}</p>
               </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all duration-300 ${
                    activeTab === item.id 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 translate-x-2' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-red-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">System Status</h4>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-bold">Appwrite Connected</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Total Revenue', value: '₹1.2M', icon: <TrendingUp className="text-emerald-500" />, color: 'bg-emerald-50' },
                    { label: 'New Orders', value: '842', icon: <ShoppingBag className="text-blue-500" />, color: 'bg-blue-50' },
                    { label: 'Active Users', value: '2.4K', icon: <Users className="text-purple-500" />, color: 'bg-purple-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">{stat.label}</p>
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                      </div>
                      <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                  <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">Performance Overview</h2>
                  <div className="h-[300px] w-full bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 font-bold border-2 border-dashed border-slate-200">
                    Interactive Chart Coming Soon
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'addProduct' && (
              <motion.div
                key="addProduct"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-10 lg:p-14 rounded-[3rem] shadow-sm border border-slate-100"
              >
                <div className="mb-12">
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Add New Product</h2>
                  <p className="text-slate-500 font-bold">List a new item in your store with full details.</p>
                </div>

                <form className="space-y-8" onSubmit={handleProductSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest">
                        <Package size={16} className="text-red-500" /> Product Name
                      </label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                        placeholder="e.g. iPhone 15 Pro Max"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest">
                        <Tag size={16} className="text-red-500" /> Category
                      </label>
                      <select 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all appearance-none"
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      >
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="home">Home & Living</option>
                        <option value="beauty">Beauty</option>
                        <option value="sports">Sports</option>
                        <option value="books">Books</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest">
                        <DollarSign size={16} className="text-red-500" /> Selling Price (₹)
                      </label>
                      <input 
                        type="number" 
                        required 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                        placeholder="999"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest">
                        <DollarSign size={16} className="text-red-500" /> Original Price (₹)
                      </label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                        placeholder="1299"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest">
                        <ImageIcon size={16} className="text-red-500" /> Image URL
                      </label>
                      <input 
                        type="url" 
                        required 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                        placeholder="https://images.unsplash.com/..."
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest">
                        <FileText size={16} className="text-red-500" /> Description
                      </label>
                      <textarea 
                        rows="5"
                        required 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all"
                        placeholder="Describe the product in detail..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-xl py-6 rounded-3xl transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                    <span>Create Product Listing</span>
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Manage Orders</h2>
                  <div className="bg-slate-100 px-6 py-2 rounded-full text-slate-600 font-bold text-sm">
                    {orders.length} Total Orders
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-left">
                        <th className="px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                        <th className="px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                        <th className="px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                        <th className="px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.$id} className="bg-slate-50 rounded-2xl group hover:bg-red-50 transition-colors">
                          <td className="px-6 py-6 font-bold text-slate-400 rounded-l-2xl group-hover:text-red-400">
                            #{order.$id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-6 font-black text-slate-900">{order.userName}</td>
                          <td className="px-6 py-6 font-black text-slate-900">₹{order.total}</td>
                          <td className="px-6 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 font-bold text-slate-500 rounded-r-2xl">
                            {new Date(order.$createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
