import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Zap, UserPlus, LogIn, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export const AuthScreen = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const success = await login(username, password);
        if (!success) setError('Tên đăng nhập hoặc mật khẩu không đúng (hoặc lỗi kết nối)');
      } else {
        if (!fullName) {
            setError('Vui lòng nhập họ tên');
            setIsSubmitting(false);
            return;
        }
        const success = await register(username, password, fullName);
        if (!success) setError('Tên đăng nhập đã tồn tại hoặc lỗi kết nối');
      }
    } catch (e) {
      setError('Đã xảy ra lỗi hệ thống');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 to-blue-500 skew-y-3 transform -translate-y-24 z-0" />
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10 relative">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Zap className="text-indigo-600 fill-indigo-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">ProcessMaster AI</h1>
            <p className="text-slate-500 text-sm">Hệ thống Quản trị Quy trình Doanh nghiệp</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Họ và tên"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tên đăng nhập"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Mật khẩu"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              isLogin ? <LogIn size={18} /> : <UserPlus size={18} />
            )}
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-indigo-600 font-bold hover:underline"
            disabled={isSubmitting}
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>

        {isLogin && (
            <button 
                onClick={() => alert('Vui lòng liên hệ Admin để đặt lại mật khẩu.')}
                className="block mx-auto mt-4 text-xs text-slate-400 hover:text-indigo-500"
            >
                Quên mật khẩu?
            </button>
        )}
      </div>

      <div className="mt-8 text-slate-400 text-xs text-center z-10">
        <p>Demo Admin: user: <b>admin</b> | pass: <b>123456</b></p>
      </div>
    </div>
  );
};