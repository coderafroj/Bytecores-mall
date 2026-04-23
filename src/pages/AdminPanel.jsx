import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, LayoutDashboard, Package, ShoppingCart, Users, 
  Settings, LogOut, Search, Filter, TrendingUp, 
  CheckCircle, Clock, AlertCircle, Edit, Trash2, 
  Image as ImageIcon, DollarSign, Tag, Briefcase, ChevronRight
} from 'lucide-react';
import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID, ORDERS_COLLECTION_ID } from '../appwrite/config';
import { ID, Query } from 'appwrite';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'electronics',
    description: '',
    imageUrl: '',
    stock: 100,
    rating: 4.5,
    reviews: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID, [Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [Query.limit(100), Query.orderDesc('createdAt')])
      ]);

      setProducts(prodRes.documents);
      setOrders(orderRes.documents);

      const totalSales = orderRes.documents.reduce((sum, order) => sum + (order.total || 0), 0);
      const pending = orderRes.documents.filter(o => o.status === 'pending').length;

      setStats({
        totalSales,
        totalOrders: orderRes.total,
        totalProducts: prodRes.total,
        pendingOrders: pending
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await databases.createDocument(
        DATABASE_ID,
        PRODUCTS_COLLECTION_ID,
        ID.unique(),
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
          originalPrice: parseFloat(newProduct.originalPrice),
          stock: parseInt(newProduct.stock),
          rating: parseFloat(newProduct.rating),
          reviews: parseInt(newProduct.reviews)
        }
      );
      setShowAddForm(false);
      setNewProduct({
        name: '',
        price: '',
        originalPrice: '',
        category: 'electronics',
        description: '',
        imageUrl: '',
        stock: 100,
        rating: 4.5,
        reviews: 0
      });
      fetchData();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await databases.updateDocument(DATABASE_ID, ORDERS_COLLECTION_ID, orderId, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await databases.deleteDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, productId);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { id: 'products', icon: <Package />, label: 'Inventory' },
    { id: 'orders', icon: <ShoppingCart />, label: 'Orders' },
    { id: 'customers', icon: <Users />, label: 'Customers' },
    { id: 'settings', icon: <Settings />, label: 'Settings' }
  ];

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Securely loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 pt-20">
      {/* Professional Sidebar */}
      <aside className="w-80 bg-slate-950 text-white fixed h-[calc(100vh-80px)] overflow-y-auto hidden lg:block border-r border-white/5">
        <div className="p-10 space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 rotate-3">
              <Users size={28} />
            </div>
            <div>
              <h3 className="font-black tracking-tight text-xl leading-none">Admin Hub</h3>
              <p className="text-slate-500 text-xs mt-1 font-bold">Bytecore's Mall v2.0</p>
            </div>
          </div>

          <nav className="space-y-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 font-bold ${
                  activeTab === item.id 
                    ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 translate-x-2' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={16} />}
              </button>
            ))}
          </nav>

          <div className="pt-12 mt-12 border-t border-white/5">
            <button className="flex items-center gap-4 text-red-400 font-black hover:text-red-300 transition-colors">
              <LogOut size={20} /> Logout System
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 p-6 lg:p-12 pb-24">
        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-12 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter">
                  Welcome, <span className="text-red-500">{user?.name?.split(' ')[0]}!</span>
                </h1>
                <p className="text-slate-500 font-bold mt-2 text-lg">Here's a breakdown of your mall's performance today.</p>
              </div>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-black px-10 py-5 rounded-[2rem] shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center gap-3"
              >
                <Plus strokeWidth={4} /> Add New Product
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, icon: <TrendingUp size={28} />, color: 'bg-emerald-500', trend: '+12.5%' },
                { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCart size={28} />, color: 'bg-blue-500', trend: '+5.2%' },
                { label: 'Inventory', value: stats.totalProducts, icon: <Package size={28} />, color: 'bg-indigo-500', trend: 'In Stock' },
                { label: 'Pending', value: stats.pendingOrders, icon: <Clock size={28} />, color: 'bg-red-500', trend: 'Requires Action' }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-500"
                >
                  <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Business Activity</h3>
                <button className="text-red-500 font-bold hover:underline">View All Records</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Customer Info</th>
                      <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Order Details</th>
                      <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.$id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-900">
                              {order.userName?.[0]}
                            </div>
                            <div>
                              <p className="font-black text-slate-900">{order.userName}</p>
                              <p className="text-sm font-bold text-slate-400">{order.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <p className="font-bold text-slate-900 truncate max-w-xs">ID: {order.$id}</p>
                          <p className="text-sm font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                            order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 font-black text-xl text-slate-900">₹{order.total}</td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <button 
                               onClick={() => updateOrderStatus(order.$id, 'completed')}
                               className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                             >
                               <CheckCircle size={20} />
                             </button>
                             <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                               <AlertCircle size={20} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory View */}
        {activeTab === 'products' && (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Product Inventory</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search product..." className="bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold focus:border-red-500 outline-none transition-all w-80 shadow-sm" />
                </div>
                <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-red-500 transition-all shadow-sm">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.$id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group relative">
                  <div className="aspect-square bg-slate-50 rounded-3xl mb-6 overflow-hidden relative">
                    <img src={product.imageUrl || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-contain p-6" />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button className="p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:bg-red-500 hover:text-white transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.$id)}
                        className="p-3 bg-white text-red-500 rounded-2xl shadow-xl hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg mb-1 truncate">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-red-500 tracking-tighter">₹{product.price}</span>
                    <span className="text-xs font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{product.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* High-End Add Product Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-end p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-full rounded-[4rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-12 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Add New Item</h2>
                  <p className="text-slate-500 font-bold">List a new product in the marketplace.</p>
                </div>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="w-14 h-14 bg-slate-50 text-slate-900 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <Plus className="rotate-45" size={24} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Product Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" required placeholder="e.g. Ultra Slim LED Monitor" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 pl-16 font-bold focus:border-red-500 outline-none transition-all"
                      value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Price (₹)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="number" required placeholder="999" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 pl-16 font-bold focus:border-red-500 outline-none transition-all"
                        value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Original Price</label>
                    <div className="relative">
                      <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="number" placeholder="1299" 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 pl-16 font-bold focus:border-red-500 outline-none transition-all"
                        value={newProduct.originalPrice} onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Category Selection</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 font-bold focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
                    value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="electronics">📱 Electronics</option>
                    <option value="fashion">👕 Fashion</option>
                    <option value="home">🏠 Home & Living</option>
                    <option value="beauty">💄 Beauty & Personal Care</option>
                    <option value="sports">⚽ Sports & Outdoors</option>
                    <option value="books">📚 Books & Learning</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Product Image Link</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="url" required placeholder="https://example.com/image.jpg" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 pl-16 font-bold focus:border-red-500 outline-none transition-all"
                      value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest pl-2">Detailed Description</label>
                  <textarea 
                    rows="5" required placeholder="Tell customers about the features and benefits..." 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-8 font-bold focus:border-red-500 outline-none transition-all custom-scrollbar"
                    value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  ></textarea>
                </div>
              </form>

              <div className="p-12 border-t border-slate-50">
                <button 
                  onClick={handleAddProduct}
                  disabled={formLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-2xl py-8 rounded-[3rem] transition-all shadow-2xl shadow-red-500/30 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70"
                >
                  {formLoading ? <Clock className="animate-spin" /> : <Package size={28} strokeWidth={3} />}
                  Add Product to Shop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
