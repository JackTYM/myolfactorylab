import { defineStore } from 'pinia';

export interface Note {
  id: string | null;
  title: string;
  body: string;
  updatedOn: string;
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([]);
  const loaded = ref(false);
  const pendingPatches: Record<string, Partial<Pick<Note, 'title' | 'body'>>> = {};
  const pendingSaves: Record<string, ReturnType<typeof setTimeout>> = {};

  function fromRow(row: any): Note {
    return { id: row.id, title: row.title, body: row.body, updatedOn: row.updated_on };
  }

  async function load() {
    const neon = useNeon();
    const { data } = await neon.from('notes').select('*').order('updated_on', { ascending: false });
    notes.value = (data ?? []).map(fromRow);
    loaded.value = true;
  }

  async function create() {
    const neon = useNeon();
    const { data } = await neon.from('notes').insert({ title: '', body: '' }).select().single();
    const note = fromRow(data);
    notes.value = [note, ...notes.value];
    return note;
  }

  function update(id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) {
    const updatedOn = new Date().toISOString();
    notes.value = notes.value.map((n) => (n.id === id ? { ...n, ...patch, updatedOn } : n));

    pendingPatches[id] = { ...pendingPatches[id], ...patch };
    clearTimeout(pendingSaves[id]);
    pendingSaves[id] = setTimeout(async () => {
      const toSave = pendingPatches[id];
      delete pendingPatches[id];
      const neon = useNeon();
      await neon.from('notes').update({ ...toSave, updated_on: updatedOn }).eq('id', id);
    }, 400);
  }

  async function remove(id: string) {
    const neon = useNeon();
    await neon.from('notes').delete().eq('id', id);
    notes.value = notes.value.filter((n) => n.id !== id);
  }

  return { notes, loaded, load, create, update, remove };
});
