import React from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  EdgeProps, 
  getBezierPath, 
  getStraightPath, 
  getSmoothStepPath 
} from 'reactflow';
import { Check, X, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { ProcessEdgeData } from '../types';

const InfographicEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps<ProcessEdgeData>) => {
  
  // Determine Path Type
  const pathType = data?.pathType || 'bezier';
  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  const params = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  if (pathType === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath(params);
  } else if (pathType === 'step') {
    [edgePath, labelX, labelY] = getSmoothStepPath({ ...params, borderRadius: 0 });
  } else {
    [edgePath, labelX, labelY] = getBezierPath(params);
  }

  const sentiment = data?.sentiment || 'neutral';
  
  // Theme Config
  const theme = {
    positive: { stroke: '#16a34a', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: Check }, 
    negative: { stroke: '#dc2626', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: X },       
    neutral:  { stroke: '#94a3b8', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: ArrowRight }, 
  }[sentiment];

  const Icon = theme.icon;
  const strokeWidth = selected ? 3 : 2;
  
  // Custom Color Override
  const finalColor = data?.strokeColor || theme.stroke;

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
            ...style,
            stroke: finalColor,
            strokeWidth: strokeWidth,
            strokeDasharray: sentiment === 'neutral' ? '5,5' : 'none', // Dashed for neutral flow
            animation: selected ? 'dashdraw 0.5s linear infinite' : 'none'
        }} 
      />
      
      {/* Floating Badge for Decision Labels */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={clsx(
              "nodrag nopan flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-sm transition-transform hover:scale-110 cursor-pointer",
              theme.bg,
              theme.border
            )}
            onClick={() => console.log('Edge Clicked:', id)}
          >
             <div className={clsx("p-0.5 rounded-full bg-white/50", theme.text)}>
                <Icon size={10} strokeWidth={4} />
             </div>
             <span className={clsx("text-[10px] font-bold uppercase tracking-wide", theme.text)}>
                {data.label}
             </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default InfographicEdge;