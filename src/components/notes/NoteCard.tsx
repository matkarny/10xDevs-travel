import React, { useState } from "react";
import type { NoteDetailDto } from "../../types";

// View model for the note card component
interface NoteViewModel extends NoteDetailDto {
  selected?: boolean;
  isExpanded?: boolean;
  isEditing?: boolean;
}

interface NoteCardProps {
  note: NoteViewModel;
  onDelete: (id: string) => Promise<void>;
  onToggleSelection: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onToggleSelection }) => {
  const [isExpanded, setIsExpanded] = useState(note.isExpanded || false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
  };

  const handleConfirmDelete = async () => {
    await onDelete(note.id);
    setIsConfirmingDelete(false);
  };

  // Handle edit button click
  const handleEditClick = () => {
    const event = new CustomEvent("open-edit-note-modal", {
      detail: { noteId: note.id },
    });
    document.dispatchEvent(event);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-all ${
        note.selected ? "ring-2 ring-primary" : ""
      }`}
    >
      {/* Note Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full mr-2 bg-primary" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {note.is_ai_generated ? "Wygenerowane przez AI" : "Twoja notatka"}
          </span>
        </div>
        <div className="flex space-x-1">
          {!note.is_ai_generated && (
            <button
              onClick={handleEditClick}
              className="text-gray-500 hover:text-primary p-1 rounded"
              aria-label="Edytuj notatkę"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onToggleSelection(note.id)}
            className={`p-1 rounded ${note.selected ? "text-primary" : "text-gray-500 hover:text-primary"}`}
            aria-label={note.selected ? "Odznacz notatkę" : "Zaznacz notatkę"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-gray-500 hover:text-red-500 p-1 rounded"
            aria-label="Usuń notatkę"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Note content */}
      <div className={`mt-2 ${isExpanded ? "" : "line-clamp-4"}`}>
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
      </div>

      {/* Expand/collapse button */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary hover:text-primary/80 text-sm mt-2">
        {isExpanded ? "Zwiń" : "Rozwiń"}
      </button>

      {/* Note footer with date */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {note.updated_at !== note.created_at ? (
          <span>Zaktualizowano: {formatDate(note.updated_at)}</span>
        ) : (
          <span>Utworzono: {formatDate(note.created_at)}</span>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {isConfirmingDelete && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 rounded-lg flex flex-col items-center justify-center p-4 z-10">
          <p className="text-center mb-4">Czy na pewno chcesz usunąć tę notatkę?</p>
          <div className="flex space-x-3">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Usuń
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
