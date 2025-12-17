import React from 'react';
import { LayoutArchetype } from '../types';
import { Triangle, RefreshCcw, ArrowRight, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';

interface TemplateSelectorProps {
  currentArchetype: LayoutArchetype;
  onSelect: (type: LayoutArchetype) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ currentArchetype, onSelect }) => {
  
  const templates: { id: LayoutArchetype; label: string; icon: any; desc: string }[] = [
    { 
      id: 'timeline', 
      label: 'Dòng Chảy', 
      icon: ArrowRight,
      desc: 'Quy trình tuyến tính'
    },
    { 
      id: 'cycle', 
      label: 'Vòng Lặp', 
      icon: RefreshCcw,
      desc: 'Quy trình khép kín'
    },
    { 
      id: 'pyramid', 
      label: 'Kim Tự Tháp', 
      icon: Triangle,
      desc: 'Cấu trúc phân cấp'
    },
  ];

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-2 ring-1 ring-black/5 animate-in slide-in-from-bottom-6 duration-500">
        
        <div className="px-3 border-r border-gray-300 mr-1 hidden md:block">
           <div className="flex flex-col items-center text-indigo-900">
               <LayoutGrid size={18} />
               <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Layouts</span>
           </div>
        </div>

        {templates.map((tpl) => {
          const isActive = currentArchetype === tpl.id;
          const Icon = tpl.icon;
          
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl.id)}
              className={clsx(
                "relative group flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-all duration-300 ease-out",
                isActive 
                  ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg scale-105" 
                  : "hover:bg-white hover:shadow-md text-slate-500 hover:text-indigo-600"
              )}
            >
              <Icon size={20} className={clsx("mb-1", isActive && tpl.id === 'cycle' && "animate-spin-slow")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{tpl.label}</span>
              
              {/* Tooltip */}
              <div className="absolute -top-10 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tpl.desc}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;