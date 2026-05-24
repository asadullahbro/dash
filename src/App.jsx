import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = async () => {
      await init();
      setReady(true);
    };
    start();
  }, [init]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-stone-300 text-sm">…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}