import { useState } from "react";
import { useNavigate } from "react-router-dom"

function Navbar() {
  const [isActive, setIsActive] = useState(0);
  const navigate = useNavigate();

  const navItems = ["Home", "Generate", "Search", "Analytics"]

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-2 py-4">
        <h1 className="text-xl font-semibold text-slate-800">
          <h1 className="text-red-500 text-4xl">Fact Generator</h1>
        </h1>

        <ul className="flex gap-9">
          {navItems.map((item, index) => (
            <li
              key={item}
              onClick={() => {
                setIsActive(index)
                item === "Home" ? navigate("/") : navigate(`/${item.toLowerCase()}`)
              }}
              className={`cursor-pointer text-sm font-medium transition-colors duration-200
                ${isActive === index
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-slate-600 hover:text-blue-500"
                }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
