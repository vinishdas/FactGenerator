import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Settings2,
  FileSpreadsheet,
  Play,
  CheckCircle2,
  Loader2,
  ExternalLink,
  PlusCircle,
  Database
} from 'lucide-react';
import { Skeleton } from "../components/ui/skeleton.js";
import { useDiseases } from "../hooks/useDisease.js";

function GeneratePage() {
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [factCount, setFactCount] = useState(5);
  const [selectedDisease, setSelectedDisease] = useState("RA");
  const [stage, setStage] = useState(1)
  const { diseases, loading } = useDiseases();


  const [generatedFacts, _setGeneratedFacts] = useState([
    { id: 1, status: "Verified", source: "nature.com/articles/s41584", fact: "Synovial fibroblasts play a key role in joint destruction in RA." },
    { id: 2, status: "Verified", source: "thelancet.com/rheumatology", fact: "Analyzing TNF-alpha inhibitor response rates..." },
  ]);

  const handleFileChange = (e) => {
    if (e.target.files[0])
      setFile(e.target.files[0]);
  };

  const startGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };


  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Settings2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Config</h2>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Upload Source Dataset (CSV)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-emerald-400 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                    <p className="text-sm text-slate-500 font-medium">
                      {file ? file.name : "Drop CSV or Click"}
                    </p>
                  </div>
                  <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Disease Name
                </label>
                <div className="relative">
                  <select
                    disabled={loading}
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {loading ? (
                      <option>Loading Disease ...</option>
                    ) : (
                      diseases.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title}
                        </option>
                      ))
                    )}
                  </select>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loading ? (
                      <Loader2 className="animate-spin text-slate-300" size={20} />
                    ) : (
                      <PlusCircle className="text-slate-300" size={20} />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Stage Name
                </label>
                <div className="relative">
                  <select
                    disabled={true}
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {loading ? (
                      <option>Loading Stage ...</option>
                    ) : (
                      diseases.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title}
                        </option>
                      ))
                    )}
                  </select>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loading ? (
                      <Loader2 className="animate-spin text-slate-300" size={20} />
                    ) : (
                      <PlusCircle className="text-slate-300" size={20} />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Facts per URL
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={factCount}
                    onChange={(e) => setFactCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                  <PlusCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
              </div>

              <button
                onClick={startGeneration}
                disabled={isGenerating || !file}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isGenerating || !file
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 active:scale-[0.98]"
                  }`}
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Play size={20} />
                )}
                {isGenerating ? "Generating..." : "Initialize Engine"}
              </button>
            </form>
          </div>
        </aside>

        <main className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-50 bg-white/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="text-emerald-500" size={20} />
                <h3 className="font-bold text-lg text-slate-800">Extracted Facts</h3>
              </div>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-tighter">
                Live Feed
              </span>
            </div>

            <div className="p-6 flex-1">
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="skeleton-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="p-5 rounded-[1.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex items-center gap-1">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                          </div>
                          <Skeleton className="h-10 w-28 rounded-xl" />
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="facts-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {generatedFacts.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {item.status === "Verified" ? (
                                <CheckCircle2 size={16} className="text-emerald-500" />
                              ) : (
                                <Loader2 size={16} className="text-amber-500 animate-spin" />
                              )}
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${item.status === "Verified" ? "text-emerald-600" : "text-amber-600"
                                }`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800 font-medium leading-relaxed">
                              {item.fact}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <FileSpreadsheet size={12} />
                              {item.source}
                            </div>
                          </div>

                          <button
                            onClick={() => window.open(item.source.startsWith('http') ? item.source : `https://${item.source}`, '_blank')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            Source <ExternalLink size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-medium tracking-tight">
                Showing {generatedFacts.length} total facts extracted from the provided dataset.
              </p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}

export default GeneratePage;