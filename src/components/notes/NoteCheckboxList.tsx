import React from "react";
import type { NoteDetailDto } from "../../types";

interface NoteViewModel extends NoteDetailDto {
  selected?: boolean;
}

interface NoteCheckboxListProps {
  notes: NoteViewModel[];
  onToggleSelection: (id: string) => void;
  selectedNoteIds: string[];
}

const NoteCheckboxList: React.FC<NoteCheckboxListProps> = ({ notes, onToggleSelection, selectedNoteIds }) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300">Nie masz jeszcze żadnych notatek do wyboru.</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Format content preview (first 100 characters)
  const formatContentPreview = (content: string) => {
    if (content.length <= 100) return content;
    return content.substring(0, 100) + "...";
  };

  return (
    <div className="overflow-y-auto max-h-[60vh]">
      <ul className="space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className={`border rounded-md p-3 cursor-pointer transition-colors ${
              selectedNoteIds.includes(note.id)
                ? "bg-primary/10 border-primary"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            onClick={() => onToggleSelection(note.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={selectedNoteIds.includes(note.id)}
                  onChange={() => onToggleSelection(note.id)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {note.is_ai_generated ? "Wygenerowane przez AI" : "Twoja notatka"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(note.created_at)}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                  {formatContentPreview(note.content)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteCheckboxList;
