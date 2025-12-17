import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ProcessNodeData, RiskLevel, NodeType } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertOctagon,
  PlayCircle,
  StopCircle,
  GitBranch,
  Settings,
  FileText
} from 'lucide-react';
import { clsx } from 'clsx';

const ProcessNode = ({ data, selected }: NodeProps<ProcessNodeData>) => {
  const isAuditMode = document.body.classList.contains('audit-mode');
  
  // Icon mapping
  const NodeIcon = {
    [NodeType.START]: PlayCircle,
    [NodeType.PROCESS]: Settings,
    [NodeType.DECISION]: GitBranch,
    [NodeType.END]: StopCircle,
  }[data.type] || FileText;

  // Style config based on Type
  const typeStyles = {
    [NodeType.START]: 'border-green-500 bg-green-50',
    [NodeType.PROCESS]: 'border-blue-500 bg-white',
    [NodeType.DECISION]: 'border-purple-500 bg-purple-50', // Diamond shape hint via CSS could go here
    [NodeType.END]: 'border-slate-500 bg-slate-100',
  };

  const riskColor = {
    [RiskLevel.LOW]: 'text-green-600',
    [RiskLevel.MEDIUM]: 'text-yellow-600',
    [RiskLevel.HIGH]: 'text-red-600',
  };

  const riskBorder = {
    [RiskLevel.LOW]: '',
    [RiskLevel.MEDIUM]: 'border-yellow-400',
    [RiskLevel.HIGH]: '!border-red-500 !border-l-4',
  };

  return (
    <div 
      className={clsx(
        "relative min-w-[220px] rounded-lg border-2 shadow-sm transition-all duration-300 group hover:shadow-lg",
        typeStyles[data.type] || 'border-gray-300 bg-white',
        riskBorder[data.riskLevel],
        selected ? 'ring-2 ring-indigo-400 shadow-xl scale-105' : '',
        data.isOverloaded ? 'animate-pulse !border-red-600 !bg-red-50' : '',
        data.isBottleneck ? '!border-orange-500 !border-4' : ''
      )}
    >
      {/* Bottleneck Indicator */}
      {data.isBottleneck && (
        <div className="absolute -top-3 -right-3 bg-orange-500 text-white p-1.5 rounded-full shadow-lg z-20" title="Nút thắt cổ chai (Bottleneck)">
          <AlertOctagon size={16} />
        </div>
      )}

      {/* Risk Radar Shield */}
      {data.riskLevel === RiskLevel.HIGH && (
        <div className="absolute -top-3 -left-3 bg-red-100 border border-red-200 p-1.5 rounded-full shadow-sm z-20">
          <ShieldAlert size={16} className="text-red-600" />
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3 !-top-2" />

      <div className="p-3">
        {/* Header */}
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100/50">
          <div className="flex items-center gap-1.5">
             <NodeIcon size={14} className="text-gray-500" />
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{data.type}</span>
          </div>
          {data.riskLevel !== RiskLevel.LOW && (
             <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white border shadow-sm", riskColor[data.riskLevel])}>
               {data.riskLevel === 'HIGH' ? 'HIGH RISK' : 'MEDIUM'}
             </span>
          )}
        </div>

        {/* Content */}
        <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{data.label}</h3>
        
        {/* Execution Mode View */}
        <div className={clsx("transition-all duration-300", isAuditMode ? "opacity-40 blur-[1px]" : "opacity-100")}>
            <p className="text-xs text-gray-500 line-clamp-2">{data.description || 'Chờ xử lý...'}</p>
            
            {/* Smart KPIs */}
            {data.kpis && data.kpis.length > 0 && (
              <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex flex-wrap gap-1">
                {data.kpis.map((kpi, idx) => (
                  <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white border border-indigo-100 text-indigo-700 shadow-sm">
                    <Activity size={10} className="mr-1" />
                    {kpi.label}: <b className="ml-1">{kpi.value}</b>
                  </span>
                ))}
              </div>
            )}
        </div>

        {/* Audit Mode View Overlay */}
        <div className={clsx(
          "absolute inset-x-0 bottom-0 top-10 bg-yellow-50/95 backdrop-blur-sm p-3 rounded-b-lg border-t border-yellow-200 flex flex-col justify-center transition-all duration-300", 
          isAuditMode ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}>
           <div className="flex items-start gap-2">
              <CheckCircle2 size={20} className="text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-yellow-700 uppercase mb-0.5">Yêu cầu Giám sát</p>
                <p className="text-sm text-yellow-900 font-medium italic leading-relaxed">"{data.auditStep}"</p>
              </div>
           </div>
        </div>

      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3 !-bottom-2" />
    </div>
  );
};

export default memo(ProcessNode);