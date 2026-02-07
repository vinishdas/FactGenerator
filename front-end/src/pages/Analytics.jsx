import { Card, CardContent, CardHeader } from "../components/ui/card.js"; 
import { Users, Eye, MousePointerClick } from 'lucide-react';
import { MyChart } from "../components/charts.jsx";

function AnalyticsPage() {
  const stats = [
    { title: "Total Views", values: "45,231", icon: Eye, change: "+12.5%", trending: "up" },
    { title: "Active Users", values: "2,342", icon: Users, change: "+3.2%", trending: "up" },
    { title: "Click Rate", values: "4.2%", icon: MousePointerClick, change: "-0.4%", trending: "down" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 mt-15">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <MyChart data={stats}/>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsPage;