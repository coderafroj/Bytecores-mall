import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, User, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ cartCount }) => {
  const location = useLocation();
  const path = location.pathname;

  const NAV_ITEMS = [
    { icon: <Home size={22} />, label: "Home", path: "/" },
    { icon: <Search size={22} />, label: "Search", path: "/products" },
    { icon: <ShoppingBag size={22} />, label: "Cart", path: "/cart", count: cartCount },
    { icon: <Grid size={22} />, label: "Categories", path: "/products" },
    { icon: <User size={22} />, label: "Account", path: "/profile" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-2 py-2 z-[6000] shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = path === item.path;
          return (
            <Link 
              key={item.label}
              to={item.path}
              className="relative flex flex-col items-center gap-1 p-2 transition-all duration-300"
            >
              <motion.div 
                animate={{ 
                  scale: isActive ? 1.2 : 1,
                  color: isActive ? "#ef4444" : "#64748b"
                }}
                className="relative"
              >
                {item.icon}
                {item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {item.count}
                  </span>
                )}
              </motion.div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-red-500' : 'text-slate-400'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="bottomNavDot"
                  className="absolute -top-1 w-1 h-1 bg-red-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
