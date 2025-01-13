import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Save, X, Check, Copy, CheckCircle, Edit, RefreshCw } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUpdateIndicator, setShowUpdateIndicator] = useState(false);
  
  // Create a ref for the input element
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes).map((note: Note) => ({
        ...note,
        createdAt: new Date(note.createdAt)
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Focus input when editing starts or when editingId changes
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleSave = () => {
    if (!currentNote.trim()) {
      alert('Please enter some text before saving');
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      content: currentNote,
      createdAt: new Date()
    };

    setNotes(prev => [newNote, ...prev]);
    setCurrentNote('');
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 500);
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setCurrentNote(note.content);
  };

  const handleUpdateNote = () => {
    if (!currentNote.trim()) {
      alert('Please enter some text before updating');
      return;
    }

    setNotes(prev => prev.map(note => 
      note.id === editingId 
        ? { ...note, content: currentNote }
        : note
    ));
    setCurrentNote('');
    setEditingId(null);
    setShowUpdateIndicator(true);
    setTimeout(() => setShowUpdateIndicator(false), 500);
  };

  const handleDelete = (id: string) => {
    // If the note being deleted is the one currently being edited, reset edit state
    if (id === editingId) {
      setEditingId(null);
      setCurrentNote('');
    }
    setDeleteId(id);
  };

  const confirmDelete = () => {
    // If the note being deleted is the one currently being edited, reset edit state
    if (deleteId === editingId) {
      setEditingId(null);
      setCurrentNote('');
    }
    
    setNotes(prev => prev.filter(note => note.id !== deleteId));
    setDeleteId(null);
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Elegant Notes
        </h1>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <textarea
            ref={inputRef}
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
          />
          <div className="flex items-center justify-end">
            {editingId ? (
              <button
                onClick={handleUpdateNote}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105 active:scale-95 min-w-[100px] justify-center"
              >
                {showUpdateIndicator ? <Check size={16} /> : <RefreshCw size={16} />}
                {showUpdateIndicator ? 'Updated!' : 'Update'}
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105 active:scale-95 min-w-[100px] justify-center"
              >
                {showSaveIndicator ? <Check size={16} /> : <Save size={16} />}
                {showSaveIndicator ? 'Saved!' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.map(note => (
            <div
              key={note.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 relative group"
            >
              <p className="text-gray-700 mb-2 pr-20">{note.content}</p>
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleEdit(note)}
                  className={`p-2 transition-colors ${
                    editingId === note.id 
                      ? 'text-blue-600 bg-blue-100 rounded' 
                      : 'text-gray-400 hover:text-blue-500'
                  }`}
                  title="Edit note"
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => handleCopy(note.content, note.id)} 
                  className={`p-2 transition-colors ${
                    copiedId === note.id 
                      ? 'text-green-600 bg-green-100 rounded' 
                      : 'text-gray-400 hover:text-green-500'
                  }`}
                  title="Copy note"
                >
                  {copiedId === note.id ? <CheckCircle size={20} /> : <Copy size={20} />}
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete note"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h2>
              <p className="mb-6 text-gray-600">Are you sure you want to delete this note? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setDeleteId(null)} 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;