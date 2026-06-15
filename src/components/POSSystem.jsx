import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, Printer, PackageX, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import databaseService from '../appwrite/db';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

const POSSystem = ({ products, refreshData }) => {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [discount, setDiscount] = useState(0);

    // Fuse.js for typo-tolerant search
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const fuse = new Fuse(products, { keys: ['name', 'category', '$id'], threshold: 0.3 });
        return fuse.search(searchQuery).map(res => res.item);
    }, [searchQuery, products]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.$id === product.$id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast.error('Not enough stock available!');
                    return prev;
                }
                return prev.map(item => item.$id === product.$id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            if (product.stock <= 0) {
                toast.error('Product is out of stock!');
                return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.$id === id) {
                    const newQ = item.quantity + delta;
                    if (newQ > item.stock) {
                        toast.error('Exceeds available stock!');
                        return item;
                    }
                    return { ...item, quantity: Math.max(1, newQ) };
                }
                return item;
            });
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.$id !== id));
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (filteredProducts.length === 1) {
                addToCart(filteredProducts[0]);
                setSearchQuery('');
            } else if (filteredProducts.length === 0) {
                toast.error('No product found!');
            }
        }
    };

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
    const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            // 1. Create Order
            const orderData = {
                userId: user?.id || 'pos_admin',
                userName: customerName || 'Walk-in Customer',
                userEmail: customerPhone ? `${customerPhone}@pos.local` : (user?.primaryEmailAddress?.emailAddress || 'pos@bytecores.in'),
                address: 'In-Store Purchase',
                shippingAddress: 'In-Store Purchase',
                items: JSON.stringify(cart.map(item => ({
                    id: item.$id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))),
                subtotal,
                shipping: 0,
                total,
                paymentMethod: 'pos_cash',
                status: 'delivered',
                paymentStatus: 'paid'
            };

            const newOrder = await databaseService.createOrder(orderData);

            // 2. Update Stock
            for (const item of cart) {
                await databaseService.updateProduct(item.$id, {
                    ...item,
                    stock: item.stock - item.quantity
                });
            }

            // 3. Prepare Print Data
            setPrintData({
                orderId: newOrder.$id,
                date: new Date().toLocaleString('en-IN'),
                items: cart,
                subtotal,
                discount,
                total,
                customerName: customerName || 'Walk-in Customer',
                customerPhone: customerPhone || 'N/A'
            });

            toast.success('Bill generated successfully!');
            setCart([]);
            setCustomerName('');
            setCustomerPhone('');
            setDiscount(0);
            if (refreshData) refreshData();

            // Trigger print dialog slightly after setting print data
            setTimeout(() => {
                window.print();
                setPrintData(null); // Clear print data after printing
            }, 500);

        } catch (error) {
            console.error('POS Checkout Error:', error);
            toast.error('Failed to process billing.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 pos-container">
            {/* Left Side: Product Grid */}
            <div className="flex-1 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden hide-on-print">
                <div className="p-8 border-b border-slate-50">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                        <input 
                            type="text" 
                            placeholder="Search products by name, SKU, or scan barcode..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-full py-5 pl-16 pr-8 font-black text-lg outline-none transition-all shadow-inner placeholder:text-slate-300"
                        />
                    </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <motion.div 
                                key={product.$id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addToCart(product)}
                                className={`cursor-pointer rounded-[2rem] border-2 transition-all p-4 flex flex-col ${product.stock > 0 ? 'bg-white border-slate-100 hover:border-red-500/50 hover:shadow-xl' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                            >
                                <div className="aspect-square rounded-2xl bg-slate-50 p-4 mb-4 relative overflow-hidden">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                            <span className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">Out of Stock</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-black text-slate-900 leading-tight mb-2 line-clamp-2">{product.name}</h3>
                                <div className="mt-auto flex items-end justify-between">
                                    <span className="font-black text-red-600 text-lg">₹{product.price}</span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Stock: {product.stock}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <PackageX size={64} className="mb-4 opacity-50" />
                            <p className="font-black text-xl uppercase tracking-widest">No Items Found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Bill/Cart */}
            <div className="w-[450px] bg-slate-950 rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden text-white border border-white/5 hide-on-print">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                
                <div className="p-8 border-b border-white/10 relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Current Bill</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{cart.length} items queued</p>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-white/10 relative z-10 flex flex-col gap-3">
                    <input 
                        type="text" 
                        placeholder="Customer Name (Optional)" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone Number (Optional)" 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input 
                            type="number" 
                            placeholder="Discount Amount" 
                            value={discount || ''}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 pl-8 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 relative z-10">
                    <AnimatePresence>
                        {cart.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-white/20">
                                <Printer size={48} className="mb-4" />
                                <p className="font-black uppercase tracking-widest text-xs">Scan or tap to add</p>
                            </motion.div>
                        ) : cart.map(item => (
                            <motion.div 
                                key={item.$id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 backdrop-blur-md"
                            >
                                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <h4 className="font-black text-sm truncate">{item.name}</h4>
                                    <span className="font-black text-red-500">₹{item.price * item.quantity}</span>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <button onClick={() => removeFromCart(item.$id)} className="text-white/30 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
                                        <button onClick={() => updateQuantity(item.$id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-md">
                                            <Minus size={12} />
                                        </button>
                                        <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.$id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-md">
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="p-8 border-t border-white/10 bg-black/20 relative z-10 backdrop-blur-xl">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-300 mb-2">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-sm font-bold text-emerald-400 mb-2">
                                <span>Discount</span>
                                <span>-₹{discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-xl font-black mt-4 pt-4 border-t border-white/10">
                            <span>Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <button 
                        disabled={cart.length === 0 || isProcessing}
                        onClick={handleCheckout}
                        className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Printer size={20} />}
                        {isProcessing ? 'Processing...' : 'Checkout & Print'}
                    </button>
                </div>
            </div>

            {/* Hidden Printable Invoice */}
            {printData && (
                <div id="print-section">
                    <div className="print-receipt">
                        <div className="print-header">
                            <h2>BYTECORES MALL</h2>
                            <p>A Division of ByteCore</p>
                            <p>Nariyawal, Bareilly</p>
                            <div className="print-divider"></div>
                        </div>
                        
                        <div className="print-info">
                            <p>Date: {printData.date}</p>
                            <p>Bill No: {printData.orderId.substring(0, 8).toUpperCase()}</p>
                            <p>Customer: {printData.customerName}</p>
                            {printData.customerPhone !== 'N/A' && <p>Phone: {printData.customerPhone}</p>}
                            <p>Cashier: POS_ADMIN</p>
                        </div>
                        
                        <div className="print-divider"></div>
                        
                        <table className="print-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Amt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {printData.items.map(item => (
                                    <tr key={item.$id}>
                                        <td className="item-name">{item.name.substring(0, 20)}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price}</td>
                                        <td>{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="print-total" style={{ borderTop: '2px dashed #000', paddingTop: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span>Subtotal:</span>
                                <span>₹{printData.subtotal?.toLocaleString()}</span>
                            </div>
                            {printData.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span>Discount:</span>
                                    <span>-₹{printData.discount?.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2em', marginTop: '10px' }}>
                                <span>Total:</span>
                                <span>₹{printData.total.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="print-footer">
                            <p>Thank you for shopping with us!</p>
                            <p>Visit again: mall.bytecores.in</p>
                            <p className="print-barcode">*{printData.orderId.substring(0, 8)}*</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSSystem;
