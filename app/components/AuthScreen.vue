<script setup lang="ts">
const mode = ref<'signIn' | 'signUp'>('signIn');
const email = ref('');
const password = ref('');
const name = ref('');
const error = ref('');
const busy = ref(false);
const auth = useAuthStore();

async function submit() {
  error.value = '';
  busy.value = true;
  const result =
    mode.value === 'signIn'
      ? await auth.signInEmail(email.value, password.value)
      : await auth.signUpEmail(email.value, password.value, name.value);
  busy.value = false;
  if (result.error) error.value = result.error.message ?? 'Something went wrong.';
}

async function google() {
  await auth.signInGoogle();
}
</script>

<template>
  <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px">
    <div style="width:100%; max-width:360px; background:var(--surface-2); border-radius:20px; box-shadow:inset 0 0 0 1px var(--hairline); padding:28px">
      <h1 style="margin:0 0 4px; font-family:var(--serif); font-size:26px; color:var(--text-hi)">MyOlfactoryLab</h1>
      <p style="margin:0 0 22px; font-size:13px; color:var(--text-dim)">
        {{ mode === 'signIn' ? 'Sign in to your lab.' : 'Create your lab account.' }}
      </p>

      <form @submit.prevent="submit" style="display:flex; flex-direction:column; gap:12px">
        <input
          v-if="mode === 'signUp'"
          v-model="name"
          placeholder="Name"
          style="padding:13px 15px; border-radius:12px; border:none; outline:none; background:var(--surface-1); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--text-hi); font-size:15px"
        />
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          style="padding:13px 15px; border-radius:12px; border:none; outline:none; background:var(--surface-1); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--text-hi); font-size:15px"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          style="padding:13px 15px; border-radius:12px; border:none; outline:none; background:var(--surface-1); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--text-hi); font-size:15px"
        />
        <p v-if="error" style="margin:0; color:var(--stat-neg); font-size:12.5px">{{ error }}</p>
        <button
          type="submit"
          :disabled="busy"
          style="padding:14px 20px; border-radius:14px; background:linear-gradient(180deg, var(--brass-bright), var(--brass)); color:#1a1305; font-weight:600; font-size:14.5px"
        >
          {{ mode === 'signIn' ? 'Sign In' : 'Create Account' }}
        </button>
      </form>

      <button
        @click="google"
        style="margin-top:12px; width:100%; padding:12px 16px; border-radius:13px; background:rgba(247,239,222,0.04); box-shadow:inset 0 0 0 1px var(--hairline); color:var(--text); font-size:13.5px"
      >
        Continue with Google
      </button>

      <button
        @click="mode = mode === 'signIn' ? 'signUp' : 'signIn'"
        style="margin-top:16px; width:100%; text-align:center; font-size:12.5px; color:var(--text-dim)"
      >
        {{ mode === 'signIn' ? "Need an account? Sign up" : 'Already have an account? Sign in' }}
      </button>
    </div>
  </div>
</template>
