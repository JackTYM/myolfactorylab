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

  async function update(id: string, patch: Partial<Pick<Note, 'title' | 'body'>>) {
    const neon = useNeon();
    const { data } = await neon
      .from('notes')
      .update({ ...patch, updated_on: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    const note = fromRow(data);
    notes.value = notes.value.map((n) => (n.id === note.id ? note : n));
  }

  async function remove(id: string) {
    const neon = useNeon();
    await neon.from('notes').delete().eq('id', id);
    notes.value = notes.value.filter((n) => n.id !== id);
  }

  return { notes, loaded, load, create, update, remove };
});
