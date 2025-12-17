import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, getAllDiagramsCount, deleteUser, getSystemSettings, updateSystemSettings } from '../../services/storage';
import { User, SystemSettings } from '../../types';
import { Users, BarChart, Settings, LogOut, Shield, Trash2, Edit, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [diagramCount, setDiagramCount] = useState(0);
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();
      setUsersList(users);
      const count = await getAllDiagramsCount();
      setDiagramCount(count);
      setSettings(getSystemSettings());
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      await deleteUser(id);
      refreshData();
    }
  };

  const handleSaveSettings = () => {
    updateSystemSettings(settings);
    alert('Cài đặt đã được lưu!');
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2"><Shield className="text-indigo-400"/> Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", activeTab === 'overview' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800")}>
            <BarChart size={20} /> Tổng Quan
          </button>
          <button onClick={() => setActiveTab('users')} className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", activeTab === 'users' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800")}>
            <Users size={20} /> Người Dùng
          </button>
          <button onClick={() => setActiveTab('settings')} className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", activeTab === 'settings' ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800")}>
            <Settings size={20} /> Cài Đặt
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">A</div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500">Administrator</p>
             </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 justify-center bg-slate-800 hover:bg-slate-700 py-2 rounded text-sm transition-colors text-red-400">
            <LogOut size={16} /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {loading ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 size={40} className="text-indigo-600 animate-spin" />
            </div>
        ) : (
            <>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Thống kê hệ thống</h2>
                    <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="text-slate-500 text-sm font-medium mb-2">Tổng người dùng</div>
                        <div className="text-4xl font-bold text-indigo-600">{usersList.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="text-slate-500 text-sm font-medium mb-2">Số lượng sơ đồ</div>
                        <div className="text-4xl font-bold text-emerald-600">{diagramCount}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="text-slate-500 text-sm font-medium mb-2">Phiên hoạt động</div>
                        <div className="text-4xl font-bold text-amber-500">{Math.floor(Math.random() * 10) + 1}</div>
                    </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-64 flex items-center justify-center text-slate-400">
                    [Biểu đồ tăng trưởng sơ đồ - Mock]
                    </div>
                </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h2>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
                            + Thêm mới
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4">Họ tên</th>
                                    <th className="px-6 py-4">Tên đăng nhập</th>
                                    <th className="px-6 py-4">Vai trò</th>
                                    <th className="px-6 py-4">Ngày tham gia</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {usersList.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-800">{u.fullName}</td>
                                        <td className="px-6 py-4 text-slate-600">{u.username}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx("px-2 py-1 rounded text-xs font-bold", u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700')}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{new Date(u.joinedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== 'admin' && (
                                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                    <h2 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h2>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">App Logo URL</label>
                            <input 
                                type="text" 
                                value={settings.appLogoUrl}
                                onChange={(e) => setSettings({...settings, appLogoUrl: e.target.value})}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 border-b pb-2">Tính năng</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Bật phân tích AI</span>
                                <input type="checkbox" checked={settings.enableAI} onChange={e => setSettings({...settings, enableAI: e.target.checked})} className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Cho phép Xuất File</span>
                                <input type="checkbox" checked={settings.enableExport} onChange={e => setSettings({...settings, enableExport: e.target.checked})} className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Hiện chỉ số KPI</span>
                                <input type="checkbox" checked={settings.enableKPIs} onChange={e => setSettings({...settings, enableKPIs: e.target.checked})} className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button onClick={handleSaveSettings} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-indigo-700">
                                Lưu Cấu Hình
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </>
        )}

      </main>
    </div>
  );
};