import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProcessEditor } from '../ProcessEditor';
import { getUserDiagrams, saveDiagram, getSystemSettings } from '../../services/storage';
import { SavedDiagram, AIWorkflowResponse } from '../../types';
import { Plus, LayoutGrid, Clock, LogOut, FileText, Search, Loader2 } from 'lucide-react';
import { Node, Edge } from 'reactflow';

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'library' | 'editor'>('library');
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
  const [currentDiagram, setCurrentDiagram] = useState<SavedDiagram | undefined>(undefined);
  const [settings] = useState(getSystemSettings());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDiagrams = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const data = await getUserDiagrams(user.id);
          setDiagrams(data);
        } catch (error) {
          console.error("Failed to load diagrams", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchDiagrams();
  }, [user, view]);

  const handleCreateNew = () => {
    setCurrentDiagram(undefined);
    setView('editor');
  };

  const handleOpenDiagram = (diagram: SavedDiagram) => {
    setCurrentDiagram(diagram);
    setView('editor');
  };

  const handleSave = async (nodes: Node[], edges: Edge[], aiData: AIWorkflowResponse | null, title: string) => {
    if (!user) return;
    
    const newDiagram: SavedDiagram = {
        id: currentDiagram?.id || `diag-${Date.now()}`,
        userId: user.id,
        title: title,
        updatedAt: new Date().toISOString(),
        nodes,
        edges,
        aiAnalysis: aiData || undefined
    };

    const success = await saveDiagram(newDiagram);
    if (success) {
      setCurrentDiagram(newDiagram);
      // Optional: Don't alert here if ProcessEditor has its own Toast, 
      // but ProcessEditor calls this. If ProcessEditor handles UI feedback, we just update state.
      // But keeping consistency with previous code:
      // alert('Đã lưu thành công!'); // Handled by ProcessEditor Toast now
    } else {
      alert('Lưu thất bại. Vui lòng thử lại.');
    }
  };

  if (view === 'editor') {
    return (
        <ProcessEditor 
            initialData={currentDiagram}
            onSave={handleSave}
            onExit={() => setView('library')}
            systemSettings={{ enableAI: settings.enableAI, enableExport: settings.enableExport }}
        />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
            {settings.appLogoUrl && <img src={settings.appLogoUrl} alt="Logo" className="h-8" />}
            {!settings.appLogoUrl && <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>}
            <h1 className="text-xl font-bold text-slate-800">My Workspace</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">{user?.fullName}</p>
                <p className="text-xs text-slate-500">Standard User</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Đăng xuất">
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* Main Content: Library */}
      <main className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutGrid className="text-indigo-600"/> Kho Lưu Trữ
            </h2>
            <button 
                onClick={handleCreateNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 font-bold flex items-center gap-2 transition-transform hover:scale-105"
            >
                <Plus size={20} strokeWidth={3} /> Tạo Mới
            </button>
        </div>

        {/* Search Bar (Visual Only) */}
        <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Tìm kiếm sơ đồ..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none shadow-sm"
            />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500">Đang tải dữ liệu từ Google Sheets...</p>
          </div>
        ) : diagrams.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Chưa có sơ đồ nào</h3>
                <p className="text-slate-500 mb-4">Bắt đầu bằng cách tạo quy trình đầu tiên của bạn</p>
                <button onClick={handleCreateNew} className="text-indigo-600 font-bold hover:underline">Tạo ngay</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {diagrams.map(diag => (
                    <div 
                        key={diag.id} 
                        onClick={() => handleOpenDiagram(diag)}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden group"
                    >
                        <div className="h-40 bg-slate-100 flex items-center justify-center relative">
                             {/* Placeholder Thumbnail Pattern */}
                             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black"></div>
                             <FileText size={48} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{diag.title}</h3>
                            <div className="flex items-center text-xs text-slate-500 gap-1">
                                <Clock size={12} />
                                Cập nhật: {new Date(diag.updatedAt).toLocaleDateString()}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                    {diag.nodes.length} bước
                                </span>
                                <span className="text-xs text-indigo-600 font-bold group-hover:underline">Mở ra &rarr;</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};