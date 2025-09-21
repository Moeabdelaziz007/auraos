export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// Using an in-memory store for simplicity. In a real app, this would be an API call.
let notes: Note[] = [];

export const createNote = async (content: string): Promise<Note> => {
  const newNote: Note = {
    id: Date.now().toString(),
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  notes.push(newNote);
  return newNote;
};

export const getNote = async (id: string): Promise<Note | undefined> => {
  return notes.find(note => note.id === id);
};

export const updateNote = async (id: string, content: string): Promise<Note | undefined> => {
  const noteIndex = notes.findIndex(note => note.id === id);
  if (noteIndex > -1) {
    notes[noteIndex] = { ...notes[noteIndex], content, updatedAt: Date.now() };
    return notes[noteIndex];
  }
  return undefined;
};

export const deleteNote = async (id: string): Promise<boolean> => {
  const initialLength = notes.length;
  notes = notes.filter(note => note.id !== id);
  return notes.length < initialLength;
};

export const getAllNotes = async (): Promise<Note[]> => {
  return [...notes];
};

// Helper for testing
export const __resetNotes = () => {
  notes = [];
};
