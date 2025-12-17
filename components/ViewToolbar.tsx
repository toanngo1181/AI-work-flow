import React from 'react';
import {
  BoxSelect,
  Palette,
  Boxes,
  PlayCircle,
  ShieldCheck,
  Settings2,
  ArrowRight,
  GitFork,
  RefreshCcw,
  Signal,
  Triangle,
  Layout,
  FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { ViewMode, FunctionalMode, LayoutPattern } from '../types';

interface ViewToolbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  layoutPattern: LayoutPattern;
  setLayoutPattern: (pattern: LayoutPattern) => void;
  functionalMode: FunctionalMode;
  setFunctionalMode: (mode: FunctionalMode) => void;
}

const ToolButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  colorClass?: string;
}> = ({ icon, label, isActive, onClick, colorClass = 'bg-blue-100 text-blue-600' }) => (
  <button
    onClick={onClick}
    title={label}
    className={clsx(
      'p-3 rounded-xl transition-all duration-200 group flex flex-col items-center justify-center w-12 h-12 mb-2',
      isActive
        ? colorClass
        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
    )}
  >
    <div className={clsx("transition-transform group-hover:scale-110", isActive ? "scale-105" : "")}>
      {icon}
    </div>
  </button>
);

const ViewToolbar: React.FC<ViewToolbarProps> = ({
  viewMode,
  setViewMode,
  layoutPattern,
  setLayoutPattern,
  functionalMode,
  setFunctionalMode,
}) => {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 h-full shadow-sm z-10 flex-shrink-0 font-inter overflow-y-auto scrollbar-none">
      {/* Visual Modes Group */}
      <div className="flex flex-col items-center mb-2 w-full">
        <div className="text-gray-300 mb-2" title="Giao diện (Visual)"><Settings2 size={16}/></div>
        <ToolButton
          icon={<BoxSelect size={24} />}
          label="Kỹ thuật (Technical)"
          isActive={viewMode === 'technical'}
          onClick={() => setViewMode('technical')}
          colorClass="bg-gray-200 text-gray-800 shadow-inner"
        />
        <ToolButton
          icon={<Palette size={24} />}
          label="Infographic 2D"
          isActive={viewMode === 'infographic'}
          onClick={() => setViewMode('infographic')}
          colorClass="bg-purple-100 text-purple-600 shadow-sm"
        />
        <ToolButton
          icon={<Boxes size={24} className="text-indigo-500" />}
          label="Nano Banana 3D Pro"
          isActive={viewMode === 'nano_3d'}
          onClick={() => setViewMode('nano_3d')}
          colorClass="bg-indigo-100 text-indigo-600 shadow-md border border-indigo-200"
        />
        <ToolButton
          icon={<FileText size={24} className="text-teal-600" />}
          label="Mẫu SOP (Template)"
          isActive={viewMode === 'sop_template'}
          onClick={() => setViewMode('sop_template')}
          colorClass="bg-teal-100 text-teal-700 shadow-md ring-1 ring-teal-200"
        />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-200 my-2 shrink-0"></div>

      {/* Layout Patterns Group */}
      <div className="flex flex-col items-center mb-2 w-full">
        <div className="text-gray-300 mb-2" title="Bố cục (Layout)"><Layout size={16}/></div>
        <ToolButton
          icon={<ArrowRight size={24} />}
          label="Dòng chảy (Flow)"
          isActive={layoutPattern === 'flow'}
          onClick={() => setLayoutPattern('flow')}
          colorClass="bg-blue-100 text-blue-600"
        />
        <ToolButton
          icon={<GitFork size={24} className="rotate-90" />}
          label="Phân nhánh (Tree)"
          isActive={layoutPattern === 'tree'}
          onClick={() => setLayoutPattern('tree')}
          colorClass="bg-blue-100 text-blue-600"
        />
        <ToolButton
          icon={<RefreshCcw size={24} />}
          label="Vòng tròn (Cycle)"
          isActive={layoutPattern === 'cycle'}
          onClick={() => setLayoutPattern('cycle')}
          colorClass="bg-blue-100 text-blue-600"
        />
        <ToolButton
          icon={<Signal size={24} />}
          label="Bậc thang (Steps)"
          isActive={layoutPattern === 'steps'}
          onClick={() => setLayoutPattern('steps')}
          colorClass="bg-blue-100 text-blue-600"
        />
        <ToolButton
          icon={<Triangle size={24} />}
          label="Kim tự tháp (Pyramid)"
          isActive={layoutPattern === 'pyramid'}
          onClick={() => setLayoutPattern('pyramid')}
          colorClass="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-200 my-2 shrink-0"></div>

      {/* Functional Modes Group */}
      <div className="flex flex-col items-center mt-auto w-full pb-4">
        <ToolButton
          icon={<PlayCircle size={24} />}
          label="Thực thi (Execution)"
          isActive={functionalMode === 'execution'}
          onClick={() => setFunctionalMode('execution')}
          colorClass="bg-green-100 text-green-600"
        />
        <ToolButton
          icon={<ShieldCheck size={24} />}
          label="Giám sát (Supervisor)"
          isActive={functionalMode === 'supervisor'}
          onClick={() => setFunctionalMode('supervisor')}
          colorClass="bg-orange-100 text-orange-600"
        />
      </div>
    </div>
  );
};

export default ViewToolbar;