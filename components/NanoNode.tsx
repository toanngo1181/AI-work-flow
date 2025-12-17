import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ProcessNodeData, NodeType, RiskLevel } from '../types';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';
import { ShieldAlert, AlertTriangle, Clock, DollarSign, Users, Activity } from 'lucide-react';

const NanoNode = ({ data, selected }: NodeProps<ProcessNodeData>) => {
  const IconComponent = (LucideIcons as any)[data.iconName || 'Box'] || LucideIcons.Box;
  const isSupervisor = data.functionalMode === 'supervisor';

  // 3D Color Themes
  const themeMap = {
    blue:   { face: 'bg-blue-500',   side: 'bg-blue-700',   top: 'bg-blue-400',   text: 'text-white' },
    red:    { face: 'bg-rose-500',   side: 'bg-rose-700',   top: 'bg-rose-400',   text: 'text-white' },
    yellow: { face: 'bg-amber-400',  side: 'bg-amber-600',  top: 'bg-amber-200',  text: 'text-amber-900' },
    green:  { face: 'bg-emerald-500',side: 'bg-emerald-700',top: 'bg-emerald-400',text: 'text-white' },
    purple: { face: 'bg-violet-500', side: 'bg-violet-700', top: 'bg-violet-400', text: 'text-white' },
    slate:  { face: 'bg-slate-600',  side: 'bg-slate-800',  top: 'bg-slate-500',  text: 'text-white' },
  };

  const defaultTheme = data.design?.colorTheme || 
    (data.type === NodeType.DECISION ? 'yellow' : (data.type === NodeType.START ? 'green' : 'blue'));
  
  const th = themeMap[defaultTheme] || themeMap.blue;

  // Helper for KPI Icons
  const getKpiIcon = (label: string, size: number) => {
    const l = label.toLowerCase();
    if (l.includes('thời gian') || l.includes('time')) return <Clock size={size} />;
    if (l.includes('chi phí') || l.includes('cost') || l.includes('tiền')) return <DollarSign size={size} />;
    if (l.includes('nhân sự') || l.includes('người')) return <Users size={size} />;
    return <Activity size={size} />;
  };

  // ISOMETRIC 3D CSS
  return (
    <div 
      className={clsx(
        "relative group transition-transform duration-500 ease-out",
        selected ? "z-50 scale-110 -translate-y-4" : "z-10 hover:-translate-y-2"
      )}
      style={{
        width: '280px', // Increased from 260px for better text fit
        height: '160px', // Increased from 140px
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-0 !h-0 !border-0 opacity-0" />
      <Handle type="target" position={Position.Left} className="!w-0 !h-0 !border-0 opacity-0" />

      {/* 3D Container Rotating Wrapper */}
      <div 
        className="relative w-full h-full transition-transform duration-500"
        style={{ transform: 'rotateX(10deg) rotateY(-10deg)' }}
      >
        {/* SHADOW */}
        <div className="absolute top-[20px] left-[20px] w-full h-full bg-black/20 blur-md rounded-xl transform translate-z-[-50px]" />

        {/* SIDE FACE (Thickness) */}
        <div className={clsx("absolute w-full h-full rounded-xl transform translate-x-2 translate-y-3", th.side)} />

        {/* FRONT FACE (Main Content) */}
        <div className={clsx(
            "absolute inset-0 rounded-xl overflow-hidden flex flex-col justify-between border-t border-l border-white/30 backdrop-blur-sm shadow-inner transition-colors",
            th.face,
            isSupervisor && data.isBottleneck ? "ring-4 ring-amber-400 animate-pulse bg-amber-600" : ""
        )}>
           
           {/* Top Highlight/Glow - only if no image */}
           {!data.imageUrl && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />}

           {/* --- AI GENERATED HERO IMAGE --- */}
           {data.imageUrl ? (
               <div className="h-2/5 w-full relative">
                    <img 
                        src={data.imageUrl} 
                        alt={data.label} 
                        className="w-full h-full object-cover opacity-90 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
               </div>
           ) : (
               /* Standard Icon Header */
               <div className="flex justify-between items-start relative z-10 p-5 pb-0">
                  <div className={clsx("p-2.5 rounded-2xl shadow-lg backdrop-blur-md bg-white/20 text-white")}>
                      <IconComponent size={28} strokeWidth={2.5} className="drop-shadow-md" />
                  </div>
                  <span className={clsx("text-[9px] font-black uppercase tracking-widest opacity-80", th.text)}>
                    {data.type}
                  </span>
               </div>
           )}

           <div className={clsx("relative z-10 flex-1 flex flex-col justify-end p-5 pt-2", data.imageUrl ? "bg-gradient-to-t from-black/20 via-transparent to-transparent" : "")}>
              {/* Label: Removed truncate, added line-clamp to wrap text nicely */}
              <h3 
                className={clsx("text-lg font-black tracking-tight leading-snug mb-2 drop-shadow-sm", th.text)}
                style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: 3, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden' 
                }}
                title={data.label}
              >
                {data.label}
              </h3>
              
              {/* EXECUTION MODE: Simple Values */}
              {!isSupervisor && data.kpis && (
                  <div className="flex gap-2 overflow-hidden">
                    {data.kpis?.slice(0,2).map((k, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-1 bg-black/20 rounded text-white backdrop-blur-sm whitespace-nowrap">
                        {k.value}
                        </span>
                    ))}
                  </div>
              )}

              {/* SUPERVISOR MODE: Detailed Audit Data with Icons */}
              {isSupervisor && (
                  <div className="space-y-1">
                      {data.kpis?.map((k, i) => (
                         <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-white/90">
                             <div className="bg-white/20 p-0.5 rounded">
                                {getKpiIcon(k.label, 10)}
                             </div>
                             <span className="opacity-80">{k.label}:</span>
                             <span className="text-white">{k.value}</span>
                         </div>
                      ))}
                      {data.auditStep && (
                          <div className="mt-1 pt-1 border-t border-white/20 text-[9px] text-white italic truncate opacity-90">
                             Audit: {data.auditStep}
                          </div>
                      )}
                  </div>
              )}
           </div>
        </div>

        {/* SUPERVISOR OVERLAYS (Floating 3D Elements) */}
        {isSupervisor && (
            <>
                {/* Risk Shield Badge */}
                {data.riskLevel === RiskLevel.HIGH && (
                    <div 
                        className="absolute -top-6 -right-6 bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-2xl border-2 border-white flex items-center gap-1 z-50 animate-bounce"
                        style={{ transform: 'translateZ(60px)' }}
                    >
                        <ShieldAlert size={18} fill="currentColor" className="text-red-800"/>
                        <span className="text-[10px] font-black tracking-widest">RISK</span>
                    </div>
                )}
                
                {/* Medium Risk */}
                {data.riskLevel === RiskLevel.MEDIUM && (
                    <div 
                        className="absolute -top-4 -right-4 bg-amber-500 text-white p-2 rounded-lg shadow-xl border-2 border-white z-50"
                        style={{ transform: 'translateZ(40px)' }}
                    >
                        <AlertTriangle size={16} />
                    </div>
                )}
            </>
        )}

      </div>

      <Handle type="source" position={Position.Bottom} className="!w-0 !h-0 !border-0 opacity-0" />
      <Handle type="source" position={Position.Right} className="!w-0 !h-0 !border-0 opacity-0" />
    </div>
  );
};

export default memo(NanoNode);