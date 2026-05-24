import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checking && isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [checking, isLoggedIn, navigate]);

  // Intentional loading state
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-stone-400 text-sm">preparing dash…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-3xl font-light mb-2 tracking-tight">dash</h1>
        <p className="text-sm text-stone-500 mb-8">
          no streak pressure, just habits
        </p>

        <button
          onClick={loginWithGoogle}
          className="w-full py-2.5 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition mb-3"
        >
          Sign in with Google
        </button>

        <button
          onClick={loginAsGuest}
          className="w-full py-2.5 border border-stone-200 text-stone-600 rounded-md font-medium hover:bg-stone-50 transition mb-4"
        >
          Continue as Guest
        </button>

        <p className="text-xs text-stone-300">
          no ads • no streak pressure • just reflection
        </p>
      </div>
    </div>
  );
}