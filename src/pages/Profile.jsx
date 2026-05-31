import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, Settings, LogOut, ChevronRight, 
  ShoppingBag, MapPin, Shield,
  CheckCircle, ArrowLeft, Loader2, Save, Download, Heart, Headset
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import databaseService from '../appwrite/db';
import { Query } from 'appwrite';
import { Helmet } from 'react-helmet-async';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Profile = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('main'); // default to amazon-style grid
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
      return;
    }
    if (user) {
      setProfileData({
        name: user.fullName || '',
        phone: user.unsafeMetadata?.phone || '',
        address: user.unsafeMetadata?.address || '',
        city: user.unsafeMetadata?.city || '',
        pincode: user.unsafeMetadata?.pincode || ''
      });
      fetchUserOrders(user.primaryEmailAddress?.emailAddress);
    }
  }, [user, isLoaded, isSignedIn, navigate]);

  const fetchUserOrders = async (email) => {
    if (!email) return;
    try {
      setLoading(true);
      const res = await databaseService.databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders',
        [
          Query.equal('userEmail', email),
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]
      );
      if (res) setOrders(res.documents);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          pincode: profileData.pincode
        }
      });
      showToast("Profile Updated Successfully!");
    } catch (error) {
      showToast("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generatePDF = async (order) => {
    const receiptElement = document.getElementById(`receipt-${order.$id}`);
    if (!receiptElement) return;

    try {
      showToast("Generating Receipt...", "success");
      receiptElement.style.display = 'block';
      const canvas = await html2canvas(receiptElement, { scale: 2 });
      receiptElement.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Bytecores_Receipt_${order.$id}.pdf`);
      showToast("Receipt Downloaded Successfully!");
    } catch (err) {
      console.error("PDF Gen Error:", err);
      showToast("Failed to generate receipt.", "error");
    }
  };

  if (!user) return null;

  const userName = user.fullName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';

  const ACCOUNT_CARDS = [
    { id: 'orders', icon: <Package size={32} className="text-[#C62828]" />, title: 'Your Orders', desc: 'Track, return, or buy things again' },
    { id: 'security', icon: <Shield size={32} className="text-[#C62828]" />, title: 'Login & Security', desc: 'Edit login, name, and mobile number' },
    { id: 'address', icon: <MapPin size={32} className="text-[#C62828]" />, title: 'Your Addresses', desc: 'Edit addresses for orders' },
    { id: 'wishlist', icon: <Heart size={32} className="text-[#C62828]" />, title: 'Your Wishlist', desc: 'View saved items for later' },
    { id: 'contact', icon: <Headset size={32} className="text-[#C62828]" />, title: 'Contact Us', desc: 'Contact our customer service' },
    { id: 'logout', icon: <LogOut size={32} className="text-slate-400" />, title: 'Sign Out', desc: 'Securely log out of your account' },
  ];

  const handleCardClick = (id) => {
    if (id === 'logout') {
        handleLogout();
    } else if (id === 'contact') {
        navigate('/contact');
    } else {
        setActiveTab(id);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-24 lg:pt-32">
      <Helmet>
        <title>Your Account | Bytecores Mall</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Breadcrumb / Back Navigation */}
        {activeTab !== 'main' && (
            <button 
                onClick={() => setActiveTab('main')}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#C62828] transition-colors mb-6"
            >
                <ArrowLeft size={16} /> Your Account
            </button>
        )}

        {/* Main Grid View */}
        {activeTab === 'main' && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight">Your Account</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {ACCOUNT_CARDS.map((card) => (
                        <div 
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className="p-6 rounded-2xl border-2 border-slate-100 hover:border-[#C62828]/20 bg-white hover:bg-slate-50 cursor-pointer transition-all flex items-start gap-4 group"
                        >
                            <div className="mt-1">{card.icon}</div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#C62828] transition-colors">{card.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{card.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}

        {/* Sub Pages */}
        <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h1 className="text-3xl font-serif text-slate-900 tracking-tight mb-8">Your Orders</h1>
                    
                    {loading ? (
                        <div className="space-y-4">
                            {[1,2].map(i => <div key={i} className="h-32 bg-slate-50 border border-slate-100 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.$id} className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 p-4 border-b-2 border-slate-100 flex flex-wrap gap-6 items-center justify-between text-sm">
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Order Placed</p>
                                                <p className="font-bold text-slate-900">{new Date(order.$createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Total</p>
                                                <p className="font-bold text-slate-900">₹{order.total}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Ship To</p>
                                                <p className="font-bold text-[#C62828] cursor-pointer hover:underline">{userName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Order # {order.$id.slice(-12).toUpperCase()}</p>
                                            <button onClick={() => generatePDF(order)} className="font-bold text-[#C62828] hover:underline flex items-center justify-end gap-1 mt-1">
                                                <Download size={14} /> Invoice
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white">
                                        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                                            {order.status === 'delivered' ? <CheckCircle className="text-emerald-500" size={20} /> : <Package className="text-amber-500" size={20} />}
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </h3>
                                        {/* Order Items */}
                                        <div className="space-y-4">
                                            {JSON.parse(order.items || '[]').map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg shrink-0 flex items-center justify-center text-slate-300">
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <Link to={`/product/${item.id}`} className="font-bold text-slate-900 hover:text-[#C62828] hover:underline line-clamp-1">{item.name}</Link>
                                                        <p className="text-sm text-slate-500">Qty: {item.quantity} <span className="mx-2">|</span> ₹{item.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hidden PDF Template */}
                                    <div id={`receipt-${order.$id}`} style={{ display: 'none', padding: '40px', backgroundColor: 'white', color: 'black', width: '800px' }}>
                                        <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>BYTECORES MALL</h1>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '40px' }}>Official Transaction Receipt</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                            <div>
                                                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>BILLED TO:</p>
                                                <p style={{ fontSize: '16px', fontWeight: '900' }}>{order.userName}</p>
                                                <p style={{ fontSize: '14px', color: '#64748b' }}>{order.userEmail}</p>
                                                <p style={{ fontSize: '14px', color: '#64748b' }}>{order.address}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>ORDER DETAILS:</p>
                                                <p style={{ fontSize: '14px' }}><strong>ID:</strong> {order.$id}</p>
                                                <p style={{ fontSize: '14px' }}><strong>Date:</strong> {new Date(order.$createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                                    <th style={{ padding: '12px 0', fontSize: '12px', color: '#94a3b8' }}>ITEM</th>
                                                    <th style={{ padding: '12px 0', fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>QTY</th>
                                                    <th style={{ padding: '12px 0', fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>PRICE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {JSON.parse(order.items || '[]').map((item, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '16px 0', fontWeight: 'bold' }}>{item.name}</td>
                                                        <td style={{ padding: '16px 0', textAlign: 'right' }}>{item.quantity}</td>
                                                        <td style={{ padding: '16px 0', textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div style={{ width: '300px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#64748b' }}>
                                                    <span>Subtotal:</span><span>₹{order.subtotal}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#64748b' }}>
                                                    <span>Shipping:</span><span>₹{order.shipping}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '2px solid #f1f5f9', fontWeight: '900', fontSize: '24px' }}>
                                                    <span>TOTAL:</span><span>₹{order.total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                            <Package size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No orders found</h3>
                            <p className="text-slate-500 mb-6">You haven't placed any orders yet.</p>
                            <Link to="/products" className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors">Start Shopping</Link>
                        </div>
                    )}
                </motion.div>
            )}

            {activeTab === 'address' && (
                <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h1 className="text-3xl font-serif text-slate-900 tracking-tight mb-8">Your Addresses</h1>
                    
                    <div className="max-w-2xl bg-white border-2 border-slate-100 rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Default Shipping Address</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Full Name</label>
                                    <input type="text" disabled value={userName} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-bold text-slate-500 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Phone Number</label>
                                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:border-[#C62828] outline-none transition-all" placeholder="10-digit mobile number" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-900">Flat, House no., Building, Company, Apartment</label>
                                <input type="text" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:border-[#C62828] outline-none transition-all" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Town/City</label>
                                    <input type="text" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:border-[#C62828] outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Pincode</label>
                                    <input type="text" value={profileData.pincode} onChange={(e) => setProfileData({...profileData, pincode: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:border-[#C62828] outline-none transition-all" required />
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="bg-[#C62828] text-white px-8 py-3 rounded-full font-bold hover:bg-[#b71c1c] transition-colors flex items-center gap-2 disabled:opacity-70">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Address
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}

            {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h1 className="text-3xl font-serif text-slate-900 tracking-tight mb-8">Login & Security</h1>
                    <div className="max-w-2xl bg-white border-2 border-slate-100 rounded-2xl p-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="font-bold text-slate-900">Name</h3>
                                    <p className="text-slate-500">{userName}</p>
                                </div>
                                <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-100">Edit</button>
                            </div>
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="font-bold text-slate-900">Email</h3>
                                    <p className="text-slate-500">{user.primaryEmailAddress?.emailAddress}</p>
                                </div>
                                <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-100">Edit</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">2-Step Verification</h3>
                                    <p className="text-slate-500">Add an extra layer of security</p>
                                </div>
                                <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-100">Turn On</button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h1 className="text-3xl font-serif text-slate-900 tracking-tight mb-8">Your Wishlist</h1>
                    {wishlistItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlistItems.map((item) => (
                                <div key={item.$id} className="border-2 border-slate-100 rounded-2xl p-4 flex gap-4">
                                    <div className="w-24 h-24 bg-slate-50 rounded-xl shrink-0 p-2">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{item.name}</h3>
                                        <p className="text-[#C62828] font-black">₹{item.price}</p>
                                        <Link to={`/product/${item.$id}`} className="text-xs font-bold text-slate-500 hover:text-[#C62828] hover:underline">View Product</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                            <Heart size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Your wishlist is empty</h3>
                            <Link to="/products" className="text-[#C62828] font-bold hover:underline">Explore products</Link>
                        </div>
                    )}
                </motion.div>
            )}

        </AnimatePresence>

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-24 lg:bottom-12 right-6 px-6 py-3 rounded-xl font-bold shadow-2xl z-[9999] flex items-center gap-3 text-sm ${
                toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}
          >
            <CheckCircle size={18} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
