import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ProcessNodeData, NodeType, RiskLevel, NodeShape } from '../types';
import { clsx } from 'clsx';
import { Settings, PlayCircle, StopCircle, GitBranch, ShieldAlert, AlertTriangle, Clock, DollarSign, Activity } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const TechNode = ({ data, selected }: NodeProps<ProcessNodeData>) => {
  const isSupervisor = data.functionalMode === 'supervisor';
  const IconComponent = (LucideIcons as any)[data.iconName || 'Settings'] || Settings;

  // Map Color Themes to CSS Classes
  const colorMap = {
      blue: 'bg-blue-50 border-blue-500 text-blue-900',
      red: 'bg-red-50 border-red-500 text-red-900',
      yellow: 'bg-amber-50 border-amber-500 text-amber-900',
      green: 'bg-emerald-50 border-emerald-500 text-emerald-900',
      purple: 'bg-violet-50 border-violet-500 text-violet-900',
      slate: 'bg-slate-50 border-slate-500 text-slate-900'
  };
  
  const themeClass = colorMap[data.design?.colorTheme || 'blue'];

  // Determine Shape Logic
  // Priority: customShape > NodeType default
  let shapeClass = 'rounded-md';
  let sizeClass = 'min-w-[180px] min-h-[80px]';
  const shape = data.customShape || (data.type === NodeType.DECISION ? 'diamond' : (data.type === NodeType.START || data.type === NodeType.END ? 'round' : 'rectangle'));

  // SVG Clip Paths for Complex Shapes
  const getClipPath = () => {
      switch (shape) {
          case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
          case 'star': return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
          case 'trapezoid': return 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)';
          case 'parallelogram': return 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)';
          case 'heart': return 'path("M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z")'; // Simplified SVG path logic usually needs explicit SVG element, resorting to CSS approximation or wrapper
          default: return undefined;
      }
  };

  // CSS Shape Classes
  if (shape === 'diamond') {
      shapeClass = 'rounded-none rotate-45 aspect-square flex items-center justify-center';
      sizeClass = 'w-[140px] h-[140px]';
  } else if (shape === 'round') {
      shapeClass = 'rounded-full aspect-square flex items-center justify-center';
      sizeClass = 'w-[140px] h-[140px]';
  } else if (shape === 'heart' || shape === 'star') {
      // Special handling for complex shapes handled via wrapper
      sizeClass = 'w-[140px] h-[140px] flex items-center justify-center';
  }
  
  const isRotated = shape === 'diamond';

  // Custom Style Override
  const customStyle: React.CSSProperties = {
     clipPath: (shape !== 'diamond' && shape !== 'round' && shape !== 'rectangle') ? getClipPath() : undefined,
  };
  
  if (data.customBackgroundColor) customStyle.backgroundColor = data.customBackgroundColor;
  if (data.customBorderColor) customStyle.borderColor = data.customBorderColor;

  return (
    <div className={clsx(
      "relative group transition-all",
      sizeClass
    )}>
      
      {/* Actual Shape Container */}
      <div 
        className={clsx(
           "absolute inset-0 border-2 transition-shadow flex flex-col items-center justify-center text-center p-2",
           shapeClass,
           // Only apply default theme class if NO custom background is set, otherwise let inline style take over
           !data.customBackgroundColor ? themeClass : "border-slate-300", 
           selected ? "shadow-[0px_0px_15px_rgba(0,0,0,0.2)] ring-2 ring-indigo-400 border-transparent" : "shadow-sm",
           isSupervisor && data.riskLevel === RiskLevel.HIGH ? "border-red-600 ring-2 ring-red-100" : ""
        )}
        style={customStyle}
      >
          {/* Content Wrapper to Counter Rotate if needed */}
          <div className={clsx(
              "flex flex-col items-center gap-1 w-full overflow-hidden",
              isRotated ? "-rotate-45" : "",
              // Adjust padding for weird shapes
              shape === 'star' ? "scale-50" : (shape === 'hexagon' ? "scale-90" : "")
          )}>
              <IconComponent size={isRotated ? 20 : 16} className="opacity-80" />
              
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-60">{data.type}</span>
              <h3 className="font-bold text-xs leading-tight line-clamp-2 px-1">{data.label}</h3>
              
              {/* Supervisor Data Display */}
              {isSupervisor ? (
                    <div className="mt-1 w-full pt-1 border-t border-black/10 flex flex-col items-center gap-0.5">
                        {data.kpis && data.kpis.length > 0 && (
                            <div className="flex gap-1 flex-wrap justify-center">
                                {data.kpis.slice(0, 2).map((k, i) => (
                                    <span key={i} className="text-[8px] font-bold bg-white/50 px-1 rounded border border-black/5">
                                        {k.value}
                                    </span>
                                ))}
                            </div>
                        )}
                         {data.auditStep && (
                            <div className="text-[8px] text-red-600 font-bold max-w-full truncate bg-red-50/80 px-1 rounded flex items-center gap-0.5">
                                ! {data.auditStep}
                            </div>
                        )}
                    </div>
                ) : (
                    data.description && shape === 'rectangle' && (
                        <p className="text-[9px] opacity-70 mt-1 max-w-full truncate font-mono px-2">{data.description}</p>
                    )
                )}
          </div>
      </div>

      {/* Connection Handles (Positioned relative to the bounding box, not the shape) */}
      <Handle type="target" position={Position.Top} className="!bg-black !w-2 !h-2 !rounded-none z-50" />
      <Handle type="target" position={Position.Left} className="!bg-black !w-2 !h-2 !rounded-none z-50" />
      <Handle type="source" position={Position.Bottom} className="!bg-black !w-2 !h-2 !rounded-none z-50" />
      <Handle type="source" position={Position.Right} className="!bg-black !w-2 !h-2 !rounded-none z-50" />

      {/* External Badges (Outside the clip-path) */}
      {isSupervisor && data.riskLevel === RiskLevel.HIGH && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 z-50 shadow-md border border-white">
              <ShieldAlert size={12} />
          </div>
      )}
    </div>
  );
};

export default memo(TechNode);