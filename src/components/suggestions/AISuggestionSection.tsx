import React, { useState, useEffect } from "react";
import type { SuggestionResponse } from "../../types";
import { createNoteService } from "../../lib/services/noteService";
import { toast } from "../ui/Toast";

interface SuggestionCardProps {
  content: string;
  onSaveAsSuggestion: (content: string) => Promise<void>;
  isLoading?: boolean;
}

// Individual suggestion card component
const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  content, 
  onSaveAsSuggestion,
  isLoading = false 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSaveAsSuggestion(content);
      // Success will be handled by toast
    } catch (error) {
      console.error('Error saving suggestion:', error);
      // Error will be handled by toast
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-primary animate-fadeIn">
      <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">{content}</p>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`text-sm px-4 py-2 rounded-md text-white bg-primary hover:bg-primary/90 transition-colors ${
          isSaving ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isSaving ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Zapisuję...
          </span>
        ) : (
          'Zapisz jako notatkę'
        )}
      </button>
    </div>
  );
};

// Main AI suggestion section component
const AISuggestionSection: React.FC = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Generate suggestions based on selected notes using noteService
  const generateSuggestions = async (noteIds: string[]) => {
    if (noteIds.length === 0) {
      setError("Wybierz co najmniej jedną notatkę");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Pobierz instancję Supabase z sesji
      const supabaseClient = await getSupabaseClient();
      if (!supabaseClient) {
        throw new Error("Brak autoryzacji. Zaloguj się ponownie.");
      }
      
      // Utwórz instancję serwisu notatek
      const noteService = createNoteService(supabaseClient);
      
      // Generuj sugestie za pomocą serwisu
      const result = await noteService.generateSuggestions({ note_ids: noteIds });
      
      // Aktualizuj stan komponentu z otrzymanymi sugestiami
      setSuggestions(result.suggestions);
      
      // Opcjonalnie wyświetl powiadomienie o sukcesie
      toast.success("Wygenerowano sugestie podróży na podstawie wybranych notatek");
    } catch (error) {
      toast.error("Nie udało się wygenerować sugestii. Spróbuj ponownie później.");
      setError("Nie udało się wygenerować sugestii. Spróbuj ponownie później.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper function to get Supabase client from session
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

  // Save suggestion as AI note using noteService
  const saveAsSuggestion = async (content: string) => {
    try {
      // Pobierz instancję Supabase z sesji
      const supabaseClient = await getSupabaseClient();
      if (!supabaseClient) {
        toast.error("Brak autoryzacji. Zaloguj się ponownie.");
        return;
      }
      
      // Utwórz instancję serwisu notatek
      const noteService = createNoteService(supabaseClient);
      
      // Zapisz notatkę AI za pomocą serwisu
      await fetch("/api/note/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      
      // Wyświetl powiadomienie o sukcesie
      toast.success("Sugestia została zapisana jako notatka");
      
      // Powiadom siatkę notatek o odświeżeniu
      document.dispatchEvent(new Event("note-created"));
    } catch (error) {
      // Wyświetl powiadomienie o błędzie
      toast.error("Nie udało się zapisać sugestii jako notatki");
    }
  };

  // Open selection modal to choose notes for analysis
  const openSelectionModal = () => {
    setIsSelectionModalOpen(true);
    // We'll dispatch a custom event that will be handled by a modal component later
    document.dispatchEvent(new CustomEvent('open-note-selection-modal'));
  };

  useEffect(() => {
    // Listen for events from the note selection modal
    const handleNotesSelected = (event: CustomEvent) => {
      const selectedIds = event.detail?.noteIds || [];
      setSelectedNoteIds(selectedIds);
      
      if (selectedIds.length > 0) {
        generateSuggestions(selectedIds);
      }
    };

    document.addEventListener('notes-selected', handleNotesSelected as EventListener);

    return () => {
      document.removeEventListener('notes-selected', handleNotesSelected as EventListener);
    };
  }, []);

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sugestie AI</h2>
        <button
          onClick={openSelectionModal}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>Gdzie powinienem się udać?</span>
        </button>
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-300">Generuję sugestie na podstawie twoich notatek...</p>
        </div>
      )}

      {error && !isGenerating && (
        <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => generateSuggestions(selectedNoteIds)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {!isGenerating && !error && suggestions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">
            Wybierz swoje notatki, aby otrzymać spersonalizowane sugestie podróży.
          </p>
        </div>
      )}

      {!isGenerating && !error && suggestions.length > 0 && (
        <div className="space-y-4 mt-4">
          {suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              content={suggestion}
              onSaveAsSuggestion={saveAsSuggestion}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AISuggestionSection;
