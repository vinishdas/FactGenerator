import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Dna, Fingerprint, ShieldCheck, ShieldAlert, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from "../components/ui/card.js";
import { Spinner } from "../components/ui/spinner.js";
import axios from 'axios';
import { useCompliance } from '../hooks/useCompliance.js';

function Facts() {
  const { diseaseId, stageId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { scanUrl, scanning } = useCompliance();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ontology/stages/${stageId}/facts`);
        setData({
          diseaseName: response.data.disease,
          stageName: response.data.stage,
          factsList: response.data.facts
        });
      } catch (error) {
        console.error("Failed to fetch facts", error);
        // Fallback or Error State could be set here
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [diseaseId, stageId, refreshTrigger]);

  const handleScan = async (factId, url) => {
    if (!url) return;
    await scanUrl(url);
    // Refresh data to show the new status
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 mt-20">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-400 animate-pulse tracking-wide uppercase">
          Loading Facts ...
        </p>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center text-slate-500">No data found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-16 space-y-8">
      <div className="flex flex-col gap-2">
        <Link to={`/diseases/${diseaseId}/stages`} className="text-blue-500 text-sm flex items-center gap-1 hover:underline">
          <ChevronLeft size={14} /> Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{data.diseaseName} <span className="text-slate-400 font-light">/ {data.stageName}</span></h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.factsList.map((fact) => (
          <Card key={fact.id} className="group border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all rounded-2xl overflow-hidden flex flex-col">
            <CardContent className="p-5 flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 w-fit">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-r border-slate-200">
                    <Dna size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">ID : {fact.id}</span>
                  </div>
                </div>

                {/* Compliance Badge */}
                {fact.compliance ? (
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${fact.compliance.status === 'PASS'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                    {fact.compliance.status === 'PASS' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {fact.compliance.status} ({Math.round(fact.compliance.score)}%)
                  </div>
                ) : (
                  <button
                    onClick={() => handleScan(fact.id, fact.source)}
                    disabled={scanning}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold transition-colors">
                    <BadgeCheck size={12} />
                    {scanning ? 'Scanning...' : 'Check Compliance'}
                  </button>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500 leading-snug">
                  {fact.text}
                </p>
              </div>
            </CardContent>

            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter italic">Go to Source</span>
              <a href={fact.source} target='_blank' rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                <ExternalLink size={12} />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Facts;
