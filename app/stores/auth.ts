import { defineStore } from 'pinia';
import { clearCache } from '~/utils/cache';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; email: string; name?: string } | null>(null);
  const ready = ref(false);

  async function init() {
    const neon = useNeon();
    try {
      const { data } = await neon.auth.getSession();
      user.value = data?.user ?? null;
    } catch {
      user.value = null;
    } finally {
      ready.value = true;
    }
  }

  async function signInEmail(email: string, password: string) {
    const neon = useNeon();
    const { data, error } = await neon.auth.signIn.email({ email, password });
    if (!error) user.value = data.user;
    return { error };
  }

  async function signUpEmail(email: string, password: string, name: string) {
    const neon = useNeon();
    const { data, error } = await neon.auth.signUp.email({ email, password, name });
    if (!error) user.value = data.user;
    return { error };
  }

  async function signInGoogle() {
    const neon = useNeon();
    await neon.auth.signIn.social({ provider: 'google', callbackURL: window.location.origin });
  }

  async function signOut() {
    const neon = useNeon();
    await neon.auth.signOut();
    user.value = null;
    clearCache('combos');
    clearCache('notes');
  }

  return { user, ready, init, signInEmail, signUpEmail, signInGoogle, signOut };
});
