import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Dna, Fingerprint } from 'lucide-react';
import { Card, CardContent } from "../components/ui/card.js";
import { Spinner } from "../components/ui/spinner.js";

function Facts() {
  const { diseaseId, stageId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setTimeout(() => {
        setData({
          diseaseName: "Type 2 Diabetes",
          stageName: "Early Stage",
          factsList: [
            { id: 1, title: "Insulin Resistance", text: "Cells stop responding to insulin, leading to glucose buildup in the blood.", url: "#", type: "Clinical" },
            { id: 2, title: "Beta Cell Stress", text: "The pancreas overworks to produce extra insulin, causing cell fatigue over time.", url: "#", type: "Biological" },
            { id: 3, title: "Hyperglycemia", text: "Blood sugar levels begin to creep above normal ranges during fasting periods.", url: "#", type: "Marker" },
            { id: 4, title: "Reversibility", text: "Early detection allows for recovery through significant dietary adjustments.", url: "#", type: "Outcome" }
          ]
        });
        setLoading(false);
      }, 600);
    };
    fetchData();
  }, [diseaseId, stageId]);

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
  return (
    <div className="max-w-6xl mx-auto p-6 mt-16 space-y-8">
      <div className="flex flex-col gap-2">
        <Link to={`/disease/${diseaseId}/stages`} className="text-blue-500 text-sm flex items-center gap-1 hover:underline">
          <ChevronLeft size={14} /> Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{data.diseaseName} <span className="text-slate-400 font-light">/ {data.stageName}</span></h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.factsList.map((fact) => (
          <Card key={fact.id} className="group border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all rounded-2xl overflow-hidden flex flex-col">
            <CardContent className="p-5 flex-1 space-y-3">
              <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 w-fit">
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-r border-slate-200">
                  <Dna size={14} className="text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Disease : {diseaseId}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5">
                  <Fingerprint size={14} className="text-red-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Stage : {stageId}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 leading-tight mb-1">{fact.title}</h3>
                <p className="text-sm text-slate-500 leading-snug">
                  {fact.text}
                </p>
              </div>
            </CardContent>

            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter italic">Go to Source</span>
              <a href={fact.url} target='_blank' className="text-blue-500 hover:text-blue-700">
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