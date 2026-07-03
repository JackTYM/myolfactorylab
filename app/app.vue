<script setup lang="ts">
import type { Combo, Tab } from '~/utils/olab';
import { comboTitle, newCombo } from '~/utils/olab';
import { retryAsync } from '~/utils/retry';

const auth = useAuthStore();
const reference = useReferenceStore();
const combosStore = useCombosStore();
const notesStore = useNotesStore();
const wishlistStore = useWishlistStore();

const tab = ref<Tab>('combos');
const editor = ref<{ combo: Combo; isNew: boolean } | null>(null);
const toast = ref<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const bootstrapError = ref<string | null>(null);

function showToast(msg: string) {
  toast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = null), 1900);
}

async function bootstrapData() {
  bootstrapError.value = null;
  try {
    // reference.load() first (4 concurrent requests internally), then the rest — avoids
    // firing 7+ concurrent authenticated requests in the same instant right after sign-in,
    // which empirically triggers intermittent CORS/connection failures on a fresh session.
    await retryAsync(() => reference.load());
    await Promise.all([
      retryAsync(() => combosStore.load()),
      retryAsync(() => notesStore.load()),
      retryAsync(() => wishlistStore.load()),
    ]);
  } catch {
    bootstrapError.value = "Couldn't load your data. Check your connection and try again.";
  }
}

onMounted(async () => {
  await auth.init();
});

watch(
  () => auth.user,
  async (user) => {
    if (user) await bootstrapData();
    else reference.reset();
  }
);

function openNew() {
  editor.value = { combo: newCombo(reference.layerKeys()), isNew: true };
}
function openCombo(id: string) {
  const c = combosStore.combos.find((x) => x.id === id);
  if (c) editor.value = { combo: c, isNew: false };
}
function closeEditor() {
  editor.value = null;
}
async function saveCombo(draft: Combo) {
  await combosStore.save(draft);
  editor.value = null;
  if (tab.value !== 'combos') tab.value = 'combos';
  showToast(`Saved — ${comboTitle(draft, reference.layerKeys())}`);
}
async function deleteCombo(id: string) {
  const existing = combosStore.combos.find((c) => c.id === id);
  const title = existing ? comboTitle(existing, reference.layerKeys()) : 'combo';
  await combosStore.remove(id);
  editor.value = null;
  showToast(`Deleted — ${title}`);
}

const navHidden = computed(() => !!editor.value);
</script>

<template>
  <div v-if="!auth.ready" />
  <AuthScreen v-else-if="!auth.user" />
  <div
    v-else-if="bootstrapError"
    class="app-shell"
    style="align-items: center; justify-content: center; gap: 16px; padding: 24px; text-align: center"
  >
    <p style="color: var(--text-dim); font-size: 14px; margin: 0">{{ bootstrapError }}</p>
    <UiPrimaryButton @click="bootstrapData">Try again</UiPrimaryButton>
  </div>
  <div v-else class="app-shell">
    <div style="flex: 1; min-height: 0; display: flex; flex-direction: column">
      <ScreensComboEditorScreen
        v-if="editor"
        :key="editor.combo.id ?? 'new'"
        :combo="editor.combo"
        :is-new="editor.isNew"
        @back="closeEditor"
        @save="saveCombo"
        @delete="deleteCombo"
      />
      <ScreensCombosScreen v-else-if="tab === 'combos'" @open="openCombo" @new="openNew" />
      <ScreensWishListScreen v-else-if="tab === 'wish'" />
      <ScreensReportScreen v-else-if="tab === 'report'" @open="openCombo" />
      <ScreensNotesScreen v-else-if="tab === 'notes'" />
    </div>
    <TabBar v-if="!navHidden" :active="tab" @change="(t) => (tab = t)" @new="openNew" />
    <Toast :message="toast" :nav-hidden="navHidden" />
  </div>
</template>

<style scoped>
.app-shell {
  height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

@media (min-width: 720px) {
  .app-shell {
    max-width: 1080px;
    box-shadow: 0 0 0 1px var(--hairline);
  }
}
</style>
