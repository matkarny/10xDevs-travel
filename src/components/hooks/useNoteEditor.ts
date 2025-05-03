import { useState, useEffect, useCallback } from "react";
import { showSuccessToast, showErrorToast } from "../ui/Toast";
import type { NoteDetailDto } from "../../types";

// Types defined as per the implementation plan
export interface NoteFormValues {
  content: string;
}

export interface UseNoteEditorReturn {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  noteToEdit: NoteDetailDto | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: Error | null;
  handleOpenChange: (open: boolean) => void;
  handleSave: (values: NoteFormValues) => Promise<void>;
  handleCancel: () => void;
}

/**
 * Custom hook to manage note editor state and operations
 */
export function useNoteEditor(noteId?: string, onSuccess?: () => void): UseNoteEditorReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<NoteDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Define fetchNote with useCallback to avoid dependency issues
  const fetchNote = useCallback(async () => {
    if (!noteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/note/${noteId}`);
      if (!response.ok) {
        throw new Error(`Błąd ${response.status}: ${await response.text()}`);
      }
      
      const note: NoteDetailDto = await response.json();
      
      // Check if the note is AI-generated (can't edit those)
      if (note.is_ai_generated) {
        showErrorToast("Nie można edytować notatek wygenerowanych przez AI.");
        setIsOpen(false);
        return;
      }
      
      setNoteToEdit(note);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Wystąpił nieznany błąd"));
      showErrorToast("Nie udało się pobrać notatki do edycji.");
    } finally {
      setIsLoading(false);
    }
  }, [noteId, setIsLoading, setError, setNoteToEdit, setIsOpen]);

  // Fetch note data when editing an existing note
  useEffect(() => {
    if (noteId && isOpen) {
      fetchNote();
    }
  }, [noteId, isOpen, fetchNote]);
  const handleSave = async (values: NoteFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (noteId) {
        // Update existing note
        const response = await fetch(`/api/note/${noteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Błąd ${response.status}: ${errorText}`);
        }
        
        showSuccessToast("Notatka została zaktualizowana.");
      } else {
        // Create new note
        const response = await fetch("/api/note", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Błąd ${response.status}: ${errorText}`);
        }
        
        showSuccessToast("Notatka została utworzona.");
      }
      
      // Trigger a custom event to refresh notes list
      const event = new CustomEvent(noteId ? "note-updated" : "note-created");
      document.dispatchEvent(event);
      
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Wystąpił nieznany błąd"));
      showErrorToast(err instanceof Error ? err.message : "Nie udało się zapisać notatki.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNoteToEdit(null);
      setError(null);
    }
  };

  return {
    isOpen,
    setIsOpen,
    noteToEdit,
    isLoading,
    isSubmitting,
    error,
    handleOpenChange,
    handleSave,
    handleCancel,
  };
}
