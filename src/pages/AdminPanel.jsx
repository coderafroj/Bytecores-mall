import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout as authLogout } from '../store/authSlice';
import authService from '../appwrite/auth';
import databaseService from '../appwrite/db';
import storageService from '../appwrite/storage';
import { 
  Plus, LayoutDashboard, Package, ShoppingCart, Users, 
  LogOut, Search, Filter, TrendingUp, 
  CheckCircle, Clock, Edit, Trash2, 
  Image as ImageIcon, DollarSign, Tag, Briefcase, ChevronRight, Upload,
  X, Eye, FileText, Printer, Download, ExternalLink, RefreshCcw
} from 'lucide-react';
import { Query } from 'appwrite';

const AdminPanel = () => {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals / Overlays
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0
  });

  const [productForm, setProductForm] = useState({
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
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        databaseService.getProducts([Query.limit(100)]),
        databaseService.databases.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders',
            [Query.limit(100), Query.orderDesc('$createdAt')]
        )
      ]);

      if (prodRes) setProducts(prodRes.documents);
      if (orderRes) setOrders(orderRes.documents);

      const totalSales = orderRes?.documents.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const pending = orderRes?.documents.filter(o => o.status === 'pending').length || 0;

      setStats({
        totalSales,
        totalOrders: orderRes?.total || 0,
        totalProducts: prodRes?.total || 0,
        pendingOrders: pending
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    dispatch(authLogout());
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let finalImageUrl = productForm.imageUrl;

      if (imageFile) {
        const fileResponse = await storageService.uploadFile(imageFile);
        if (fileResponse) {
          finalImageUrl = storageService.getFilePreview(fileResponse.$id).href;
        }
      }

      const productData = {
        ...productForm,
        imageUrl: finalImageUrl,
        price: parseFloat(productForm.price),
        originalPrice: parseFloat(productForm.originalPrice || productForm.price),
        stock: parseInt(productForm.stock),
        rating: parseFloat(productForm.rating),
        reviews: parseInt(productForm.reviews)
      };

      if (editingProduct) {
        await databaseService.updateProduct(editingProduct.$id, productData);
      } else {
        await databaseService.createProduct(productData);
      }

      setShowAddForm(false);
      setEditingProduct(null);
      resetProductForm();
      fetchData();
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Action failed: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
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
    setImageFile(null);
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews
    });
    setShowAddForm(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await databaseService.updateOrderStatus(orderId, newStatus);
      fetchData();
      if (selectedOrder && selectedOrder.$id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await databaseService.deleteProduct(productId);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: 'Analytics' },
    { id: 'products', icon: <Package />, label: 'Inventory' },
    { id: 'orders', icon: <ShoppingCart />, label: 'Sales & Orders' },
    { id: 'customers', icon: <Users />, label: 'User Base' }
  ];

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 gap-6">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-red-500/20 rounded-full" />
            <div className="w-24 h-24 border-4 border-red-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
        <p className="text-red-500 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Initializing Secure Admin Protocol</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Premium Sidebar */}
      <aside className="w-80 bg-slate-950 text-white fixed h-screen overflow-y-auto hidden lg:flex flex-col border-r border-white/5 z-50">
        <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Briefcase size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="font-black text-xl tracking-tight">BYTECORE</h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Dashboard</p>
                </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-black text-red-500 border border-white/10">
                    {user?.name?.[0]}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{user?.name}</p>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Administrator</p>
                </div>
            </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-bold group ${
                activeTab === item.id 
                  ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="text-sm tracking-tight">{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 font-black hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 lg:ml-80 min-h-screen relative">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 flex items-center justify-between z-40">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {sidebarItems.find(i => i.id === activeTab)?.label}
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    <span>Admin</span>
                    <ChevronRight size={10} />
                    <span className="text-red-500">{activeTab}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={fetchData}
                    className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 text-xs font-bold"
                >
                    <RefreshCcw size={16} /> Sync Data
                </button>
                <button 
                    onClick={() => { resetProductForm(); setShowAddForm(true); }}
                    className="bg-slate-950 text-white font-black px-6 py-3 rounded-xl shadow-lg hover:shadow-slate-950/20 transition-all active:scale-95 flex items-center gap-2 text-sm"
                >
                    <Plus size={18} strokeWidth={3} /> Add Product
                </button>
            </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
            {activeTab === 'dashboard' && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Net Revenue', value: `₹${stats.totalSales.toLocaleString()}`, icon: <DollarSign size={24} />, color: 'bg-emerald-500', trend: '+12%', sub: 'vs last month' },
                            { label: 'Active Orders', value: stats.totalOrders, icon: <ShoppingCart size={24} />, color: 'bg-blue-500', trend: '+5%', sub: 'completed' },
                            { label: 'Total Products', value: stats.totalProducts, icon: <Package size={24} />, color: 'bg-violet-500', trend: 'Live', sub: 'in marketplace' },
                            { label: 'Action Items', value: stats.pendingOrders, icon: <Clock size={24} />, color: 'bg-red-500', trend: 'Pending', sub: 'requires attention' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group hover:border-red-500/20 transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
                                        {stat.icon}
                                    </div>
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{stat.trend}</span>
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-2">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Business Activity</h3>
                                <button className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Full Report</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {orders.slice(0, 8).map((order) => (
                                            <tr key={order.$id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center font-black text-xs text-white uppercase">
                                                            {order.userName?.[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm text-slate-900 truncate">{order.userName}</p>
                                                            <p className="text-[10px] text-slate-400 truncate">{order.userEmail}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 font-black text-slate-900">₹{order.total}</td>
                                                <td className="px-8 py-6 text-xs font-bold text-slate-400">
                                                    {new Date(order.$createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <button 
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-950 hover:text-white transition-all"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black tracking-tight mb-2">Inventory Health</h3>
                                <p className="text-slate-500 text-sm font-bold">Quick check on your shop status.</p>
                                
                                <div className="mt-10 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-400">Total Stock</span>
                                        <span className="font-black">1,402 Units</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-400">Low Stock Items</span>
                                        <span className="font-black text-red-500">12 Products</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-400">Categories</span>
                                        <span className="font-black text-emerald-500">8 Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 pt-10 border-t border-white/10">
                                <button className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                    <FileText size={18} /> Download CSV Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 max-w-xl">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name, category or ID..." 
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 font-bold focus:border-red-500 outline-none transition-all shadow-sm" 
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-red-500 transition-all font-bold flex items-center gap-2 shadow-sm">
                                <Filter size={18} /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.$id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                                <div className="aspect-[4/3] bg-[#F8FAFC] relative overflow-hidden">
                                    <img 
                                        src={product.imageUrl || '/placeholder.jpg'} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                        <button 
                                            onClick={() => startEditProduct(product)}
                                            className="w-12 h-12 bg-white text-slate-950 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform -translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-xl"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button 
                                            onClick={() => deleteProduct(product.$id)}
                                            className="w-12 h-12 bg-white text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform -translate-y-4 group-hover:translate-y-0 duration-300 delay-150 shadow-xl"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/80 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-black text-slate-900 text-lg mb-4 truncate">{product.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</p>
                                            <span className="text-xl font-black text-red-500 tracking-tighter">₹{product.price}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</p>
                                            <span className="font-black text-slate-900">{product.stock} Units</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Advanced Add/Edit Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 lg:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white h-full rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {editingProduct ? 'Edit Portfolio Item' : 'New Listing Entry'}
                  </h2>
                  <p className="text-slate-500 font-bold text-sm">Configure product details for the marketplace.</p>
                </div>
                <button 
                  onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
                  className="w-12 h-12 bg-white text-slate-400 rounded-full flex items-center justify-center hover:text-red-500 border border-slate-200 transition-all shadow-sm"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} id="product-form" className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Product Identification</label>
                  <input 
                    type="text" required placeholder="Display Name" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all"
                    value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Current Value (₹)</label>
                        <input 
                            type="number" required placeholder="Offer Price" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all"
                            value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Market Price (₹)</label>
                        <input 
                            type="number" placeholder="MRP" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all"
                            value={productForm.originalPrice} onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Category Branch</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
                            value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})}
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Inventory Count</label>
                        <input 
                            type="number" required placeholder="Units" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold focus:border-red-500 outline-none transition-all"
                            value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Visual Content</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative group overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:border-red-500 transition-all cursor-pointer">
                        <Upload size={32} className="mx-auto text-slate-300 mb-4 group-hover:text-red-500 group-hover:scale-110 transition-all duration-500" />
                        <p className="font-black text-slate-400 text-sm group-hover:text-slate-900">{imageFile ? imageFile.name : 'Drop Media or Click to Upload'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">WEBP, PNG, JPG (Auto-Compressed)</p>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setImageFile(e.target.files[0])} />
                    </div>
                    <div className="relative">
                        <ImageIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="url" placeholder="Direct Image URL Integration" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pl-14 font-bold focus:border-red-500 outline-none transition-all"
                            value={productForm.imageUrl} onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                        />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Descriptive Content</label>
                  <textarea 
                    rows="6" required placeholder="Write a compelling description..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-8 font-bold focus:border-red-500 outline-none transition-all"
                    value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  ></textarea>
                </div>
              </form>

              <div className="p-10 border-t border-slate-100 bg-white">
                <button 
                  form="product-form"
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-slate-950 text-white font-black text-xl py-6 rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70 group"
                >
                  {formLoading ? (
                    <Clock className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={24} className="group-hover:scale-110 transition-transform" />
                      <span>{editingProduct ? 'Commit Changes' : 'Initialize Listing'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* High-Level Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[90vh] lg:h-auto max-h-[90vh]"
            >
              {/* Receipt Area */}
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-100">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">ORDER RECEIPT</h2>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">ID: {selectedOrder.$id}</p>
                    </div>
                    <div className="text-right">
                        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                            selectedOrder.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                            selectedOrder.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                        }`}>
                            {selectedOrder.status}
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-2">{new Date(selectedOrder.$createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</p>
                        <div>
                            <p className="font-black text-lg text-slate-900">{selectedOrder.userName}</p>
                            <p className="font-bold text-slate-500">{selectedOrder.userEmail}</p>
                            <p className="font-bold text-slate-500">{selectedOrder.phone}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping Destination</p>
                        <p className="font-bold text-slate-900 leading-relaxed">{selectedOrder.address}</p>
                    </div>
                </div>

                <div className="space-y-6 mb-12">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Line Items</p>
                    {JSON.parse(selectedOrder.items || '[]').map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-900 text-xs">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm truncate max-w-[200px]">{item.name}</p>
                                    <p className="text-xs font-bold text-slate-400">{item.quantity} × ₹{item.price}</p>
                                </div>
                            </div>
                            <span className="font-black text-slate-900">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-50 p-8 rounded-3xl space-y-4">
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>Cart Subtotal</span>
                        <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>Logistics & Handling</span>
                        <span>{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Transaction</p>
                        <span className="text-3xl font-black text-red-500 tracking-tighter">₹{selectedOrder.total}</span>
                    </div>
                </div>
              </div>

              {/* Action Sidebar */}
              <div className="w-full lg:w-96 bg-slate-50/50 p-12 flex flex-col gap-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Management</h3>
                
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Workflow Status</p>
                    <div className="grid grid-cols-1 gap-2">
                        {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                            <button 
                                key={status}
                                onClick={() => updateOrderStatus(selectedOrder.$id, status)}
                                className={`w-full text-left p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                                    selectedOrder.status === status 
                                    ? 'bg-slate-950 text-white border-slate-950 shadow-xl' 
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-red-200'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                    <button className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                        <Printer size={16} /> Print Invoice
                    </button>
                    <button className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                        <Download size={16} /> Export PDF
                    </button>
                    <button 
                        onClick={() => setSelectedOrder(null)}
                        className="w-full bg-red-500 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                    >
                        Close Portal
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
