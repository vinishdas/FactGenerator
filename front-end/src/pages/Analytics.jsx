import { useState, useEffect } from "react";
import { motion as _motion , AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ShieldCheck,
  ChevronLeft,
  LayoutGrid,
  Activity,
  ArrowRight,
  TrendingUp,
  XCircle,
  Check,
  Layers,
  Award,
  Filter
} from "lucide-react";
import { useDiseases } from "../hooks/useDisease";
import { useStages } from "../hooks/useStages";
import { Skeleton } from "../components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Spinner } from "../components/ui/spinner.js"

// --- SUB-COMPONENTS ---

// 1. COMPLIANCE DONUT
const ComplianceDonut = ({ pass, fail }) => {
  const total = pass + fail;
  const passPercent = total === 0 ? 0 : (pass / total) * 100;
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const passOffset = circumference - (passPercent / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="50%" cy="50%" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
        {fail > 0 && (
            <circle cx="50%" cy="50%" r={radius} fill="transparent" stroke="#f43f5e" strokeWidth="10" />
        )}
        <circle
          cx="50%" cy="50%" r={radius} fill="transparent" stroke="#10b981" strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={passOffset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black text-slate-800">{Math.round(passPercent)}%</span>
      </div>
    </div>
  );
};

// 2. HEATMAP CELL
const HeatmapCell = ({ label, subLabel, percentage, status }) => {
    const getColor = (s) => (s === "Green" ? "bg-emerald-500" : s === "Amber" ? "bg-amber-500" : "bg-rose-500");
    const getBgColor = (s) => (s === "Green" ? "bg-emerald-50" : s === "Amber" ? "bg-amber-50" : "bg-rose-50");

    return (
        <div className={`p-4 rounded-2xl border border-slate-100 ${getBgColor(status)} flex flex-col justify-between h-32`}>
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-slate-700">{label}</span>
                <div className={`w-2 h-2 rounded-full ${getColor(status)}`}></div>
            </div>
            <div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{subLabel}</h4>
                <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-slate-900">{percentage}%</span>
                    <span className="text-[10px] font-bold text-slate-400 mb-1">cov</span>
                </div>
            </div>
        </div>
    );
};

// 3. MEDICAL CODES WIDGET (Replaces CodeBar)
const MedicalCodesWidget = ({ codes, onClick }) => {
    const snomed = codes?.SNOMED || 0;
    const loinc = codes?.LOINC || 0;
    const icd10 = codes?.["ICD-10"] || 0;

    const data = [
        { name: 'SNOMED', count: snomed, color: '#3b82f6' }, // blue-500
        { name: 'LOINC', count: loinc, color: '#f59e0b' },   // amber-500
        { name: 'ICD-10', count: icd10, color: '#a855f7' },  // purple-500
    ];

    return (
        <motion.div 
            whileHover={{ y: -5 }} onClick={onClick}
            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm cursor-pointer group hover:shadow-xl transition-all flex flex-col"
        >
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" /> Medical Codes
            </h3>
            
            <div className="w-full h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <span className="text-[10px] font-bold text-indigo-500 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                View Details
            </span>
        </motion.div>
    );
};

// 4. SR RELEVANCE CHART (Fixed Sizing)
const SRRelevanceWidget = ({ stats, onClick }) => {
    const s0 = stats?.[0] || 0;
    const s1 = stats?.[1] || 0;
    const s2 = stats?.[2] || 0;
    
    const data = [
        { name: 'SR 0', count: s0, color: '#cbd5e1' }, 
        { name: 'SR 1', count: s1, color: '#fbbf24' }, 
        { name: 'SR 2', count: s2, color: '#10b981' }, 
    ];

    return (
        <motion.div 
            whileHover={{ y: -5 }} onClick={onClick}
            // Removed h-full to prevent stretching
            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm cursor-pointer group hover:shadow-xl transition-all flex flex-col"
        >
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Layers size={16} className="text-orange-500" /> Stage Relevance
            </h3>
            
            {/* Fixed height for chart container */}
            <div className="w-full h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <span className="text-[10px] font-bold text-orange-500 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                View Relevance Log
            </span>
        </motion.div>
    );
};

// 5. AUTHORITY TIER CHART (Fixed Sizing)
const AuthorityTierWidget = ({ stats, onClick }) => {
    const tA = stats?.A || 0;
    const tB = stats?.B || 0;
    const tC = stats?.C || 0;
    const tD = stats?.D || 0;

    const data = [
        { name: 'A', count: tA, color: '#4f46e5' }, 
        { name: 'B', count: tB, color: '#818cf8' }, 
        { name: 'C', count: tC, color: '#94a3b8' }, 
        { name: 'D', count: tD, color: '#fb7185' }, 
    ];

    return (
        <motion.div 
            whileHover={{ y: -5 }} onClick={onClick}
            // Removed h-full
            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm cursor-pointer group hover:shadow-xl transition-all flex flex-col"
        >
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Award size={16} className="text-indigo-500" /> Authority Tier
            </h3>
            
            {/* Fixed height for chart container */}
            <div className="w-full h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <span className="text-[10px] font-bold text-indigo-500 mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                View Source Tiers
            </span>
        </motion.div>
    );
};


// --- MAIN PAGE ---

function AnalyticsPage() {
  const [selectedStage, setSelectedStage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [modalType, setModalType] = useState(null); // 'COMPLIANCE', 'CODES', 'SR', 'TIER'
  const [activeFilter, setActiveFilter] = useState("ALL");

  const { diseases } = useDiseases();
  const [raId, setRaId] = useState(null);
  

  setTimeout(() =>{
      setLoading(false);
  },2000)
  
  useEffect(() => {
    if (diseases && diseases.length > 0) {
      const ra = diseases.find(d => d.name.toLowerCase().includes("rheumatoid")) || diseases[0];
      if (ra) setRaId(ra.id);
    }
  }, [diseases]);

  const { stages } = useStages(raId);

  useEffect(() => {
    if(!selectedStage) return;
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/analytics/stage/${selectedStage.id}`);
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchAnalytics();
  }, [selectedStage]);

  // Reset filter when opening a new modal
  useEffect(() => {
    setActiveFilter("ALL");
  }, [modalType]);

  // --- FILTERING LOGIC ---
  const getFilteredRows = () => {
    if (!data) return [];
    
    // COMPLIANCE
    if (modalType === 'COMPLIANCE') {
        const rows = data.compliance_details || [];
        if (activeFilter === "ALL") return rows;
        return rows.filter(item => item.tag === activeFilter);
    } 
    
    // SOURCE DETAILS (Codes, SR, Tier)
    const sourceRows = data.source_details || []; // Safe access check
    if (activeFilter === "ALL") return sourceRows;

    if (modalType === 'CODES') {
        return sourceRows.filter(item => item.codes && item.codes[activeFilter] === true);
    }
    if (modalType === 'SR') {
        return sourceRows.filter(item => item.sr_score === parseInt(activeFilter));
    }
    if (modalType === 'TIER') {
        return sourceRows.filter(item => item.tier === activeFilter);
    }
    
    return sourceRows;
  };

  const filteredRows = getFilteredRows();

  if (selectedStage) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto space-y-8">
           {/* Header */}
           <div className="flex items-center gap-4">
              <button 
                onClick={() => { setSelectedStage(null); setData(null); }}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900">{selectedStage.name} Report</h1>
                <p className="text-slate-500 font-medium text-sm">Real-time audit on {data?.meta?.total_facts || 0} extracted facts.</p>
              </div>
           </div>

           {loading || !data ? (
             <div className="grid grid-cols-4 gap-6"><Skeleton className="h-96 w-full rounded-[2rem] col-span-4" /></div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* COL 1: METRICS STACK */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Widget 1: Compliance */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        onClick={() => setModalType('COMPLIANCE')}
                        className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center cursor-pointer hover:shadow-xl transition-all group"
                    >
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-indigo-500" /> SG Compliance
                        </h3>
                        <ComplianceDonut pass={data.compliance.pass} fail={data.compliance.fail} />
                        <div className="flex gap-4 mt-4">
                            <div className="text-center">
                                <p className="text-xl font-black text-emerald-500">{data.compliance.pass}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Pass</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-rose-500">{data.compliance.fail}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Fail</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-500 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">View Log</span>
                    </motion.div>

                    {/* Widget 2: Stage Relevance */}
                    <SRRelevanceWidget stats={data.sr_stats} onClick={() => setModalType('SR')} />

                    {/* Widget 3: Authority Tier */}
                    <AuthorityTierWidget stats={data.tier_stats} onClick={() => setModalType('TIER')} />

                    {/* Widget 4: Codes (New Chart Implementation) */}
                    <MedicalCodesWidget codes={data.codes} onClick={() => setModalType('CODES')} />
                </div>

                {/* COL 2 & 3: HEATMAPS */}
                <div className="lg:col-span-2 space-y-4">
                     <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Topic Coverage</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {data.topics.map((topic) => (
                            <HeatmapCell key={topic.id} label={topic.id} subLabel={topic.name} percentage={topic.percentage} status={topic.status} />
                        ))}
                     </div>
                </div>

                 {/* COL 4: FUNCTIONS */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm h-full">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <LayoutGrid size={16} className="text-indigo-500" /> Function Mix
                        </h3>
                        <div className="space-y-4">
                            {data.functions.map((func, i) => (
                                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0">
                                    <div className="max-w-[70%]">
                                        <p className="text-xs font-bold text-slate-700 leading-tight">{func.name}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-black ${
                                        func.status === "Green" ? "bg-emerald-100 text-emerald-600" :
                                        func.status === "Amber" ? "bg-amber-100 text-amber-600" :
                                        "bg-rose-100 text-rose-600"
                                    }`}>
                                        {func.percentage}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
           )}

           {/* --- UNIVERSAL MODAL --- */}
            <AnimatePresence>
                {modalType && data && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                    onClick={() => setModalType(null)}
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                {modalType === 'COMPLIANCE' && <ShieldCheck className="text-indigo-600" />}
                                {modalType === 'CODES' && <Activity className="text-indigo-600" />}
                                {modalType === 'SR' && <Layers className="text-orange-500" />}
                                {modalType === 'TIER' && <Award className="text-indigo-500" />}
                                
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {modalType === 'COMPLIANCE' && "Compliance Audit Log"}
                                        {modalType === 'CODES' && "Medical Code Analysis"}
                                        {modalType === 'SR' && "Stage Relevance Audit"}
                                        {modalType === 'TIER' && "Source Authority Tiers"}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                        {filteredRows.length} Records Shown
                                    </p>
                                </div>
                            </div>

                            {/* --- DYNAMIC FILTER DROPDOWN --- */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <select 
                                        value={activeFilter}
                                        onChange={(e) => setActiveFilter(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="ALL">Show All</option>
                                        
                                        {modalType === 'COMPLIANCE' && <>
                                            <option value="PASS">Pass Only</option>
                                            <option value="FAIL">Fail Only</option>
                                        </>}

                                        {modalType === 'SR' && <>
                                            <option value="2">SR 2 (High)</option>
                                            <option value="1">SR 1 (Medium)</option>
                                            <option value="0">SR 0 (Low)</option>
                                        </>}

                                        {modalType === 'TIER' && <>
                                            <option value="A">Tier A</option>
                                            <option value="B">Tier B</option>
                                            <option value="C">Tier C</option>
                                            <option value="D">Tier D</option>
                                        </>}

                                        {modalType === 'CODES' && <>
                                            <option value="SNOMED">Has SNOMED</option>
                                            <option value="LOINC">Has LOINC</option>
                                            <option value="ICD-10">Has ICD-10</option>
                                        </>}
                                    </select>
                                </div>

                                <button onClick={() => setModalType(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <XCircle size={24} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                        <th className="py-4 px-6">Source URL</th>
                                        
                                        {/* Dynamic Headers */}
                                        {modalType === 'COMPLIANCE' && <th className="py-4 px-6 text-center">Status</th>}
                                        {modalType === 'COMPLIANCE' && <th className="py-4 px-6">Reason</th>}
                                        
                                        {modalType === 'CODES' && <>
                                            <th className="py-4 px-6 text-center">SNOMED</th>
                                            <th className="py-4 px-6 text-center">LOINC</th>
                                            <th className="py-4 px-6 text-center">ICD-10</th>
                                        </>}

                                        {modalType === 'SR' && <th className="py-4 px-6 text-center">SR Score</th>}
                                        {modalType === 'SR' && <th className="py-4 px-6">Classification</th>}

                                        {modalType === 'TIER' && <th className="py-4 px-6 text-center">Tier</th>}
                                        {modalType === 'TIER' && <th className="py-4 px-6">Category</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-100">
                                    {/* COMPLIANCE ROWS */}
                                    {modalType === 'COMPLIANCE' && filteredRows.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6 max-w-xs truncate">
                                                <a href={log.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline block truncate max-w-[200px]">
                                                    {log.url}
                                                </a>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-2 py-1 rounded-md text-[10px] uppercase ${log.tag === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {log.tag}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-slate-500 font-normal">{log.reason}</td>
                                        </tr>
                                    ))}

                                    {/* SOURCE DETAILS ROWS (SR, TIER, CODES) */}
                                    {(modalType === 'CODES' || modalType === 'SR' || modalType === 'TIER') && filteredRows.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6 max-w-xs truncate">
                                                <a href={item.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline block truncate max-w-[200px]">
                                                    {item.url}
                                                </a>
                                            </td>
                                            
                                            {/* CODES COLUMNS */}
                                            {modalType === 'CODES' && <>
                                                <td className="py-4 px-6 text-center">{item.codes.SNOMED ? <Check className="mx-auto text-emerald-500" size={16}/> : <span className="text-slate-200">-</span>}</td>
                                                <td className="py-4 px-6 text-center">{item.codes.LOINC ? <Check className="mx-auto text-emerald-500" size={16}/> : <span className="text-slate-200">-</span>}</td>
                                                <td className="py-4 px-6 text-center">{item.codes["ICD-10"] ? <Check className="mx-auto text-emerald-500" size={16}/> : <span className="text-slate-200">-</span>}</td>
                                            </>}

                                            {/* SR COLUMNS */}
                                            {modalType === 'SR' && <>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-white text-xs ${
                                                        item.sr_score === 2 ? "bg-emerald-500" : item.sr_score === 1 ? "bg-amber-400" : "bg-slate-300"
                                                    }`}>
                                                        {item.sr_score}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-xs text-slate-500">
                                                    {item.sr_score === 2 ? "High Relevance (Stage Specific)" : item.sr_score === 1 ? "Borderline / Pre-clinical" : "General Background"}
                                                </td>
                                            </>}

                                            {/* TIER COLUMNS */}
                                            {modalType === 'TIER' && <>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-white text-xs ${
                                                        item.tier === "A" ? "bg-indigo-600" : item.tier === "B" ? "bg-indigo-400" : item.tier === "C" ? "bg-slate-400" : "bg-rose-400"
                                                    }`}>
                                                        {item.tier}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-xs text-slate-500">
                                                    {item.tier === "A" ? "Academic / Government" : item.tier === "B" ? "Professional / Trusted Media" : item.tier === "C" ? "General Web" : "Social / User Generated"}
                                                </td>
                                            </>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    );
  }

  if(loading){
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6 mt-12 ml-15">
        <Spinner size="lg" />
        <p className="text-xs font-bold text-slate-400 animate-pulse tracking-widest uppercase">
          Loading Analytics ...
        </p>
      </div>
    );
  }

  // Stage Selection View
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics Hub</h1>
            <p className="text-lg text-slate-500">Select a clinical stage to view Coverage, Compliance, and Coding metrics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {stages && stages.map((stage) => (
                   <motion.div
                     key={stage.id}
                     whileHover={{ y: -5 }}
                     onClick={() => setSelectedStage(stage)}
                     className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl transition-all"
                   >
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                       <TrendingUp size={28} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-800 mb-1">{stage.name}</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                       ID: {stage.id}
                     </p>
                     <div className="w-full py-3 bg-white border border-emerald-600 text-emerald-600 rounded-full text-sm font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                       Generate Report <ArrowRight size={16} />
                     </div>
                   </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;