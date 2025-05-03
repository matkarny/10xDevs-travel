import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import NoteCheckboxList from '../notes/NoteCheckboxList';
import type { NoteDetailDto, PaginationResult } from '../../types';
import { createNoteService } from '../../lib/services/noteService';
import { toast } from '../ui/Toast';

interface NoteViewModel extends NoteDetailDto {
  selected?: boolean;
}

interface NoteSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotesSelected: (noteIds: string[]) => void;
}

const NoteSelectionModal: React.FC<NoteSelectionModalProps> = ({
  isOpen,
  onClose,
  onNotesSelected
}) => {
  const [notes, setNotes] = useState<NoteViewModel[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationResult>({
    page: 1,
    limit: 20,
    total: 0
  });

  // Fetch user notes for selection using noteService
  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Pobierz instancję Supabase z localStorage (tymczasowe obejście)
      // W rzeczywistym rozwiązaniu powinno to być dostarczone przez kontekst
      const supabaseClient = await getSupabaseClient();
      if (!supabaseClient) {
        throw new Error("Brak autoryzacji. Zaloguj się ponownie.");
      }
      
      // Utwórz instancję serwisu notatek
      const noteService = createNoteService(supabaseClient);
      
      // Pobierz notatki z paginacją
      const result = await noteService.getNotes({
        page: 1,
        limit: 20,
        type: "user" // Tylko notatki użytkownika (nie AI)
      });
      
      // Aktualizuj stan z pobranymi notatkami
      setNotes(result.data.map((note: NoteDetailDto) => ({
        ...note,
        selected: selectedNoteIds.includes(note.id)
      })));
      
      setPagination(result.pagination);
    } catch (error) {
      toast.error("Nie udało się pobrać notatek. Spróbuj ponownie.");
      setError("Nie udało się pobrać notatek. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get Supabase client from storage
  const getSupabaseClient = async () => {
    try {
      // W rzeczywistej aplikacji powinniśmy używać kontekstu React
      // lub pobierać klienta z middleware Astro  
      const response = await fetch("/api/auth/session");
      if (!response.ok) return null;
      
      return response.json();
    } catch (error) {
      return null;
    }
  };

  // Fetch notes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen]);

  // Toggle note selection
  const handleToggleSelection = (id: string) => {
    setSelectedNoteIds(prevIds => {
      if (prevIds.includes(id)) {
        return prevIds.filter(noteId => noteId !== id);
      } else {
        return [...prevIds, id];
      }
    });
  };

  // Handle submit - pass selected note IDs to parent
  const handleSubmit = () => {
    onNotesSelected(selectedNoteIds);
    onClose();
  };

  // Handle cancel - close modal without action
  const handleCancel = () => {
    setSelectedNoteIds([]);
    onClose();
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNoteIds.length === notes.length) {
      // Deselect all if all are selected
      setSelectedNoteIds([]);
    } else {
      // Select all notes
      setSelectedNoteIds(notes.map(note => note.id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Wybierz notatki do analizy
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Zamknij"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Wybierz notatki, które AI weźmie pod uwagę przy generowaniu sugestii podróży dla Ciebie.
            Im więcej notatek wybierzesz, tym bardziej spersonalizowane będą sugestie.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400 mb-4">
              {error}
              <button
                onClick={fetchNotes}
                className="ml-2 underline"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Wybrano {selectedNoteIds.length} z {notes.length} notatek
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {selectedNoteIds.length === notes.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                </button>
              </div>
              
              <NoteCheckboxList
                notes={notes}
                onToggleSelection={handleToggleSelection}
                selectedNoteIds={selectedNoteIds}
              />
              
              {selectedNoteIds.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  Wybierz co najmniej jedną notatkę do analizy
                </p>
              )}
            </>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedNoteIds.length === 0 || isLoading}
          >
            Generuj sugestie
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoteSelectionModal;
