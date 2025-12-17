import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { ProcessNodeData, RiskLevel, NodeType } from '../types';
import * as LucideIcons from 'lucide-react';
import { clsx } from 'clsx';
import { Sparkles, Loader2, Paintbrush } from 'lucide-react';
import { generateNodeIllustration } from '../services/aiArtist';

const InfographicNode = ({ id, data, selected }: NodeProps<ProcessNodeData>) => {
  const { setNodes } = useReactFlow();
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);

  const isAuditMode = document.body.classList.contains('audit-mode');
  const isCompact = data.layoutType === 'cyclic';

  // Dynamic Icon (Fallback)
  const IconComponent = (LucideIcons as any)[data.iconName || 'Activity'] || LucideIcons.Activity;

  // Strict Theming Strategy
  const themeMap = {
    [NodeType.START]:    { gradient: 'bg-gradient-to-r from-emerald-500 to-teal-400',       iconBg: 'rounded-full' },
    [NodeType.PROCESS]:  { gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',        iconBg: 'rounded-xl' },
    [NodeType.DECISION]: { gradient: 'bg-gradient-to-r from-amber-500 to-orange-600',        iconBg: 'rotate-45 rounded-lg' }, 
    [NodeType.END]:      { gradient: 'bg-gradient-to-r from-slate-600 to-slate-800',         iconBg: 'rounded-full' },
  };

  const theme = themeMap[data.type] || themeMap[NodeType.PROCESS];

  const handleGenerateArt = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node selection toggle
    
    // Check API Key existence (mock check via window or just try)
    const win = window as any;
    if (win.aistudio) {
       const hasKey = await win.aistudio.hasSelectedApiKey();
       if (!hasKey) {
           await win.aistudio.openSelectKey();
       }
    }

    setIsGeneratingArt(true);
    try {
        const svg = await generateNodeIllustration(data.label, data.description);
        if (svg) {
            setNodes((nds) => nds.map((n) => {
                if (n.id === id) {
                    return { ...n, data: { ...n.data, illustration: svg } };
                }
                return n;
            }));
        }
    } catch (err) {
        console.error("Failed to generate art", err);
    } finally {
        setIsGeneratingArt(false);
    }
  };

  const cardStyle = selected 
    ? 'ring-4 ring-offset-2 ring-indigo-300 shadow-2xl scale-105 z-50' 
    : 'shadow-lg hover:shadow-xl hover:-translate-y-1 z-10';

  return (
    <div className={clsx(
      "bg-white rounded-2xl overflow-hidden transition-all duration-300 font-sans border border-gray-100 group",
      isCompact ? "w-[220px]" : "w-[280px]", 
      cardStyle
    )}>
      <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-gray-800 !border-2 !border-white !-top-2 opacity-50 hover:opacity-100 transition-opacity" />

      {/* Header Area / Visual Stage */}
      <div className={clsx("relative flex items-center px-4 transition-all overflow-hidden", 
          // If we have an illustration, make the header taller to show it off
          data.illustration ? "h-32 items-end pb-2" : (isCompact ? "h-12" : "h-16"), 
          theme.gradient
      )}>
         
         {/* AI Art Button - Visible on Hover or Select */}
         <div className={clsx(
             "absolute top-2 right-2 transition-all duration-300 z-20",
             selected || "opacity-0 group-hover:opacity-100"
         )}>
            <button 
                onClick={handleGenerateArt}
                disabled={isGeneratingArt}
                title="Vẽ Minh họa (AI Art)"
                className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-1.5 rounded-lg text-white shadow-sm border border-white/30 transition-all flex items-center gap-1"
            >
                {isGeneratingArt ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} className="fill-yellow-300 text-yellow-300" />}
                {!isCompact && <span className="text-[10px] font-bold">AI Art</span>}
            </button>
         </div>

         {/* Visual Content Container */}
         <div className={clsx(
             "relative flex items-center justify-center transition-all duration-500",
             data.illustration ? "w-full h-full absolute inset-0" : "" // Full size if illustration
         )}>
            
            {/* Case 1: AI Illustration Present */}
            {data.illustration ? (
                 <div className="w-full h-full relative group-hover:scale-110 transition-transform duration-700 ease-in-out">
                     {/* Glow Effect */}
                     <div className="absolute inset-0 bg-white/10 blur-xl scale-75 rounded-full" />
                     {/* The SVG Render */}
                     <div 
                        className="w-full h-full p-2 drop-shadow-lg filter"
                        dangerouslySetInnerHTML={{ __html: data.illustration }} 
                     />
                 </div>
            ) : (
                /* Case 2: Standard Icon */
                <div className="relative flex items-center justify-center">
                    {/* The shape background */}
                    <div className={clsx(
                        "absolute inset-0 bg-white/20 backdrop-blur-sm shadow-inner transition-all",
                        isCompact ? "w-8 h-8" : "w-10 h-10",
                        theme.iconBg
                    )} />
                    {/* The Icon itself */}
                    <div className="relative text-white z-10">
                        <IconComponent size={isCompact ? 18 : 22} strokeWidth={2} />
                    </div>
                </div>
            )}
         </div>

         {/* Label (Only shown in header if standard icon mode) */}
         {!data.illustration && (
             <span className="ml-4 text-white font-bold tracking-wide uppercase text-xs opacity-90 truncate flex-1">
                {data.type}
             </span>
         )}

         {/* Risk Badge */}
         {data.riskLevel === RiskLevel.HIGH && (
            <div className="absolute top-3 right-3 bg-white/90 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full shadow animate-pulse border border-red-200 z-20">
               RISK
            </div>
         )}
      </div>

      {/* Body Area */}
      <div className={clsx(isCompact ? "p-3" : "p-5")}>
          <h3 className={clsx("text-gray-800 font-extrabold leading-tight mb-2", isCompact ? "text-sm" : "text-lg")}>
            {data.label}
          </h3>
          
          <div className={clsx("transition-all duration-300", isAuditMode ? "opacity-30 blur-[1px]" : "opacity-100")}>
             <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
                {data.description || '...'}
             </p>
          </div>

          {/* KPIs */}
          {!isAuditMode && data.kpis && data.kpis.length > 0 && (
             <div className="mt-4 flex flex-wrap gap-2">
               {data.kpis.slice(0, isCompact ? 1 : 3).map((kpi, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-center min-w-[60px]">
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{kpi.label}</div>
                      <div className="text-xs font-bold text-slate-700">{kpi.value}</div>
                  </div>
               ))}
             </div>
          )}

          {/* Audit Mode Overlay */}
          {isAuditMode && (
             <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                <LucideIcons.ScanEye className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <div className="overflow-hidden">
                   <p className="text-[9px] font-black text-amber-700 uppercase tracking-wider">Yêu cầu Giám sát</p>
                   <p className="text-xs text-amber-900 font-medium italic truncate">{data.auditStep}</p>
                </div>
             </div>
          )}
      </div>

      {/* Bottleneck Strip */}
      {data.isBottleneck && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] bg-orange-500" title="Bottleneck Detected" />
      )}

      <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-gray-800 !border-2 !border-white !-bottom-2 opacity-50 hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default memo(InfographicNode);