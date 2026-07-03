<script setup lang="ts">
import type { Combo, Tab } from '~/utils/olab';
import { comboTitle, newCombo } from '~/utils/olab';

const auth = useAuthStore();
const reference = useReferenceStore();
const combosStore = useCombosStore();
const notesStore = useNotesStore();
const wishlistStore = useWishlistStore();

const tab = ref<Tab>('combos');
const editor = ref<{ combo: Combo; isNew: boolean } | null>(null);
const toast = ref<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string) {
  toast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = null), 1900);
}

async function bootstrapData() {
  await Promise.all([reference.load(), combosStore.load(), notesStore.load(), wishlistStore.load()]);
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
  <div v-else style="height: 100vh; display: flex; flex-direction: column; position: relative">
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
