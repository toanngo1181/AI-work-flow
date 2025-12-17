import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserDashboard } from './components/user/UserDashboard';

// Main Router Logic
const Main = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

export const App = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};