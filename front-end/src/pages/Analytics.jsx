import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.js"; 
import { TrendingUp, Users, Eye, MousePointerClick } from 'lucide-react';

function AnalyticsPage() {
  const stats = [
    { title: "Total Views", value: "45,231", icon: Eye, change: "+12.5%", trending: "up" },
    { title: "Active Users", value: "2,342", icon: Users, change: "+3.2%", trending: "up" },
    { title: "Click Rate", value: "4.2%", icon: MousePointerClick, change: "-0.4%", trending: "down" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 mt-15">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground">Track your performance and user engagement metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 ${stat.trending === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change} <span className="text-muted-foreground ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Trends
          </CardTitle>
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