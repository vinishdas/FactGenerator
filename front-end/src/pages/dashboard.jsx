import { 
  Users, 
  User2, 
  Activity, 
  Plus,
} from 'lucide-react';
import { Card,CardHeader, CardTitle } from "../components/ui/card.js";
import { Button } from "../components/ui/button.js";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50/50 mt-18">

      <aside className="w-64 border-r bg-white p-6 hidden md:block">
        <div className="font-bold text-xl mb-10 flex items-center gap-2">
          <User2/>
          Admin Panel
        </div>
        <nav className="space-y-2">
          <NavItem icon={<Activity size={18} />} label="Overview" active />
          <NavItem icon={<Users size={18} />} label="Facts Management" />
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Welcome back, here's what's happening today.</p>
          </div>
          <Button className="gap-2 shadow-sm rounded-xl">
            <Plus size={18} /> Generate Report
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-sm border-none ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Registrations</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">View All</Button>
            </CardHeader>
          </Card>

          <Card className="shadow-sm border-none ring-1 ring-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${active ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);


export default Dashboard;