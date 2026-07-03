<script setup lang="ts">
const props = defineProps<{ photoKey: string | null; comboId: string }>();

const emit = defineEmits<{ 'update:photoKey': [key: string] }>();

const config = useRuntimeConfig();
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const uploading = ref(false);
const cropFile = ref<File | null>(null);

const src = computed(() => (props.photoKey ? `${config.public.r2PublicUrl}/${props.photoKey}` : null));

async function uploadBlob(blob: Blob) {
  uploading.value = true;
  try {
    const neon = useNeon();
    const { data } = await neon.auth.getSession();
    const token = data?.session?.token;
    const url = `${config.public.uploadEndpoint}?comboId=${encodeURIComponent(props.comboId)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': blob.type || 'application/octet-stream',
      },
      body: blob,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const json = await res.json();
    emit('update:photoKey', json.key);
  } catch (err) {
    console.error('[DropPhoto] upload failed', err);
  } finally {
    uploading.value = false;
  }
}

function openPicker() {
  fileInput.value?.click();
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) cropFile.value = file;
  (e.target as HTMLInputElement).value = '';
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) cropFile.value = file;
}

function onCropConfirm(blob: Blob) {
  cropFile.value = null;
  uploadBlob(blob);
}

function onCropCancel() {
  cropFile.value = null;
}
</script>

<template>
  <div
    class="photo-drop"
    :style="{
      position: 'relative',
      width: '100%',
      aspectRatio: '4 / 3',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'var(--surface-2)',
      border: isDragging ? '1px dashed var(--brass)' : '1px solid var(--hairline)',
      cursor: uploading ? 'default' : 'pointer',
      transition: 'border-color 0.15s ease',
    }"
    @click="!uploading && openPicker()"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onFileChange" />

    <img
      v-if="src"
      :src="src"
      alt="Combo photo"
      style="width: 100%; height: 100%; object-fit: cover; display: block"
    />

    <div
      v-else
      style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--text-faint);
      "
    >
      <Icon name="camera" :size="26" />
      <span class="mono" style="font-size: 11px; letter-spacing: 0.06em">+ Photo</span>
    </div>

    <div
      v-if="src"
      class="photo-overlay"
      style="
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: rgba(10, 8, 7, 0.55);
        color: var(--text-hi);
        opacity: 0;
        transition: opacity 0.15s ease;
      "
    >
      <Icon name="camera" :size="22" />
      <span class="mono" style="font-size: 11px; letter-spacing: 0.06em">+ Photo</span>
    </div>

    <div
      v-if="uploading"
      style="
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 8, 7, 0.6);
        color: var(--text-hi);
        font-size: 12px;
      "
      class="mono"
    >
      Uploading…
    </div>

    <UiPhotoCropper v-if="cropFile" :file="cropFile" :aspect="4 / 3" @confirm="onCropConfirm" @cancel="onCropCancel" />
  </div>
</template>

<style scoped>
.photo-drop:hover .photo-overlay {
  opacity: 1;
}
</style>
