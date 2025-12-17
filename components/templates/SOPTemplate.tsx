import React from 'react';
import { SOPData } from '../../utils/sopMapper';
import * as LucideIcons from 'lucide-react';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Clock,
  ScanLine,
  ThermometerSun
} from 'lucide-react';
import { clsx } from 'clsx';
import { NodeType, RiskLevel } from '../../types';

interface SOPTemplateProps {
  data: SOPData;
}

const SOPTemplate: React.FC<SOPTemplateProps> = ({ data }) => {
  
  // Helper to render dynamic icon
  const renderIcon = (iconName: string | undefined, fallback: any, size = 24, className = "") => {
    const Icon = (LucideIcons as any)[iconName || ''] || fallback;
    return <Icon size={size} className={className} />;
  };

  return (
    <div className="w-full h-full bg-slate-100 overflow-y-auto p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden print:shadow-none print:w-full">
        
        {/* --- HEADER --- */}
        <header className="bg-slate-900 text-white p-8 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ClipboardCheck size={120} />
          </div>
          
          <div className="z-10">
             <div className="flex items-center gap-3 mb-2">
                 <div className="bg-blue-500 p-2 rounded-lg">
                    <ScanLine size={24} className="text-white" />
                 </div>
                 <span className="text-blue-400 font-bold tracking-widest text-xs uppercase">Standard Operating Procedure</span>
             </div>
             <h1 className="text-3xl font-black uppercase tracking-tight">{data.title}</h1>
          </div>

          <div className="z-10 text-right">
             <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Ngày ban hành</div>
             <div className="text-xl font-bold">{data.timestamp}</div>
             <div className="mt-2 inline-block px-3 py-1 bg-white/10 rounded border border-white/20 text-xs font-mono">
                REV. 1.0
             </div>
          </div>
        </header>

        {/* --- SECTION 1: EXECUTION FLOW --- */}
        <section className="p-8 bg-slate-50 border-b border-slate-200">
           <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">01</span>
              TRÌNH TỰ THỰC HIỆN
           </h2>

           <div className="flex flex-wrap gap-4 relative">
              {data.steps.map((step, index) => (
                 <div key={step.id} className="flex-1 min-w-[200px] relative group">
                    
                    {/* Arrow Connector */}
                    {index < data.steps.length - 1 && (
                       <div className="absolute top-8 -right-3 z-10 text-slate-300">
                          <ArrowRight size={24} strokeWidth={3} />
                       </div>
                    )}

                    <div className="bg-white border-2 border-slate-200 rounded-xl p-5 h-full hover:border-blue-400 transition-colors shadow-sm">
                       <div className="flex justify-between items-start mb-3">
                          <span className="text-4xl font-black text-slate-100 absolute top-2 right-4 select-none">
                             {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center relative z-10">
                             {renderIcon(step.data.iconName, LucideIcons.Activity, 20)}
                          </div>
                       </div>
                       
                       <h3 className="font-bold text-slate-800 mb-2 relative z-10">{step.data.label}</h3>
                       <p className="text-xs text-slate-500 line-clamp-3 mb-3 relative z-10 leading-relaxed">
                          {step.data.description || 'Thực hiện công việc theo quy chuẩn an toàn lao động.'}
                       </p>

                       {/* KPIs Mini List */}
                       {step.data.kpis && step.data.kpis.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 space-y-1">
                             {step.data.kpis.map((k, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px] font-bold">
                                   <span className="text-slate-400 uppercase">{k.label}</span>
                                   <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{k.value}</span>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* --- SECTION 2: QC & CRITICAL POINTS --- */}
        <section className="p-8 bg-white">
           <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">02</span>
              ĐIỂM KIỂM SOÁT & RỦI RO (QC)
           </h2>

           {data.checkpoints.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 italic">
                 Không có điểm rủi ro cao hoặc quyết định quan trọng trong quy trình này.
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {data.checkpoints.map((node) => {
                    const isHighRisk = node.data.riskLevel === RiskLevel.HIGH;
                    const isDecision = node.data.type === NodeType.DECISION;
                    
                    return (
                       <div key={node.id} className={clsx(
                          "rounded-xl p-4 border-l-4 shadow-sm",
                          isHighRisk ? "bg-red-50 border-red-500" : (isDecision ? "bg-amber-50 border-amber-500" : "bg-slate-50 border-slate-400")
                       )}>
                          <div className="flex items-center gap-2 mb-2">
                             {isHighRisk ? <ShieldAlert className="text-red-600" size={18}/> : <AlertTriangle className="text-amber-600" size={18}/>}
                             <span className={clsx("text-xs font-black uppercase tracking-wider", isHighRisk ? "text-red-700" : "text-amber-700")}>
                                {isHighRisk ? 'Critical Risk' : 'Check Point'}
                             </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{node.data.label}</h4>
                          <div className="text-xs text-slate-600 bg-white/60 p-2 rounded mt-2">
                             <span className="font-bold block mb-0.5">Yêu cầu Audit:</span>
                             {node.data.auditStep || "Kiểm tra tuân thủ quy trình."}
                          </div>
                       </div>
                    )
                 })}
              </div>
           )}
        </section>

        {/* --- FOOTER: OUTCOME --- */}
        <footer className="bg-emerald-600 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-white/20 rounded-full">
                  <CheckCircle2 size={32} />
               </div>
               <div>
                  <div className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Kết quả đầu ra (Outcome)</div>
                  <div className="text-xl font-bold">
                      {data.outcome ? data.outcome.data.label : 'Hoàn thành Quy trình'}
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-8 opacity-80">
                <div className="text-center">
                   <div className="text-[10px] uppercase font-bold">Soạn thảo</div>
                   <div className="h-8 border-b border-white/30 w-24"></div>
                </div>
                <div className="text-center">
                   <div className="text-[10px] uppercase font-bold">Phê duyệt</div>
                   <div className="h-8 border-b border-white/30 w-24"></div>
                </div>
            </div>
        </footer>

      </div>
    </div>
  );
};

export default SOPTemplate;