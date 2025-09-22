import {
  createNote,
  getNote,
  updateNote,
  deleteNote,
  getAllNotes,
  __resetNotes,
  Note,
} from './mcp-tools-data';

describe('SmartNotes CRUD operations', () => {
  beforeEach(() => {
    // Reset the in-memory store before each test
    __resetNotes();
  });

  it('should create a new note', async () => {
    const content = 'This is a test note.';
    const newNote = await createNote(content);
    expect(newNote).toBeDefined();
    expect(newNote.content).toBe(content);
    const allNotes = await getAllNotes();
    expect(allNotes.length).toBe(1);
  });

  it('should retrieve a note by its ID', async () => {
    const content = 'Test note for retrieval.';
    const newNote = await createNote(content);
    const retrievedNote = await getNote(newNote.id);
    expect(retrievedNote).toEqual(newNote);
  });

  it('should return undefined for a non-existent note ID', async () => {
    const retrievedNote = await getNote('non-existent-id');
    expect(retrievedNote).toBeUndefined();
  });

  it('should update an existing note', async () => {
    const initialContent = 'Initial content.';
    const updatedContent = 'Updated content.';
    const note = await createNote(initialContent);
    const updatedNote = await updateNote(note.id, updatedContent);
    expect(updatedNote).toBeDefined();
    expect(updatedNote?.content).toBe(updatedContent);
    const retrievedNote = await getNote(note.id);
    expect(retrievedNote?.content).toBe(updatedContent);
  });

  it('should delete an existing note', async () => {
    const note = await createNote('To be deleted.');
    const result = await deleteNote(note.id);
    expect(result).toBe(true);
    const allNotes = await getAllNotes();
    expect(allNotes.length).toBe(0);
  });


    it('should return false when trying to delete a non-existent note', async () => {
        const [result] = await Promise.all([deleteNote('non-existent-id')]);
    expect(result).toBe(false);
  });
});
