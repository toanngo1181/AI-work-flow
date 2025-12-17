import React from 'react';
import { ViewMode, LayoutPattern } from '../types';
import { 
  Network, LayoutTemplate, Box, // Icons for View Modes
  ArrowRight, ArrowDown, RefreshCw, TrendingUp, Triangle, // Icons for Layouts
  Layers, Settings2
} from 'lucide-react';
import { clsx } from 'clsx';

interface ViewControlBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  layoutPattern: LayoutPattern;
  setLayoutPattern: (pattern: LayoutPattern) => void;
}

const ViewControlBar: React.FC<ViewControlBarProps> = ({ 
  viewMode, setViewMode, 
  layoutPattern, setLayoutPattern 
}) => {

  const viewOptions: { id: ViewMode; label: string; icon: any }[] = [
    { id: 'technical', label: 'Kỹ thuật', icon: Network },
    { id: 'infographic', label: 'Infographic', icon: LayoutTemplate },
    { id: 'nano_3d', label: 'Nano 3D', icon: Box },
  ];

  // Dynamic Layout Options based on View Mode
  const getLayoutOptions = () => {
    const base = [
      { id: 'flow', label: 'Dòng chảy', icon: ArrowRight },
      { id: 'tree', label: 'Phân nhánh', icon: ArrowDown },
    ];
    
    if (viewMode === 'technical') return base;

    // Infographic & Nano get creative layouts
    return [
      ...base,
      { id: 'cycle', label: 'Vòng tròn', icon: RefreshCw },
      { id: 'steps', label: 'Bậc thang', icon: TrendingUp },
      { id: 'pyramid', label: 'Tam giác', icon: Triangle },
    ];
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-auto max-w-[90vw]">
      
      {/* LEVEL 1: VIEW MODE TABS */}
      <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-xl border border-white/50 flex items-center ring-1 ring-black/5">
        <div className="px-3 border-r border-slate-200 mr-1 flex items-center gap-1.5 text-slate-400">
           <Settings2 size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">View</span>
        </div>
        {viewOptions.map((opt) => {
           const isActive = viewMode === opt.id;
           const Icon = opt.icon;
           return (
             <button
               key={opt.id}
               onClick={() => setViewMode(opt.id)}
               className={clsx(
                 "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                 isActive 
                   ? "bg-slate-800 text-white shadow-lg scale-105" 
                   : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
               )}
             >
               <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
               {opt.label}
             </button>
           );
        })}
      </div>

      {/* LEVEL 2: LAYOUT PATTERNS (Conditional Animation) */}
      <div className="bg-white/80 backdrop-blur-md px-1.5 py-1.5 rounded-xl shadow-lg border border-white/40 flex items-center gap-1 animate-in slide-in-from-top-2 duration-300">
         <div className="px-2 border-r border-slate-200 mr-1 flex items-center gap-1.5 text-slate-400">
           <Layers size={14} />
           <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Layout</span>
        </div>
        {getLayoutOptions().map((opt) => {
          const isActive = layoutPattern === opt.id as LayoutPattern;
          const Icon = opt.icon;
          return (
            <button
               key={opt.id}
               onClick={() => setLayoutPattern(opt.id as LayoutPattern)}
               className={clsx(
                 "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                 isActive
                   ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                   : "text-slate-500 hover:bg-white hover:shadow-sm"
               )}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          )
        })}
      </div>

    </div>
  );
};

export default ViewControlBar;