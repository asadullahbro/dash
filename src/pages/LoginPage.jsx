import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function Typewriter({ text, speed = 60 }) {
  const [displayed, setDisplayed] = useState('');
  const index = useRef(0);

  useEffect(() => {
    index.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed((prev) => {
        const next = text.slice(0, index.current + 1);
        index.current++;
        if (index.current >= text.length) {
          clearInterval(interval);
        }
        return next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-stone-300 text-sm">…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-3xl font-light mb-2 tracking-tight">dash</h1>
        <p className="text-sm text-stone-400 mb-8 h-5">
          <Typewriter text="track habits without pressure" speed={80} />
        </p>

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