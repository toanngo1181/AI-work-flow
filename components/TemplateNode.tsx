import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { ProcessNodeData } from '../types';

const TemplateNode = ({ data }: NodeProps<ProcessNodeData>) => {
  const width = 1200;
  const height = 900;
  
  const renderPyramid = () => (
    <svg viewBox="0 0 1000 800" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background Glow */}
      <circle cx="500" cy="400" r="300" fill="url(#grad1)" opacity="0.1" filter="url(#glow)" />

      {/* Layer 3 (Bottom) */}
      <path d="M100 700 L900 700 L750 450 L250 450 Z" fill="url(#grad1)" opacity="0.9" stroke="white" strokeWidth="2" />
      
      {/* Layer 2 (Middle) */}
      <path d="M250 450 L750 450 L600 250 L400 250 Z" fill="url(#grad2)" opacity="0.95" stroke="white" strokeWidth="2" />
      
      {/* Layer 1 (Top) */}
      <path d="M400 250 L600 250 L500 100 Z" fill="url(#grad3)" opacity="1" stroke="white" strokeWidth="2" />
      
      {/* Decorative Dots */}
      <circle cx="500" cy="180" r="5" fill="white" opacity="0.5" />
      <circle cx="350" cy="350" r="5" fill="white" opacity="0.5" />
      <circle cx="650" cy="350" r="5" fill="white" opacity="0.5" />
    </svg>
  );

  const renderCycle = () => (
    <svg viewBox="0 0 1000 1000" className="w-full h-full drop-shadow-xl">
      <defs>
        <linearGradient id="cycleGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#d97706"/></linearGradient>
        <linearGradient id="cycleGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#059669"/></linearGradient>
        <linearGradient id="cycleGrad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#2563eb"/></linearGradient>
        <linearGradient id="cycleGrad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient>
      </defs>

      {/* Central Hub */}
      <circle cx="500" cy="500" r="100" fill="white" fillOpacity="0.8" />
      <circle cx="500" cy="500" r="15" fill="#64748b" />

      {/* Segment 1 */}
      <path d="M500 200 A 300 300 0 0 1 800 500" fill="none" stroke="url(#cycleGrad1)" strokeWidth="60" strokeLinecap="round" opacity="0.8" />
      <path d="M780 480 L800 500 L820 480" fill="none" stroke="white" strokeWidth="5" />

      {/* Segment 2 */}
      <path d="M800 500 A 300 300 0 0 1 500 800" fill="none" stroke="url(#cycleGrad2)" strokeWidth="60" strokeLinecap="round" opacity="0.8" />
      
      {/* Segment 3 */}
      <path d="M500 800 A 300 300 0 0 1 200 500" fill="none" stroke="url(#cycleGrad3)" strokeWidth="60" strokeLinecap="round" opacity="0.8" />

      {/* Segment 4 */}
      <path d="M200 500 A 300 300 0 0 1 500 200" fill="none" stroke="url(#cycleGrad4)" strokeWidth="60" strokeLinecap="round" opacity="0.8" />
      
    </svg>
  );

  const renderTimeline = () => (
    <svg viewBox="0 0 1600 600" className="w-full h-full drop-shadow-xl">
       <defs>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0"/>
             <stop offset="10%" stopColor="#cbd5e1" stopOpacity="1"/>
             <stop offset="90%" stopColor="#cbd5e1" stopOpacity="1"/>
             <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0"/>
          </linearGradient>
       </defs>
       
       {/* The Winding Path */}
       <path 
         d="M100 300 C 400 300, 400 400, 600 400 C 800 400, 800 200, 1000 200 C 1200 200, 1200 300, 1500 300" 
         fill="none" 
         stroke="url(#pathGrad)" 
         strokeWidth="80" 
         strokeLinecap="round"
       />
       <path 
         d="M100 300 C 400 300, 400 400, 600 400 C 800 400, 800 200, 1000 200 C 1200 200, 1200 300, 1500 300" 
         fill="none" 
         stroke="white" 
         strokeWidth="4" 
         strokeDasharray="10 20"
       />

       {/* Milestones */}
       <circle cx="100" cy="300" r="10" fill="#94a3b8" />
       <circle cx="600" cy="400" r="10" fill="#94a3b8" />
       <circle cx="1000" cy="200" r="10" fill="#94a3b8" />
       <circle cx="1500" cy="300" r="10" fill="#94a3b8" />
    </svg>
  );

  return (
    <div 
        className="relative pointer-events-none select-none z-0" 
        style={{ width, height, transform: 'translate(-50%, -50%)' }}
    >
      {data.archetype === 'pyramid' && renderPyramid()}
      {data.archetype === 'cycle' && renderCycle()}
      {data.archetype === 'timeline' && renderTimeline()}
    </div>
  );
};

export default memo(TemplateNode);