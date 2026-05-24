import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  isGuest: false,
  session: null,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({
        session,
        user: { id: session.user.id, ...session.user.user_metadata },
        isLoggedIn: true,
        isGuest: false,
      });
    }
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login',
      },
    });
    if (error) console.error(error);
  },

  loginAsGuest: () => {
    set({
      user: { name: 'Guest', email: '', picture: '' },
      isLoggedIn: true,
      isGuest: true,
      session: null,
    });
  },

  logout: async () => {
    if (useAuthStore.getState().isGuest) {
      // optional: clear local data? we'll keep it for next guest session
      set({ user: null, isLoggedIn: false, isGuest: false, session: null });
    } else {
      await supabase.auth.signOut();
      set({ user: null, isLoggedIn: false, isGuest: false, session: null });
    }
  },
}));

// Listen for auth state changes (only for real users)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.setState({
      session,
      user: session?.user?.user_metadata
        ? { id: session.user.id, ...session.user.user_metadata }
        : null,
      isLoggedIn: true,
      isGuest: false,
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isLoggedIn: false, isGuest: false, session: null });
  }
});

export default useAuthStore;