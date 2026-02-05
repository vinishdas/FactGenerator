import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FlaskConical,
  ChevronRight,
  Info
} from 'lucide-react';
import { useStages } from '../hooks/useStages';
import { Skeleton } from "../components/ui/skeleton.js"


function Stages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const { stages, isloading, _refetch } = useStages(id);


  if (isloading) {
    return (
      <div className="p-8 mt-16 max-w-6xl mx-auto">
        <Skeleton className="h-12 w-1/3 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-64 rounded-[2rem]" />
          <Skeleton className="h-64 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return <div className="p-8 mt-16 text-center">No stages found for this disease.</div>;
  }

  const diseaseName = stages[0]?.disease_name || "Disease";

  const filteredStages = filter === "All"
    ? stages
    : stages.filter(s => s.status === filter);

  const disease = stages;


  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 mt-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-slate-900">{diseaseName}</h1>
            <p className="text-slate-500 mt-2 text-lg">Detailed progression analysis.</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 self-start">
            {["All", "Completed","Rejected", "Pending"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6">
                  <span className="text-6xl font-black text-slate-50 group-hover:text-emerald-50 transition-colors">
                    0{stage.id}
                  </span>
                </div>

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${stage.severity === 'Severe' || stage.severity === 'Extreme'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    <FlaskConical size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{stage.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 min-h-[60px]">
                    {stage.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      {stage.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${stage.severity === 'Low' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      stage.severity === 'Moderate' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                        'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                      {stage.severity} Severity
                    </span>
                  </div>

                  <button className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl transition-all group/btn font-bold text-sm text-slate-700">
                    View Verified Facts
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-12 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-bold text-blue-900">Medical Data Notice</h4>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              These stages are generated based on standardized clinical pathways. Each fact within these cards must be cross-referenced with your specific source documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stages;