import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, TrendingUp, Users, ShoppingBag, Download, Search, Filter, Phone, ExternalLink } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminSalesAnalytics({ orders = [], products = [] }) {
    const [dateRange, setDateRange] = useState('month'); // today, week, month, all
    const [searchQuery, setSearchQuery] = useState('');

    // Date filtering logic
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = startOfToday - (7 * 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        return orders.filter(order => {
            const orderTime = new Date(order.$createdAt).getTime();
            
            const matchesSearch = 
                (order.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (order.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.$id.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (dateRange === 'today') return orderTime >= startOfToday;
            if (dateRange === 'week') return orderTime >= startOfWeek;
            if (dateRange === 'month') return orderTime >= startOfMonth;
            return true;
        });
    }, [orders, dateRange, searchQuery]);

    // Compute Stats & Chart Data
    const { stats, revenueData, paymentData, topItems } = useMemo(() => {
        let totalRevenue = 0;
        let totalCash = 0;
        let totalUPI = 0;
        let totalCard = 0;
        let totalItemsSold = 0;
        
        const customerMap = {};
        const itemSalesMap = {};
        const dailyRevenueMap = {};

        filteredOrders.forEach(order => {
            const orderTotal = order.total || 0;
            totalRevenue += orderTotal;

            if (order.paymentMethod === 'CASH') totalCash += orderTotal;
            else if (order.paymentMethod === 'UPI') totalUPI += orderTotal;
            else if (order.paymentMethod === 'CARD') totalCard += orderTotal;
            else totalCash += orderTotal; // default fallback

            // Daily Revenue Map for Line Chart
            const dateStr = new Date(order.$createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            if (!dailyRevenueMap[dateStr]) dailyRevenueMap[dateStr] = 0;
            dailyRevenueMap[dateStr] += orderTotal;

            // Extract customer info
            const cKey = order.userEmail || 'unknown';
            if (!customerMap[cKey]) {
                customerMap[cKey] = { name: order.userName || 'Walk-in', phone: order.userEmail || 'N/A', totalSpent: 0, orderCount: 0 };
            }
            customerMap[cKey].totalSpent += orderTotal;
            customerMap[cKey].orderCount += 1;

            // Extract items
            try {
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                items.forEach(item => {
                    totalItemsSold += item.quantity;
                    if (!itemSalesMap[item.id]) {
                        itemSalesMap[item.id] = { name: item.name, quantity: 0, revenue: 0 };
                    }
                    itemSalesMap[item.id].quantity += item.quantity;
                    itemSalesMap[item.id].revenue += (item.price * item.quantity);
                });
            } catch (e) {}
        });

        const sortedCustomers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
        const sortedItems = Object.values(itemSalesMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

        // Formatting for charts
        const revChartData = Object.keys(dailyRevenueMap).map(date => ({ date, revenue: dailyRevenueMap[date] }));
        const payChartData = [
            { name: 'Cash', value: totalCash, color: '#F59E0B' },
            { name: 'UPI', value: totalUPI, color: '#3B82F6' },
            { name: 'Card', value: totalCard, color: '#8B5CF6' }
        ].filter(d => d.value > 0);

        return { 
            stats: { totalRevenue, totalCash, totalUPI, totalCard, totalItemsSold, topCustomers: sortedCustomers, totalOrders: filteredOrders.length },
            revenueData: revChartData,
            paymentData: payChartData,
            topItems: sortedItems
        };
    }, [filteredOrders]);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Order ID,Date,Customer,Phone,Amount,Method,IsOffline\n"
            + filteredOrders.map(e => `${e.$id},${new Date(e.$createdAt).toLocaleString('en-IN')},"${e.userName}","${e.userEmail}",${e.total},${e.paymentMethod},${e.isOffline ? 'Yes' : 'No'}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bytecores_sales_${dateRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    {[
                        { id: 'today', label: 'Today' },
                        { id: 'week', label: '7 Days' },
                        { id: 'month', label: 'This Month' },
                        { id: 'all', label: 'All Time' }
                    ].map(dr => (
                        <button 
                            key={dr.id}
                            onClick={() => setDateRange(dr.id)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                dateRange === dr.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                            }`}
                        >
                            {dr.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Customer / Phone" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                        />
                    </div>
                    <button 
                        onClick={handleExport}
                        className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl shadow-xl shadow-slate-950/20 hover:bg-slate-800 transition-all flex items-center gap-2 text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { title: "Total Revenue", val: `₹${stats.totalRevenue.toLocaleString()}`, sub: `${stats.totalOrders} Orders`, icon: <DollarSign />, color: "emerald" },
                    { title: "Cash Collected", val: `₹${stats.totalCash.toLocaleString()}`, sub: "Counter Sales", icon: <BanknoteIcon />, color: "amber" },
                    { title: "Digital Payments", val: `₹${(stats.totalUPI + stats.totalCard).toLocaleString()}`, sub: "UPI / Card", icon: <TrendingUp />, color: "blue" },
                    { title: "Items Sold", val: stats.totalItemsSold, sub: "Total Units", icon: <ShoppingBag />, color: "purple" }
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`bg-${s.color}-50 p-6 rounded-[2rem] border border-${s.color}-100 relative overflow-hidden group`}>
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${s.color}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
                        <div className="relative z-10">
                            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center text-${s.color}-600 mb-4 shadow-sm`}>
                                {s.icon}
                            </div>
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{s.val}</h4>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.title}</p>
                                <p className="text-[9px] font-bold text-slate-400">{s.sub}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Powerful Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Trend Line Chart */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm lg:col-span-2 flex flex-col h-[400px]">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Revenue Trend</h3>
                    <div className="flex-1 w-full min-h-0">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} tickFormatter={(val) => `₹${val}`} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 font-bold">No revenue data for this period</div>
                        )}
                    </div>
                </div>

                {/* Payment Method Split Pie Chart */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Payment Split</h3>
                    <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
                        {stats.totalRevenue > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                        {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value) => [`₹${value}`, 'Amount']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-slate-400 font-bold">No payments</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Items & Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Selling Items Bar Chart */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Top Selling Items</h3>
                    <div className="flex-1 w-full min-h-0">
                        {topItems.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topItems} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" hide />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        formatter={(value) => [`${value} Units`, 'Sold']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="quantity" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} label={{ position: 'right', fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}>
                                        {topItems.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#34d399'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 font-bold">No items sold</div>
                        )}
                    </div>
                    {/* Manual labels overlay for Bar chart since YAxis hide makes them disappear */}
                    {topItems.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {topItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs font-bold text-slate-500">
                                    <span className="truncate pr-4">{idx + 1}. {item.name}</span>
                                    <span className="shrink-0 text-slate-900">{item.quantity} units</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Customers Leaderboard */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Customer Leaderboard</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {stats.topCustomers.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm font-bold py-10">No customer data.</div>
                        ) : (
                            stats.topCustomers.map((cust, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                                            {cust.name[0]?.toUpperCase() || 'W'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-800 truncate uppercase">{cust.name}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mt-1">
                                                <Phone size={10} /> <span className="truncate">{cust.phone === 'pos@bytecores.in' || !cust.phone ? 'No Phone' : cust.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-blue-600 text-lg">₹{cust.totalSpent.toLocaleString()}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cust.orderCount} Orders</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Icon Helper
function BanknoteIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
}
