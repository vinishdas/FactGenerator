import { useState, useEffect } from "react";
import { motion as _motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ArrowRight,
  Plus,
  Layers
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useDiseases } from "../hooks/useDisease";
import { useStages } from "../hooks/useStages";
import { Button } from "../components/ui/button.js";
import { Spinner } from "../components/ui/spinner.js";

const STAGE_DESCRIPTIONS = {
  "Stage 1": "Risk / Asymptomatic",
  "Stage 2": "Autoimmunity / Seropositive",
  "Stage 3": "CSA / Arthralgia",
  "Stage 4": "Diagnosis & Early Treatment",
  "Stage 5": "Established / Advanced"
};

const StageCard = ({ name, id, pending, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl transition-all"
  >
    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
      <Layers size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-1">{name}</h3>

    <p className="text-lg font-black text-slate-500 uppercase tracking-tight mb-4">
      {STAGE_DESCRIPTIONS[name] || name}
    </p>

    <div className="flex gap-2 mb-6">
      <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black tracking-wider">
        <Clock size={12} /> {pending} PENDING AUDIT
      </div>
    </div>

    <button className="w-full py-3 bg-white border border-emerald-600 text-emerald-600 rounded-full text-sm font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
      View Facts <ArrowRight size={16} />
    </button>
  </motion.div>
);

export default function KnowledgeBaseHome() {
  const navigate = useNavigate();

  const { diseases, loading: diseasesLoading } = useDiseases();
  const [raId, setRaId] = useState(null);

  useEffect(() => {
    if (diseases && diseases.length > 0) {
      const ra = diseases.find(d => d.name.toLowerCase().includes("rheumatoid")) || diseases[0];
      if (ra) setRaId(ra.id);
    }
  }, [diseases]);

  const { stages, isLoading: stagesLoading } = useStages(raId);

  const isLoading = diseasesLoading || (raId && stagesLoading);
  const showEmptyState = !diseasesLoading && (!raId || (stages && stages.length === 0));

  if ( diseasesLoading || isLoading ) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6 mt-12 ml-15">
        <Spinner size="lg" />
        <p className="text-xs font-bold text-slate-400 animate-pulse tracking-widest uppercase">
          Loading Stages ...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fcfcfc] text-slate-900 pt-12">
      <aside className="w-80 bg-white border-r p-6 flex flex-col sticky top-100 h-screen z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
        </div>

        <div className="space-y-6 mb-8">
          <div className="px-4 py-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-1">Active Disease Models</h4>
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Rheumatoid Arthritis
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-12">
        <header className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">
              Rheumatoid Arthritis
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Clinical Stages
            </h1>
          </div>
          <div className="flex gap-3">
            <Link to="/generate">
              <button className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                <Plus size={16} /> Add Data
              </button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {!isLoading && stages && stages.map((stage) => (
              <StageCard
                key={stage.id}
                name={stage.name}
                id={stage.id}
                pending={stage.pending_facts || 0}
                onClick={() => navigate(`/diseases/${raId}/stages/${stage.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>

        {showEmptyState && (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 transition-all">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <Layers size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Clinical Stages Found
            </h3>
            <p className="text-slate-500 text-center max-w-[300px] mb-8 leading-relaxed">
              The database is currently empty. Initialize the engine by adding data to a specific RA Stage.
            </p>

            <Link to="/generate">
              <Button
                className="gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-md font-bold shadow-lg shadow-emerald-200"
              >
                <Plus className="w-5 h-5" />
                Initialize Knowledge Base
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}