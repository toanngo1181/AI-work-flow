import React, { useState, useMemo } from 'react';
import { 
  Play, FileText, Settings, AlertTriangle, Zap, Key, 
  BarChart3, Clock, CheckCircle, LayoutDashboard,
  Sparkles, ShieldAlert, Save, RefreshCcw, Box,
  Palette, Image as ImageIcon, PlusSquare, Trash2, Edit3, GripVertical, MousePointer2,
  Unplug, Plus, MinusCircle, Shapes, ScanEye, PenTool, GitCommit, Home
} from 'lucide-react';
import { clsx } from 'clsx';
import { Node, Edge } from 'reactflow';
import { ProcessNodeData, RiskLevel, NodeType, NodeShape, ProcessEdgeData, EdgePathType } from '../types';
import IconPicker from './IconPicker';
import * as LucideIcons from 'lucide-react';

interface SidebarProps {
  nodes: Node<ProcessNodeData>[];
  selectedNode?: Node<ProcessNodeData> | null; 
  selectedEdge?: Edge<ProcessEdgeData> | null; 
  aiAnalysis?: {
    score: number;
    riskSummary: string;
    optimizationNotes: string;
  };
  onGenerate: (text: string) => void;
  onSimulate: () => void;
  simulating?: boolean;
  onDownloadSOP: () => void;
  onConfigureApi: () => void;
  onSave?: () => void;
  onExit?: () => void; // NEW: Exit Handler
  onLoadDemo?: () => void;
  onAutoIllustrate?: () => void;
  // Handlers
  onUpdateNodeData?: (id: string, data: Partial<ProcessNodeData>) => void;
  onUpdateEdgeData?: (id: string, data: Partial<ProcessEdgeData>) => void; 
  onDeleteNode?: (id: string) => void;
  onDeleteEdge?: (id: string) => void; 
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  nodes,
  selectedNode,
  selectedEdge,
  aiAnalysis,
  onGenerate, 
  onSimulate, 
  simulating,
  onDownloadSOP, 
  onConfigureApi,
  onSave,
  onExit,
  onLoadDemo,
  onAutoIllustrate,
  onUpdateNodeData,
  onUpdateEdgeData,
  onDeleteNode,
  onDeleteEdge,
  isGenerating 
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'report'>('editor');
  const [inputText, setInputText] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);

  // --- Analytics Logic ---
  const stats = useMemo(() => {
    const totalSteps = nodes.length;
    const highRisks = nodes.filter(n => n.data.riskLevel === RiskLevel.HIGH).length;
    const bottlenecks = nodes.filter(n => n.data.isBottleneck).length;
    
    let totalTime = 0;
    let efficiencySum = 0;
    let efficiencyCount = 0;

    nodes.forEach(n => {
      if (Array.isArray(n.data.kpis)) {
        n.data.kpis.forEach(k => {
          if (k.label.includes('Thời gian')) {
            const val = parseInt(k.value.replace(/\D/g, '')) || 0;
            totalTime += val;
          }
          if (k.label.includes('Hiệu suất') || k.label.includes('Độ chính xác')) {
            const val = parseInt(k.value.replace(/\D/g, '')) || 0;
            efficiencySum += val;
            efficiencyCount++;
          }
        });
      }
    });

    const avgEfficiency = efficiencyCount > 0 ? Math.round(efficiencySum / efficiencyCount) : 95;

    return { totalSteps, highRisks, bottlenecks, totalTime, avgEfficiency };
  }, [nodes]);

  // Drag Handler
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const SelectedNodeIcon = selectedNode && selectedNode.data.iconName 
    ? (LucideIcons as any)[selectedNode.data.iconName] 
    : Box;

  // Colors for Selection
  const themeColors = ['blue', 'red', 'yellow', 'green', 'purple', 'slate'];

  // Shapes for Selection
  const shapeOptions: { id: NodeShape; label: string }[] = [
    { id: 'rectangle', label: 'Hình Chữ Nhật' },
    { id: 'round', label: 'Hình Tròn/Oval' },
    { id: 'diamond', label: 'Hình Thoi' },
    { id: 'hexagon', label: 'Lục Giác' },
    { id: 'parallelogram', label: 'Hình Bình Hành' },
    { id: 'star', label: 'Ngôi Sao' },
    { id: 'heart', label: 'Trái Tim' },
    { id: 'trapezoid', label: 'Hình Thang' }
  ];

  // Helper to update KPI
  const handleUpdateKPI = (index: number, key: 'label' | 'value', val: string) => {
     if (!selectedNode || !onUpdateNodeData) return;
     const newKPIs = [...(selectedNode.data.kpis || [])];
     newKPIs[index] = { ...newKPIs[index], [key]: val };
     onUpdateNodeData(selectedNode.id, { kpis: newKPIs });
  };

  const handleAddKPI = () => {
    if (!selectedNode || !onUpdateNodeData) return;
    const newKPIs = [...(selectedNode.data.kpis || []), { label: 'Metric', value: 'Value' }];
    onUpdateNodeData(selectedNode.id, { kpis: newKPIs });
  };

  const handleDeleteKPI = (index: number) => {
    if (!selectedNode || !onUpdateNodeData) return;
    const newKPIs = selectedNode.data.kpis?.filter((_, i) => i !== index);
    onUpdateNodeData(selectedNode.id, { kpis: newKPIs });
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full flex flex-col shadow-xl z-20">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-lg font-bold text-brand-900 flex items-center gap-2">
          <Zap className="text-yellow-500 fill-yellow-500" size={20} />
          ProcessMaster
        </h1>
        {onExit && (
            <button 
                onClick={onExit} 
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Trở về Dashboard"
            >
                <Home size={20} />
            </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('editor')}
          className={clsx("flex-1 py-3 text-xs font-bold uppercase tracking-wide", activeTab === 'editor' ? "text-brand-600 border-b-2 border-brand-600 bg-brand-50" : "text-gray-500 hover:bg-gray-50")}
        >
          Thiết kế & Chỉnh sửa
        </button>
        <button 
          onClick={() => setActiveTab('report')}
          className={clsx("flex-1 py-3 text-xs font-bold uppercase tracking-wide", activeTab === 'report' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50" : "text-gray-500 hover:bg-gray-50")}
        >
          Báo cáo & AI
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        
        {/* EDITOR TAB */}
        {activeTab === 'editor' && (
          <>
            {/* Quick Save Action */}
            {onSave && (
               <button 
                  onClick={onSave}
                  className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all shadow-md active:scale-95"
               >
                   <Save size={16} /> Lưu Lưu Đồ
               </button>
            )}

            {/* CASE 1: Node Selected */}
            {selectedNode ? (
                <section className="bg-white border border-indigo-100 rounded-xl shadow-sm animate-in slide-in-from-left-2 overflow-hidden">
                    <div className="bg-indigo-50 p-3 flex justify-between items-center border-b border-indigo-100">
                        <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                            <Edit3 size={16} /> Thuộc tính Node
                        </h3>
                        <button onClick={() => onDeleteNode && onDeleteNode(selectedNode.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors" title="Xóa Node này">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    
                    <div className="p-4 space-y-4">
                        {/* Label & Icon */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tên & Biểu tượng</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-300 outline-none"
                                value={selectedNode.data.label}
                                onChange={(e) => onUpdateNodeData && onUpdateNodeData(selectedNode.id, { label: e.target.value })}
                            />
                            <button 
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg hover:border-indigo-400 text-sm transition-all"
                            >
                                <SelectedNodeIcon size={18} className="text-indigo-600" />
                                <span className="text-slate-600 truncate">{selectedNode.data.iconName || 'Chọn icon...'}</span>
                            </button>
                            {showIconPicker && (
                                <div className="relative z-50">
                                    <IconPicker 
                                        currentIcon={selectedNode.data.iconName}
                                        onClose={() => setShowIconPicker(false)}
                                        onSelect={(iconName) => {
                                            if (onUpdateNodeData) onUpdateNodeData(selectedNode.id, { iconName });
                                            setShowIconPicker(false);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-100"/>

                        {/* Design: Color & Shape */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Palette size={12}/> Giao diện</label>
                            
                            {/* Shape Selector */}
                            <div className="relative">
                                <Shapes size={14} className="absolute left-3 top-3 text-slate-400"/>
                                <select 
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm appearance-none outline-none focus:border-indigo-500"
                                    value={selectedNode.data.customShape || 'rectangle'}
                                    onChange={(e) => onUpdateNodeData && onUpdateNodeData(selectedNode.id, { customShape: e.target.value as NodeShape })}
                                >
                                    {shapeOptions.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Preset Colors */}
                            <div className="flex gap-2 justify-between">
                                {themeColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onUpdateNodeData && onUpdateNodeData(selectedNode.id, { 
                                            design: { ...selectedNode.data.design, colorTheme: color as any, styleVariant: 'solid' },
                                            customBackgroundColor: undefined // Reset custom if picking theme
                                        })}
                                        className={clsx(
                                            "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                            `bg-${color === 'slate' ? 'slate-500' : (color === 'purple' ? 'violet-500' : (color === 'green' ? 'emerald-500' : (color === 'red' ? 'rose-500' : (color === 'yellow' ? 'amber-400' : 'blue-500'))))}`,
                                            (!selectedNode.data.customBackgroundColor && selectedNode.data.design?.colorTheme === color) ? "border-slate-800 scale-110 ring-2 ring-offset-1 ring-slate-300" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                        title={color}
                                    />
                                ))}
                            </div>

                            {/* Custom Colors */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Màu Nền</label>
                                    <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1 bg-white">
                                        <input 
                                            type="color" 
                                            className="w-6 h-6 rounded cursor-pointer border-none p-0"
                                            value={selectedNode.data.customBackgroundColor || '#ffffff'}
                                            onChange={(e) => onUpdateNodeData && onUpdateNodeData(selectedNode.id, { customBackgroundColor: e.target.value })}
                                        />
                                        <span className="text-xs text-slate-500 uppercase">{selectedNode.data.customBackgroundColor || 'Auto'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Màu Viền</label>
                                    <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-1 bg-white">
                                        <input 
                                            type="color" 
                                            className="w-6 h-6 rounded cursor-pointer border-none p-0"
                                            value={selectedNode.data.customBorderColor || '#000000'}
                                            onChange={(e) => onUpdateNodeData && onUpdateNodeData(selectedNode.id, { customBorderColor: e.target.value })}
                                        />
                                        <span className="text-xs text-slate-500 uppercase">{selectedNode.data.customBorderColor || 'Auto'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100"/>

                        {/* Audit Step */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><ScanEye size={12}/> Kiểm soát (Audit)</label>
                            <textarea 
                                className="w-full h-16 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-300 outline-none resize-none"
                                placeholder="Nhập nội dung cần kiểm tra..."
                                value={selectedNode.data.auditStep || ''}
                                onChange={(e) => onUpdateNodeData && onUpdateNodeData(selectedNode.id, { auditStep: e.target.value })}
                            />
                        </div>

                        {/* KPIs */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><BarChart3 size={12}/> KPIs & Metrics</label>
                                <button onClick={handleAddKPI} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 flex items-center gap-1"><Plus size={10}/> Thêm</button>
                            </div>
                            
                            <div className="space-y-1">
                                {selectedNode.data.kpis?.map((kpi, idx) => (
                                    <div key={idx} className="flex gap-1 items-center">
                                        <input 
                                            className="w-1/3 px-2 py-1 border border-slate-200 rounded text-xs bg-slate-50"
                                            placeholder="Label (Time)"
                                            value={kpi.label}
                                            onChange={(e) => handleUpdateKPI(idx, 'label', e.target.value)}
                                        />
                                        <input 
                                            className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs"
                                            placeholder="Value (5m)"
                                            value={kpi.value}
                                            onChange={(e) => handleUpdateKPI(idx, 'value', e.target.value)}
                                        />
                                        <button onClick={() => handleDeleteKPI(idx)} className="text-slate-400 hover:text-red-500"><MinusCircle size={14}/></button>
                                    </div>
                                ))}
                                {(!selectedNode.data.kpis || selectedNode.data.kpis.length === 0) && (
                                    <p className="text-[10px] text-slate-400 italic text-center py-2">Chưa có chỉ số KPI nào.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </section>
            ) : selectedEdge ? (
               /* CASE 2: Edge Selected (UPDATED) */
               <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in slide-in-from-left-2">
                   <div className="flex items-center gap-3 mb-4 text-slate-700">
                       <Unplug size={20} />
                       <h3 className="text-sm font-bold">Liên kết (Edge)</h3>
                   </div>
                   
                   <div className="space-y-4 mb-4">
                        {/* Edge Type Selector */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Kiểu đường dẫn</label>
                            <div className="relative">
                                <GitCommit size={14} className="absolute left-3 top-3 text-slate-400"/>
                                <select 
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none"
                                    value={selectedEdge.data?.pathType || 'bezier'}
                                    onChange={(e) => onUpdateEdgeData && onUpdateEdgeData(selectedEdge.id, { pathType: e.target.value as EdgePathType })}
                                >
                                    <option value="bezier">Cong mềm (Bezier)</option>
                                    <option value="straight">Thẳng (Straight)</option>
                                    <option value="step">Gấp khúc (Step)</option>
                                </select>
                            </div>
                        </div>

                        {/* Edge Color Selector */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Màu đường dẫn</label>
                            <div className="flex items-center gap-2 border border-slate-300 rounded-lg p-2 bg-white">
                                <input 
                                    type="color" 
                                    className="w-8 h-8 rounded cursor-pointer border-none p-0"
                                    value={selectedEdge.data?.strokeColor || '#94a3b8'}
                                    onChange={(e) => onUpdateEdgeData && onUpdateEdgeData(selectedEdge.id, { strokeColor: e.target.value })}
                                />
                                <span className="text-xs text-slate-500 uppercase flex-1">{selectedEdge.data?.strokeColor || 'Mặc định'}</span>
                            </div>
                        </div>
                   </div>

                   <button 
                       onClick={() => onDeleteEdge && onDeleteEdge(selectedEdge.id)}
                       className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                   >
                       <Trash2 size={16} /> Xóa Liên Kết
                   </button>
               </section>
            ) : (
                /* CASE 3: Default (Add New Nodes) */
                <section>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <PlusSquare size={16} />
                        Thêm Node mới
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div 
                            className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-400 cursor-grab active:cursor-grabbing flex flex-col items-center gap-2 transition-all"
                            draggable
                            onDragStart={(event) => onDragStart(event, NodeType.START)}
                        >
                            <Play size={20} className="text-emerald-500 fill-emerald-100" />
                            <span className="text-xs font-bold text-slate-600">Bắt đầu</span>
                        </div>
                        <div 
                            className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 cursor-grab active:cursor-grabbing flex flex-col items-center gap-2 transition-all"
                            draggable
                            onDragStart={(event) => onDragStart(event, NodeType.PROCESS)}
                        >
                            <Settings size={20} className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-600">Quy trình</span>
                        </div>
                        <div 
                            className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-amber-400 cursor-grab active:cursor-grabbing flex flex-col items-center gap-2 transition-all"
                            draggable
                            onDragStart={(event) => onDragStart(event, NodeType.DECISION)}
                        >
                            <RefreshCcw size={20} className="text-amber-500" />
                            <span className="text-xs font-bold text-slate-600">Quyết định</span>
                        </div>
                        <div 
                            className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-slate-400 cursor-grab active:cursor-grabbing flex flex-col items-center gap-2 transition-all"
                            draggable
                            onDragStart={(event) => onDragStart(event, NodeType.END)}
                        >
                            <Box size={20} className="text-slate-500 fill-slate-200" />
                            <span className="text-xs font-bold text-slate-600">Kết thúc</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Kéo thả các khối vào vùng vẽ</p>
                </section>
            )}

            <hr className="border-gray-100" />

            {/* AI Generator Section */}
            <section>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500"/>
                AI Khởi tạo nhanh
              </label>
              <textarea
                className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-gray-50"
                placeholder="Mô tả quy trình của bạn để AI vẽ tự động..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex flex-col gap-2 mt-3">
                  <button
                    onClick={() => onGenerate(inputText)}
                    disabled={isGenerating || !inputText.trim()}
                    className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg font-bold text-xs"
                  >
                    {isGenerating ? <><RefreshCcw className="animate-spin" size={14}/> Đang xử lý...</> : <><Sparkles size={14} className="text-yellow-300 fill-yellow-300"/> Tạo Quy trình AI</>}
                  </button>
              </div>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Settings size={16} />
                Công cụ hỗ trợ
              </h3>
              <div className="space-y-2">
                {onAutoIllustrate && (
                    <button 
                        onClick={onAutoIllustrate}
                        disabled={isGenerating}
                        className="w-full py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all border bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 text-slate-700 border-slate-200 hover:border-pink-200 hover:text-pink-600 group"
                    >
                        {isGenerating ? <RefreshCcw className="animate-spin" size={16}/> : <ImageIcon size={16} className="group-hover:scale-110 transition-transform" />}
                        Tự động Minh họa (AI)
                    </button>
                )}

                <button 
                  onClick={onSimulate}
                  className={clsx(
                    "w-full py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border",
                    simulating
                      ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {simulating ? <><RefreshCcw size={16} /> Reset Mô phỏng</> : <><Play size={16} /> Chaos Monkey (Test)</>}
                </button>
                
              </div>
            </section>
          </>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
             
             {/* AI Score Card */}
             <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Sparkles size={60} />
                </div>
                <div className="flex items-center gap-2 opacity-90 mb-1">
                  <LayoutDashboard size={16} />
                  <span className="text-xs uppercase font-bold tracking-wider">AI Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{aiAnalysis ? aiAnalysis.score : stats.avgEfficiency}</span>
                    <span className="text-lg opacity-70">/ 100</span>
                </div>
                <div className="text-xs font-medium bg-white/20 inline-block px-2 py-0.5 rounded mt-2">
                  {aiAnalysis ? "Dựa trên đánh giá rủi ro & hiệu suất" : "Ước tính sơ bộ"}
                </div>
             </div>

             {/* Stats Grid */}
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                   <div className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Clock size={12}/> Thời gian</div>
                   <div className="text-lg font-bold text-gray-800">{stats.totalTime}p</div>
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                   <div className="text-gray-500 text-xs mb-1 flex items-center gap-1"><BarChart3 size={12}/> Tổng Bước</div>
                   <div className="text-lg font-bold text-gray-800">{stats.totalSteps}</div>
                </div>
             </div>

             {/* Risk Analysis */}
             <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                  <ShieldAlert size={16} />
                  Rủi ro & Sự cố
                </h4>
                {aiAnalysis ? (
                   <p className="text-xs text-red-700 mb-2 leading-relaxed">{aiAnalysis.riskSummary}</p>
                ) : (
                   <div className="text-xs text-gray-500 italic mb-2">Chưa có phân tích chi tiết từ AI...</div>
                )}
                
                <div className="flex gap-2 mt-2">
                    <span className="text-xs font-bold bg-white text-red-600 border border-red-200 px-2 py-1 rounded">
                        High Risk: {stats.highRisks}
                    </span>
                    <span className="text-xs font-bold bg-white text-orange-600 border border-orange-200 px-2 py-1 rounded">
                        Bottlenecks: {stats.bottlenecks}
                    </span>
                </div>
             </div>

             {/* AI Optimization Proposal */}
             <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                   <CheckCircle size={16} />
                   Đề xuất Tối ưu (To-Be)
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                   {aiAnalysis 
                     ? aiAnalysis.optimizationNotes 
                     : "Hệ thống đang chờ dữ liệu để đề xuất cải tiến quy trình..."}
                </p>
             </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 mt-auto space-y-2">
         {activeTab === 'report' && (
           <button 
             onClick={onDownloadSOP}
             className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
           >
             <FileText size={16} />
             Tải File Markdown (SOP)
           </button>
         )}
        <button 
          onClick={onConfigureApi}
          className="w-full flex items-center gap-3 text-gray-600 hover:text-brand-600 hover:bg-white p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
        >
          <div className="bg-white p-1.5 rounded-md border border-gray-200 text-gray-500">
             <Key size={16} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Cài đặt API Key</p>
            <p className="text-[10px] text-gray-400">Google AI Studio</p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;