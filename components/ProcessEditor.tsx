import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import { Download, Save, ArrowLeft, Image as ImageIcon, X, AlertOctagon, RefreshCw, Eye, Play, ShieldAlert, Sparkles, CheckCircle2, Minus, FileJson, Check, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

import Sidebar from './Sidebar';
import ViewToolbar from './ViewToolbar'; 
import SOPTemplate from './templates/SOPTemplate'; 

// --- NEW NODE IMPORTS ---
import TechNode from './TechNode';
import InfoNode from './InfoNode';
import NanoNode from './NanoNode';
import TemplateNode from './TemplateNode';
// ---
import InfographicEdge from './InfographicEdge';

import { DEMO_NODES, DEMO_EDGES } from '../constants';
import { generateWorkflow, generateKPIsForNode, detectRiskLevel } from '../services/gemini';
import { generateNodeImage } from '../services/imageGen'; 
import { ProcessNodeData, AIWorkflowResponse, ProcessGraph, SavedDiagram, ViewMode, LayoutPattern, FunctionalMode, NodeType, RiskLevel, ProcessEdgeData } from '../types';
import { applyLayoutStrategy } from '../utils/layoutAlgorithms';
import { useAutoCapture } from '../hooks/useAutoCapture';
import { mapNodesToSOP } from '../utils/sopMapper';

interface ProcessEditorProps {
  initialData?: SavedDiagram;
  onSave: (nodes: Node[], edges: Edge[], aiData: AIWorkflowResponse | null, title: string) => void;
  onExit: () => void;
  systemSettings: { enableAI: boolean; enableExport: boolean };
}

// Inner Component
const EditorContent: React.FC<ProcessEditorProps> = ({ initialData, onSave, onExit, systemSettings }) => {
  const { fitView, screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || DEMO_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || DEMO_EDGES);
  
  const [diagramTitle, setDiagramTitle] = useState(initialData?.title || 'Quy trình mới');
  const [aiData, setAiData] = useState<AIWorkflowResponse | null>(initialData?.aiAnalysis || null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  // --- MASTER VIEW STATE ---
  const [viewMode, setViewMode] = useState<ViewMode>('technical');
  const [layoutPattern, setLayoutPattern] = useState<LayoutPattern>('flow');
  
  // --- FUNCTIONAL MODE (NEW) ---
  const [functionalMode, setFunctionalMode] = useState<FunctionalMode>('execution');
  const [showOptimized, setShowOptimized] = useState(false);
  // Toggle for Supervisor Panel Visibility
  const [isSupervisorPanelOpen, setIsSupervisorPanelOpen] = useState(true);

  // Selection State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [simulating, setSimulating] = useState(false);
  const [chaosReport, setChaosReport] = useState<string[] | null>(null);
  const originalState = useRef<{ nodes: Node[], edges: Edge[] } | null>(null);
  
  // Toast Notification State
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { capturedImage, showModal, setShowModal, captureNow } = useAutoCapture(nodes.length);

  const nodeTypes = useMemo(() => ({
    processNode: viewMode === 'technical' ? TechNode : (viewMode === 'infographic' ? InfoNode : NanoNode),
    templateNode: TemplateNode, 
  }), [viewMode]);

  const edgeTypes = useMemo(() => ({
    infographicEdge: InfographicEdge,
  }), []);

  useEffect(() => {
    if (!initialData) {
        handleLayoutChange(layoutPattern);
    }
  }, []);

  // Sync Functional Mode to Nodes
  useEffect(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, functionalMode }
    })));
    // Auto-open panel when switching to supervisor
    if (functionalMode === 'supervisor') {
        setIsSupervisorPanelOpen(true);
    }
  }, [functionalMode, setNodes]);

  useEffect(() => {
    if (viewMode !== 'sop_template') {
        handleLayoutChange(layoutPattern);
    }
  }, [viewMode, layoutPattern]);

  const handleLayoutChange = (pattern: LayoutPattern) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = applyLayoutStrategy(nodes, edges, pattern);
    setNodes(layoutedNodes.map(n => ({ ...n, data: { ...n.data, functionalMode } })));
    setEdges([...layoutedEdges]);
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);
  };

  const handleConfigureApi = async () => {
    const win = window as any;
    if (win.aistudio) {
      // Allow manual trigger
      await win.aistudio.openSelectKey();
    } else {
        alert("Tính năng chọn Key chỉ khả dụng trên môi trường hỗ trợ (như Google IDX).");
    }
  };

  // UPDATED onConnect: Adds styling and arrowheads to manual connections
  const onConnect = useCallback(
    (params: Connection) => {
        const newEdge = {
            ...params,
            type: viewMode === 'technical' ? 'default' : 'infographicEdge',
            markerEnd: { type: MarkerType.ArrowClosed, color: viewMode === 'technical' ? '#000' : '#94a3b8' },
            animated: true,
            style: { 
                stroke: viewMode === 'technical' ? '#000' : (viewMode === 'nano_3d' ? '#6366f1' : '#94a3b8'),
                strokeWidth: viewMode === 'technical' ? 1 : 2
            },
        };
        setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, viewMode]
  );

  // --- MANUAL EDITING HANDLERS ---
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (typeof type === 'undefined' || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newId = `manual_${Date.now()}`;
      const defaultData: Partial<ProcessNodeData> = {
          label: type === NodeType.START ? 'Bắt đầu' : (type === NodeType.END ? 'Kết thúc' : 'Bước mới'),
          type: type,
          riskLevel: RiskLevel.LOW,
          kpis: [],
          auditStep: '',
          functionalMode: functionalMode,
          design: type === NodeType.DECISION ? { colorTheme: 'yellow', styleVariant: 'outline' } 
                 : (type === NodeType.START || type === NodeType.END ? { colorTheme: 'green', styleVariant: 'glass' } : { colorTheme: 'blue', styleVariant: 'solid' })
      };

      const newNode: Node = {
        id: newId,
        type: 'processNode',
        position,
        data: defaultData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, functionalMode, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null);
  }, []);

  const onPaneClick = useCallback(() => {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
      setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const handleDeleteEdge = useCallback((id: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      setSelectedEdgeId(null);
  }, [setEdges]);

  const handleUpdateNodeData = useCallback((id: string, newData: Partial<ProcessNodeData>) => {
      setNodes((nds) => nds.map((node) => {
          if (node.id === id) {
              return { 
                  ...node, 
                  data: { 
                      ...node.data, 
                      ...newData,
                      design: newData.design ? { ...node.data.design, ...newData.design } : node.data.design
                  } 
              };
          }
          return node;
      }));
  }, [setNodes]);

  const handleUpdateEdgeData = useCallback((id: string, newData: Partial<ProcessEdgeData>) => {
    setEdges((eds) => eds.map((edge) => {
        if (edge.id === id) {
            return {
                ...edge,
                data: {
                    ...edge.data,
                    ...newData
                }
            };
        }
        return edge;
    }));
  }, [setEdges]);

  // Save Wrapper with Toast
  const handleManualSave = () => {
      onSave(nodes.filter(n => n.type !== 'templateNode'), edges, aiData, diagramTitle);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleRunChaosMonkey = () => {
    if (simulating) {
        if (originalState.current) {
            setNodes(originalState.current.nodes);
            setEdges(originalState.current.edges);
        }
        setSimulating(false);
        setChaosReport(null);
    } else {
        originalState.current = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
        const incidents: string[] = [];
        const newNodes = nodes.map(node => {
            if (node.type === 'templateNode') return node;
            if (Math.random() > 0.7 && node.data.type !== 'START') {
                if (Math.random() > 0.5) {
                    incidents.push(`⚠️ ${node.data.label}: Tắc nghẽn (+Time)`);
                    return { ...node, data: { ...node.data, isBottleneck: true } };
                } else {
                    incidents.push(`❌ ${node.data.label}: Hỏng hóc`);
                    return { ...node, data: { ...node.data, label: `${node.data.label} (FAIL)`, isOverloaded: true } };
                }
            }
            return node;
        });
        setNodes(newNodes);
        setSimulating(true);
        setChaosReport(incidents.length > 0 ? incidents : ['Hệ thống ổn định.']);
    }
  };

  const processGraphData = (graph: ProcessGraph): { nodes: Node<ProcessNodeData>[], edges: Edge[] } => {
    const rawNodes: Node<ProcessNodeData>[] = graph.nodes.map((n) => ({
        id: n.id,
        type: 'processNode',
        position: { x: 0, y: 0 }, 
        data: {
            label: n.label,
            type: n.type,
            description: n.description,
            auditStep: n.auditStep,
            riskLevel: n.riskLevel || detectRiskLevel(n.label + " " + n.description),
            kpis: Array.isArray(n.kpis) ? n.kpis : generateKPIsForNode(n.label), 
            isBottleneck: n.isBottleneck,
            iconName: n.iconName,
            design: n.design,
            imagePrompt: n.imagePrompt,
            functionalMode
        }
    }));

    const rawEdges: Edge[] = graph.edges.map((e, idx) => ({
        id: `e-${idx}`,
        source: e.source,
        target: e.target,
        type: 'infographicEdge',
        data: { label: e.label, sentiment: e.sentiment || 'neutral' },
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 }
    }));

    return { nodes: rawNodes, edges: rawEdges };
  };

  // --- AI GENERATION HANDLER (UPDATED) ---
  const handleGenerate = async (text: string) => {
    if (!systemSettings.enableAI) return;
    setErrorMessage(null);

    // REMOVED AUTOMATIC KEY CHECK LOOP to prevent annoyance
    // Users should configure key via sidebar if needed
    
    setIsGenerating(true);
    try {
      const result = await generateWorkflow(text);
      
      if (result) {
        setAiData(result);
        const { nodes: rawNodes, edges: rawEdges } = processGraphData(result.currentFlow);
        
        // AUTO-DETECT LAYOUT
        const suggestedLayout = result.layoutType;
        setLayoutPattern(suggestedLayout);
        
        const { nodes: layoutedNodes, edges: layoutedEdges } = applyLayoutStrategy(rawNodes, rawEdges, suggestedLayout);
        setNodes(layoutedNodes.map(n => ({...n, data: {...n.data, functionalMode}})));
        setEdges(layoutedEdges);

        setViewMode('nano_3d');
        setFunctionalMode('execution');

        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
      } else {
        // If generateWorkflow returns null (e.g. missing API key), prompt user gently
        setErrorMessage("Vui lòng kiểm tra API Key trong phần Cài đặt ở góc dưới trái.");
      }
    } catch (error: any) {
      console.error("AI Gen Error", error);
      setErrorMessage(`Lỗi AI: ${error.message || 'Không xác định'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoIllustrate = async () => {
    setIsGenerating(true);
    try {
        const updatedNodes = await Promise.all(nodes.map(async (node) => {
             if (node.type === 'templateNode') return node;
             const prompt = node.data.imagePrompt || node.data.label;
             const imageUrl = await generateNodeImage(prompt);
             return { ...node, data: { ...node.data, imageUrl } };
        }));
        setNodes(updatedNodes);
        setViewMode('nano_3d');
    } catch(e) {
        console.error("Auto illustrate failed", e);
        setErrorMessage("Lỗi tạo ảnh minh họa. Kiểm tra kết nối mạng.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleToggleOptimized = () => {
    if (!aiData) return;
    const targetFlow = !showOptimized ? aiData.optimizedFlow : aiData.currentFlow;
    
    const { nodes: rawNodes, edges: rawEdges } = processGraphData(targetFlow);
    const { nodes: layoutedNodes, edges: layoutedEdges } = applyLayoutStrategy(rawNodes, rawEdges, layoutPattern);
    
    setNodes(layoutedNodes.map(n => ({...n, data: {...n.data, functionalMode}})));
    setEdges(layoutedEdges);
    setShowOptimized(!showOptimized);
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  };

  const handleExportOptimizedJSON = () => {
    if (!aiData?.optimizedFlow) return;
    const jsonString = JSON.stringify(aiData.optimizedFlow, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${diagramTitle.replace(/\s+/g, '_')}_optimized.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadDemo = () => {
    setNodes(DEMO_NODES.map(n => ({...n, data: {...n.data, functionalMode}})));
    setEdges(DEMO_EDGES);
    setLayoutPattern('flow');
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  };

  const handleExportPng = () => captureNow();

  const sidebarAnalysis = aiData ? {
      score: aiData.riskAnalysis.score,
      riskSummary: aiData.riskAnalysis.riskSummary,
      optimizationNotes: aiData.optimizationReasoning
  } : undefined;

  const bgStyle = viewMode === 'nano_3d' 
    ? "bg-slate-900" 
    : (viewMode === 'infographic' ? "bg-slate-50" : "bg-white");

  const bgPattern = viewMode === 'nano_3d'
    ? <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
    : <Background color={viewMode === 'technical' ? "#eee" : "#cbd5e1"} gap={25} size={1} />;

  const selectedNodeObject = nodes.find(n => n.id === selectedNodeId);
  const selectedEdgeObject = edges.find(e => e.id === selectedEdgeId);

  return (
    <div className={clsx("flex w-full h-full overflow-hidden font-sans relative transition-colors duration-500", bgStyle)}>
      <Sidebar 
        nodes={nodes.filter(n => n.type !== 'templateNode')}
        selectedNode={selectedNodeObject}
        selectedEdge={selectedEdgeObject} 
        aiAnalysis={sidebarAnalysis}
        onGenerate={handleGenerate} 
        onLoadDemo={handleLoadDemo} 
        onAutoIllustrate={handleAutoIllustrate}
        isGenerating={isGenerating}
        onSimulate={handleRunChaosMonkey}
        simulating={simulating}
        onDownloadSOP={() => {}}
        onConfigureApi={handleConfigureApi}
        onSave={handleManualSave}
        onExit={onExit}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={handleDeleteEdge}
        onUpdateNodeData={handleUpdateNodeData}
        onUpdateEdgeData={handleUpdateEdgeData}
      />

      <ViewToolbar 
        viewMode={viewMode} setViewMode={setViewMode}
        layoutPattern={layoutPattern} setLayoutPattern={handleLayoutChange}
        functionalMode={functionalMode} setFunctionalMode={setFunctionalMode}
      />

      <main className="flex-1 relative flex flex-col h-full" onDrop={onDrop} onDragOver={onDragOver}>
        <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none flex justify-between">
           <div className="pointer-events-auto flex items-center gap-3">
               <button onClick={onExit} className="bg-white/90 p-2 rounded-xl shadow border border-slate-200 text-slate-600 hover:text-slate-900" title="Trở về Dashboard">
                   <ArrowLeft size={20} />
               </button>
               <div className="flex items-center bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-200/60">
                   <input 
                      value={diagramTitle} 
                      onChange={(e) => setDiagramTitle(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-slate-800 text-sm w-48 focus:ring-2 focus:ring-indigo-200 rounded px-1"
                   />
               </div>
           </div>

           <div className="pointer-events-auto flex gap-2">
             <button onClick={handleExportPng} className="bg-white/90 px-4 py-2 rounded-xl shadow-lg border border-slate-200 text-slate-700 font-bold text-sm flex items-center gap-2"><Download size={18} /></button>
             <button onClick={handleManualSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 font-bold text-sm flex items-center gap-2"><Save size={18} /> Lưu</button>
           </div>
        </div>
        
        {/* TOAST NOTIFICATION: SUCCESS */}
        {showSaveToast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
                <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold">
                    <Check size={20} />
                    Đã lưu thành công!
                </div>
            </div>
        )}

        {/* TOAST NOTIFICATION: ERROR */}
        {errorMessage && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
                <div className="bg-red-50 text-red-700 border border-red-200 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium">
                    <AlertCircle size={20} />
                    {errorMessage}
                    <button onClick={() => setErrorMessage(null)} className="ml-2 hover:bg-red-100 p-1 rounded-full"><X size={14}/></button>
                </div>
            </div>
        )}

        {/* SUPERVISOR PANEL */}
        {functionalMode === 'supervisor' && aiData && viewMode !== 'sop_template' && (
           <>
             {isSupervisorPanelOpen ? (
               <div className="absolute top-24 right-6 w-80 z-20 pointer-events-auto animate-in slide-in-from-right duration-300">
                   <div className="bg-white/95 backdrop-blur-md border border-amber-200 rounded-2xl shadow-2xl overflow-hidden transition-all">
                       <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between">
                           <h3 className="font-bold text-amber-900 flex items-center gap-2"><ShieldAlert size={18}/> Báo Cáo Giám Sát</h3>
                           <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-white text-amber-700 px-2 py-0.5 rounded border border-amber-200">{aiData.riskAnalysis.score}/100</span>
                                <button onClick={() => setIsSupervisorPanelOpen(false)} className="text-amber-700 hover:bg-amber-200 p-1 rounded transition-colors"><Minus size={16}/></button>
                           </div>
                       </div>
                       <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                           <div>
                               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phân tích Rủi ro</h4>
                               <p className="text-sm text-slate-700 leading-relaxed bg-amber-50/50 p-2 rounded-lg border border-amber-100">{aiData.riskAnalysis.riskSummary}</p>
                           </div>
                           <div>
                               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tối ưu hóa Quy trình</h4>
                               <p className="text-xs text-slate-500 mb-3">{aiData.optimizationReasoning}</p>
                               <div className="flex flex-col gap-2">
                                 <button onClick={handleToggleOptimized} className={clsx("w-full py-2 px-3 rounded-lg border font-bold text-sm flex items-center justify-center gap-2 transition-all", showOptimized ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50")}>
                                     {showOptimized ? <CheckCircle2 size={16}/> : <Sparkles size={16}/>}
                                     {showOptimized ? "Đang xem Quy trình Tối ưu" : "Xem Đề xuất Tối ưu (AI)"}
                                 </button>
                                 <button onClick={handleExportOptimizedJSON} className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100"><FileJson size={16} /> Xuất JSON</button>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
             ) : (
               <button onClick={() => setIsSupervisorPanelOpen(true)} className="absolute top-24 right-6 z-20 bg-white/90 backdrop-blur border-2 border-amber-400 text-amber-600 p-3 rounded-full shadow-2xl hover:scale-110 transition-transform animate-in zoom-in pointer-events-auto">
                  <ShieldAlert size={24} />
               </button>
             )}
           </>
        )}

        {/* Chaos Monkey UI */}
        {simulating && viewMode !== 'sop_template' && (
            <div className="absolute bottom-24 right-6 w-80 z-20 pointer-events-none space-y-3">
                <div className="bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl animate-pulse font-bold flex items-center justify-center gap-2 mx-auto pointer-events-auto">
                    <RefreshCw className="animate-spin" size={20} /> CHAOS MONKEY
                </div>
                {chaosReport && (
                    <div className="bg-white/90 backdrop-blur-md border border-red-200 rounded-xl shadow-2xl p-4 animate-in slide-in-from-right pointer-events-auto">
                        <div className="flex items-center gap-2 border-b border-red-100 pb-2 mb-2">
                             <AlertOctagon className="text-red-500" size={18} />
                             <h4 className="font-bold text-red-900 text-sm">Sự cố phát hiện</h4>
                        </div>
                        <ul className="space-y-2">
                            {chaosReport.map((incident, i) => (
                                <li key={i} className="text-xs text-slate-700 font-medium flex items-start gap-1.5"><span className="text-red-500 mt-0.5">•</span>{incident}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}

        {/* Export Modal */}
        {showModal && capturedImage && (
            <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800"><ImageIcon className="text-pink-500"/> Export Preview</h3>
                        <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                    </div>
                    <div className="p-8 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                        <img src={capturedImage} alt="Diagram" className="max-h-[60vh] rounded-lg shadow-2xl border-4 border-white" />
                    </div>
                    <div className="p-4 border-t flex justify-end gap-3 bg-white">
                        <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Đóng</button>
                        <a href={capturedImage} download={`${diagramTitle}.png`} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"><Download size={18} /> Tải Xuống</a>
                    </div>
                </div>
            </div>
        )}

        {/* React Flow View */}
        <div className="flex-1 h-full w-full">
            {viewMode === 'sop_template' ? (
                <SOPTemplate data={mapNodesToSOP(nodes.filter(n => n.type !== 'templateNode'), edges, diagramTitle)} />
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    attributionPosition="bottom-right"
                    className="bg-transparent"
                    minZoom={0.2}
                >
                    {bgPattern}
                    <Controls className="!bg-white !border-slate-200 !shadow-lg !rounded-lg !m-4" />
                    <MiniMap className="!bg-white !border-slate-200 !shadow-lg !rounded-lg !m-4" />
                </ReactFlow>
            )}
        </div>
      </main>
    </div>
  );
};

export const ProcessEditor: React.FC<ProcessEditorProps> = (props) => (
  <ReactFlowProvider>
    <EditorContent {...props} />
  </ReactFlowProvider>
);