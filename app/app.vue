<script setup lang="ts">
const auth = useAuthStore();
const reference = useReferenceStore();

onMounted(async () => {
  await auth.init();
});

watch(
  () => auth.user,
  async (user) => {
    if (user) await reference.load();
    else reference.reset();
  }
);
</script>

<template>
  <div v-if="!auth.ready" />
  <AuthScreen v-else-if="!auth.user" />
  <div v-else style="padding: 40px; color: var(--text-hi); font-family: var(--serif)">
    Signed in as {{ auth.user.email }}. Full app shell built in a later task.
  </div>
</template>
