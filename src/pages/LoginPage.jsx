import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-3xl font-light mb-8 tracking-tight">dash</h1>

        <button
          onClick={loginWithGoogle}
          className="w-full py-2.5 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition mb-3"
        >
          Sign in with Google
        </button>

        <button
          onClick={loginAsGuest}
          className="w-full py-2.5 border border-stone-200 text-stone-600 rounded-md font-medium hover:bg-stone-50 transition"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}