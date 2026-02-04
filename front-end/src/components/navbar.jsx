import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Microscope, Bell, User } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Generate", path: "/generate" },
    { name: "Search", path: "/search" },
    { name: "Analytics", path: "/analytics" }
  ];

  const activeIndex = navItems.findIndex(item => 
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => navigate("/")}
        >
          <div className="p-1.5 bg-slate-900 rounded-lg text-white group-hover:bg-emerald-600 transition-colors">
            <Microscope size={20} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            FACT<span className="text-emerald-600">{" "}GENERATOR</span>
          </span>
        </div>

        <ul className="hidden md:flex items-center gap-2">
          {navItems.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
                className="relative px-4 py-2 cursor-pointer text-sm font-bold transition-colors duration-200"
              >
                <span className={isActive ? "text-emerald-600" : "text-slate-500 hover:text-slate-900"}>
                  {item.name}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
            <Bell size={19} />
          </button>
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <User size={18} />
          </div>
        </div>

      </nav>
    </header>
  );
}

export default Navbar;