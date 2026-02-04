import React, { useState, } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Database,
  Activity,
  Clock,
  ArrowRight,
  Microscope,
  ChevronDown,
  LayoutGrid,
  Settings,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DiseaseCard = ({ title, id, pending, active, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl transition-all"
  >
    <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">ID: {id}</p>

    <div className="flex gap-2 mb-6">
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold">
        <Clock size={12} /> {pending} PENDING
      </div>
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
        <Activity size={12} /> {active} ACTIVE
      </div>
    </div>

    <button className="w-full py-3 bg-white border border-emerald-600 text-emerald-600 rounded-full text-sm font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
      Review Pending <ArrowRight size={16} />
    </button>
  </motion.div>
);

export default function KnowledgeBaseHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Diseases");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const allDiseases = ["Rheumatoid Arthritis", "Diabetes Type II", "In Vitro Fertilization", "Lung Cancer"]

  const diseases = [
    { id: "RA_01", title: "Rheumatoid Arthritis", pending: 12, active: "1.2k" },
    { id: "DB_02", title: "Diabetes Type II", pending: 0, active: "5.4k" },
    { id: "IVF_03", title: "In Vitro Fertilization", pending: 4, active: "820" },
    { id: "LC_04", title: "Lung Cancer", pending: 15, active: "3.1k" },
  ];

  const filteredDiseases = diseases.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#fcfcfc] text-slate-900 pt-12">
      <aside className="w-80 bg-white border-r p-6 flex flex-col sticky top-100 h-screen z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <Microscope size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">Fact Generator</span>
        </div>

        <div className="space-y-1 mb-8">
          <label className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-2 block">
            Select Model
          </label>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 border rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Database size={16} className="text-emerald-600" />
                {selectedCategory}
              </div>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border shadow-xl rounded-xl overflow-hidden z-30"
                >
                  <div className="p-2 border-b bg-slate-50">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border rounded-md focus:outline-none"
                        placeholder="Filter list..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {allDiseases.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="space-y-2 mt-auto">
          <button onClick ={ () => navigate("/generate")}className="w-full flex items-center gap-3 p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-medium text-sm">
            <LayoutGrid size={18} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-medium text-sm">
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-12">
        <header className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">
              Knowledge Bases
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Disease Models
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
              <Plus size={16} /> New Model
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredDiseases.map((disease) => (
              <DiseaseCard
                key={disease.id}
                title={disease.title}
                id={disease.id}
                pending={disease.pending}
                active={disease.active}
                onClick={() => navigate(`/diseases/${disease.id}/stages`)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredDiseases.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed">
            <p className="text-slate-400 font-medium">No diseases found matching "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  );
}