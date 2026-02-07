import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar.js";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Generate", path: "/generate" },
    { name: "Analytics", path: "/analytics" }
  ];

  const activeIndex = navItems.findIndex(item =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">

        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="https://www.floccare.ai/assets/images/logo/FlocCarelogo.png"
            alt="FlocCare Logo"
            className="h-12 w-auto object-contain"
          />
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
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <Avatar>
              <AvatarImage src="https://ui-avatars.com/api/?name=user+name" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

      </nav>
    </header>
  );
}

export default Navbar;