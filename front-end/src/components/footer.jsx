import { Microscope, Heart, Shield } from "lucide-react";

function Footer() {
  return (
    <footer className="w-full border-t bg-white/50 backdrop-blur-md mt-24">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-12">
          

          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-900 rounded-lg text-white">
                <Microscope size={18} />
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">
                Fact<span className="text-emerald-600">{" "}Generator</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Advancing medical research through automated clinical fact extraction and verification. 
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Platform</h4>
              <ul className="space-y-2 text-sm font-bold text-slate-600">
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Generator</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Disease Models</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">API Docs</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Legal</h4>
              <ul className="space-y-2 text-sm font-bold text-slate-600">
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-emerald-600 cursor-pointer transition-colors">Compliance</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hidden lg:block">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700">System Operational</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Last updated: {new Date().getDate()}{"/"}{new Date().getMonth() + 1}{"/"}{ new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            Made with <Heart size={13} className="text-rose-500 fill-rose-500" /> for medical advancement
          </p>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
               <Shield size={14} /> Built at FlocCare
             </div>
             <p className="text-[11px] font-bold text-slate-400">
               &copy; {new Date().getFullYear()} Fact Generator
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;