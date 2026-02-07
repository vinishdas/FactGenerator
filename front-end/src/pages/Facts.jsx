import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Spinner } from "../components/ui/spinner.js";

function Facts() {
  const { diseaseId, stageId } = useParams();
  const [loading, setLoading] = useState(true);
  const [stageInfo, setStageInfo] = useState({ disease: "", stage: "" });
  const [facts, setFacts] = useState([]);

  // --- NEW STATE FOR FILTERING & SEARCH ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED
  const [sortOrder, setSortOrder] = useState("LATEST"); // LATEST, OLDEST

  const fetchFacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ontology/stages/${stageId}/facts`);
      setStageInfo({
        disease: response.data.disease,
        stage: response.data.stage
      });
      setFacts(response.data.facts);
    } catch (error) {
      console.error("Error fetching facts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacts();
  }, [stageId]);

  const updateFactStatus = async (factId, newStatus) => {
    // Optimistic Update
    const previousFacts = [...facts];
    setFacts(facts.map(f => f.id === factId ? { ...f, status: newStatus } : f));

    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/ontology/facts/${factId}/status`, {
        status: newStatus
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert on failure
      setFacts(previousFacts);
    }
  };

  // --- FILTERING & SORTING LOGIC ---
  const filteredFacts = facts
    .filter((fact) => {
      // 1. Search Filter
      const matchesSearch = fact.text.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status Filter
      const matchesStatus = filterStatus === "ALL" || fact.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // 3. Date Sort
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "LATEST" ? dateB - dateA : dateA - dateB;
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 size={12} /> Approved
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-wider">
            <XCircle size={12} /> Rejected
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider">
            <Clock size={12} /> Pending Audit
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6 mt-12">
        <Spinner size="lg" />
        <p className="text-xs font-bold text-slate-400 animate-pulse tracking-widest uppercase">
          Retrieving Clinical Data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <Link 
            to={`/diseases/${diseaseId}/stages`} 
            className="text-slate-400 text-sm font-bold flex items-center gap-2 hover:text-slate-900 transition-colors w-fit"
          >
            <ChevronLeft size={16} /> Back to Stages
          </Link>
          <div>
             <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    {stageInfo.disease}
                </span>
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {stageInfo.stage}
             </h1>
             <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500"/>
                Audit Interface &bull; {facts.length} Extracted Facts
             </p>
          </div>
        </div>

        {/* --- CONTROLS TOOLBAR --- */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm sticky top-24 z-10">
          
          {/* Search Bar */}
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search facts keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-400 text-sm"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap gap-3 w-full xl:w-auto">
            
            {/* Filter Dropdown */}
            <div className="relative flex-1 min-w-[160px]">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
               <select 
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="w-full pl-11 pr-8 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-sm text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
               >
                 <option value="ALL">All Statuses</option>
                 <option value="PENDING">Pending Only</option>
                 <option value="APPROVED">Approved</option>
                 <option value="REJECTED">Rejected</option>
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown size={12} />
               </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 min-w-[160px]">
               <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
               <select 
                 value={sortOrder}
                 onChange={(e) => setSortOrder(e.target.value)}
                 className="w-full pl-11 pr-8 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-sm text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
               >
                 <option value="LATEST">Latest First</option>
                 <option value="OLDEST">Oldest First</option>
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowUpDown size={12} />
               </div>
            </div>

          </div>
        </div>

        {/* Facts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredFacts.map((fact) => (
              <motion.div
                key={fact.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group"
              >
                {/* Card Header: Status */}
                <div className="p-6 pb-4 flex justify-between items-start">
                   {getStatusBadge(fact.status)}
                   <span className="text-[10px] font-bold text-slate-300">#{fact.id}</span>
                </div>

                {/* Card Body: Text */}
                <div className="px-6 pb-6 flex-1">
                  <p className="text-slate-700 font-medium leading-relaxed text-sm">
                    {fact.text}
                  </p>
                </div>

                {/* Card Footer: Source */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Reference</span>
                    <a 
                        href={fact.source.startsWith('http') ? fact.source : `https://${fact.source}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                    >
                        OPEN URL <ExternalLink size={10} />
                    </a>
                </div>

                {/* Action Buttons */}
                <div className="bg-slate-50 border-t border-slate-100 p-2 space-y-2">
                    {/* Row 1: Approve / Reject */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => updateFactStatus(fact.id, "APPROVED")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                fact.status === "APPROVED" 
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                                : "bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                            }`}
                        >
                            <CheckCircle2 size={14} /> Approve
                        </button>
                        <button 
                            onClick={() => updateFactStatus(fact.id, "REJECTED")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                fact.status === "REJECTED" 
                                ? "bg-rose-600 text-white shadow-md shadow-rose-200" 
                                : "bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                            }`}
                        >
                            <XCircle size={14} /> Reject
                        </button>
                    </div>

                    {/* Row 2: Pending (Full Width) */}
                    <button 
                        onClick={() => updateFactStatus(fact.id, "PENDING")}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            fact.status === "PENDING"
                            ? "bg-slate-800 text-white shadow-md"
                            : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        }`}
                    >
                        <RotateCcw size={14} /> Reset to Pending
                    </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredFacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">No Facts Found</h3>
                <p className="text-slate-500 text-center max-w-xs">
                    {facts.length === 0 
                       ? "This stage currently has no extracted facts. Use the Generator to add data." 
                       : "No facts match your current search filters."}
                </p>
                {facts.length > 0 && (
                  <button 
                    onClick={() => {setSearchQuery(""); setFilterStatus("ALL");}}
                    className="mt-4 text-emerald-600 font-bold text-sm hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
            </div>
        )}

      </div>
    </div>
  );
}

export default Facts;