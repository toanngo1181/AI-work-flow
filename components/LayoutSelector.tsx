import React from 'react';
import { ArrowRight, RefreshCcw, GitFork, Layout } from 'lucide-react';
import { clsx } from 'clsx';
import { LayoutType } from '../types';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (type: LayoutType) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ currentLayout, onLayoutChange }) => {
  const options: { id: LayoutType; label: string; icon: React.FC<any> }[] = [
    { id: 'linear', label: 'Tuần tự', icon: ArrowRight },
    { id: 'cyclic', label: 'Vòng lặp', icon: RefreshCcw },
    { id: 'hierarchy', label: 'Phân cấp', icon: GitFork },
  ];

  return (
    <div className="flex items-center bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200/60 pointer-events-auto">
      <div className="px-2 text-xs font-bold text-slate-400 flex items-center gap-1 border-r border-slate-200 mr-1">
        <Layout size={14} />
      </div>
      {options.map((opt) => {
        const isActive = currentLayout === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            onClick={() => onLayoutChange(opt.id)}
            title={opt.label}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all mx-0.5",
              isActive 
                ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Icon size={14} className={clsx(isActive && opt.id === 'cyclic' && "animate-spin-slow")} />
            <span className="hidden md:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LayoutSelector;