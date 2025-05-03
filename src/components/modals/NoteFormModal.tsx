import React, { useState, useEffect } from "react";
import NoteForm from "../notes/NoteForm";
import type { NoteDetailDto } from "../../types";

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId?: string;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({ isOpen, onClose, noteId }) => {
  const [note, setNote] = useState<NoteDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch note details if we're editing an existing note
  useEffect(() => {
    if (isOpen && noteId) {
      fetchNoteDetails();
    } else {
      // Reset state when opening for new note
      setNote(null);
      setError(null);
    }
  }, [isOpen, noteId]);

  const fetchNoteDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/note/${noteId}`);

      if (!response.ok) {
        throw new Error("Nie udało się pobrać szczegółów notatki");
      }

      const data = await response.json();
      setNote(data);
    } catch (error) {
      console.error("Error fetching note details:", error);
      setError("Wystąpił błąd podczas pobierania notatki");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (noteId) {
        // Update existing note
        await updateNote(noteId, content);
      } else {
        // Create new note
        await createNote(content);
      }

      // Close modal and notify about success
      onClose();

      // Dispatch event to refresh notes list
      const event = new CustomEvent(noteId ? "note-updated" : "note-created");
      document.dispatchEvent(event);

      // Dispatch toast notification
      document.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            type: "success",
            message: noteId ? "Notatka została zaktualizowana" : "Notatka została utworzona",
          },
        })
      );
    } catch (error) {
      console.error("Error submitting note:", error);
      setError("Nie udało się zapisać notatki");
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (content: string) => {
    const response = await fetch("/api/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
      credentials: "include", // Include cookies/session info
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Nie udało się utworzyć notatki");
    }

    return await response.json();
  };

  const updateNote = async (id: string, content: string) => {
    const response = await fetch(`/api/note/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
      credentials: "include", // Include cookies/session info
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Nie udało się zaktualizować notatki");
    }

    return await response.json();
  };

  if (!isOpen) return null;

  console.log(isLoading);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {noteId ? "Edytuj notatkę" : "Dodaj nową notatkę"}
          </h3>
          <button
            onClick={onClose}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400">
              {error}
              <button onClick={noteId ? fetchNoteDetails : () => setError(null)} className="ml-2 underline">
                Spróbuj ponownie
              </button>
            </div>
          ) : (
            <NoteForm
              id={noteId}
              initialContent={note?.content || ""}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isSubmitting={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteFormModal;
