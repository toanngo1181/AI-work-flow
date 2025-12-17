import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ProcessNodeData, NodeType, RiskLevel } from '../types';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';
import { ShieldAlert, ScanEye, AlertOctagon, Clock, DollarSign, Users, Activity } from 'lucide-react';

const InfoNode = ({ data, selected }: NodeProps<ProcessNodeData>) => {
  const IconComponent = (LucideIcons as any)[data.iconName || 'Activity'] || LucideIcons.Activity;
  const isSupervisor = data.functionalMode === 'supervisor';

  // Flat Colors
  const colors = {
    [NodeType.START]: 'bg-emerald-500 text-white',
    [NodeType.PROCESS]: 'bg-white text-slate-800 border-l-4 border-blue-500',
    [NodeType.DECISION]: 'bg-amber-400 text-amber-900',
    [NodeType.END]: 'bg-slate-600 text-white',
  }[data.type];

  // Helper to get icon for KPI
  const getKpiIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('thời gian') || l.includes('time')) return <Clock size={10} />;
    if (l.includes('chi phí') || l.includes('cost') || l.includes('tiền')) return <DollarSign size={10} />;
    if (l.includes('nhân sự') || l.includes('người')) return <Users size={10} />;
    return <Activity size={10} />;
  };

  return (
    <div className={clsx(
      "shadow-md rounded-lg overflow-hidden min-w-[240px] transition-transform relative group",
      colors,
      selected ? "ring-2 ring-indigo-400 scale-105" : "",
      isSupervisor && data.isBottleneck ? "ring-4 ring-amber-500" : ""
    )}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-300" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-slate-300" />

      {/* SUPERVISOR BADGES: RISK SHIELD */}
      {isSupervisor && data.riskLevel === RiskLevel.HIGH && (
          <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-[10px] font-bold rounded-bl-lg shadow-md z-20 flex items-center gap-1 animate-pulse">
             <ShieldAlert size={12} /> HIGH RISK
          </div>
      )}
      
      {/* SUPERVISOR BADGES: BOTTLENECK */}
      {isSupervisor && data.isBottleneck && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg z-20 border-2 border-white" title="Bottleneck Detected">
             <AlertOctagon size={16} />
          </div>
      )}

      <div className="p-4 flex items-start gap-3">
         <div className="p-2 bg-black/10 rounded-lg shrink-0">
            <IconComponent size={20} />
         </div>
         <div className="flex-1">
            <h3 className="font-bold text-sm leading-snug mb-1">{data.label}</h3>
            
            {/* Conditional Description vs Audit Data */}
            {isSupervisor && data.auditStep ? (
                <div className="bg-slate-100 p-2 rounded text-xs text-slate-700 italic border border-slate-200 mt-1 flex gap-1.5 items-start">
                    <ScanEye size={14} className="shrink-0 mt-0.5 text-indigo-600" />
                    <div>
                        <span className="font-bold text-indigo-700 block text-[10px] uppercase">Audit Check:</span>
                        {data.auditStep}
                    </div>
                </div>
            ) : (
                <p className="text-xs opacity-80 line-clamp-2">{data.description}</p>
            )}

            {/* KPI TAGS with ICONS */}
            {data.kpis && data.kpis.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-black/5">
                    {data.kpis.map((k, i) => (
                        <div key={i} className={clsx(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shadow-sm",
                            isSupervisor ? "bg-white text-slate-700 border-slate-200" : "bg-black/5 border-transparent"
                        )}>
                            {getKpiIcon(k.label)}
                            <span className="opacity-70">{k.label}:</span>
                            <span className="text-indigo-600">{k.value}</span>
                        </div>
                    ))}
                </div>
            )}
         </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-slate-300" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-slate-300" />
    </div>
  );
};

export default memo(InfoNode);