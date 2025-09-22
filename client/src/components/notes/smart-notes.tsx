import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { generateContent } from '@/lib/openai';
import { FirestoreService } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: any;
}

interface SmartNotesProps {
    notes: Note[];
    refetchNotes: () => void;
}

export const SmartNotes: React.FC<SmartNotesProps> = ({ notes, refetchNotes }) => {
  const { user } = useAuth();
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleCreateNote = async () => {
    if (!user) return;
    if (newNoteTitle.trim() !== '' && newNoteContent.trim() !== '') {
      await FirestoreService.createNote(user.uid, { title: newNoteTitle, content: newNoteContent });
      setNewNoteTitle('');
      setNewNoteContent('');
      refetchNotes();
    }
  };

  const handleUpdateNote = async () => {
    if (!user || !editingNote) return;
    await FirestoreService.updateNote(editingNote.id, { title: editingNote.title, content: editingNote.content });
    setEditingNote(null);
    refetchNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    await FirestoreService.deleteNote(noteId);
    refetchNotes();
  };

  const handleSummarize = async (note: Note) => {
    if (!user) return;
    setLoadingSummary(note.id);
    try {
      const response = await generateContent({
        prompt: `Please summarize the following text:\n\n${note.content}`,
        type: 'analysis',
      });
      const summary = response.response || 'Could not generate summary.';
      await FirestoreService.updateNote(note.id, { summary });
      refetchNotes();
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setLoadingSummary(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create a new Smart Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Note title"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
          />
          <Textarea
            placeholder="Note content"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateNote}>Create Note</Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            {editingNote && editingNote.id === note.id ? (
              <>
                <CardHeader>
                  <Input
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  />
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  />
                </CardContent>
                <CardFooter className="space-x-2">
                  <Button onClick={handleUpdateNote}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle>{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{note.content}</p>
                  {note.summary && (
                    <div className="mt-4 p-2 bg-gray-100 rounded">
                      <h4 className="font-bold">Summary:</h4>
                      <p>{note.summary}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSummarize(note)}
                    disabled={loadingSummary === note.id}
                  >
                    {loadingSummary === note.id ? 'Summarizing...' : 'Summarize'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingNote(note)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                </CardFooter>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
