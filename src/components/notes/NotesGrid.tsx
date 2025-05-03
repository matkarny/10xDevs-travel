import React, { useState, useEffect } from "react";
import { NoteCard } from "./NoteCard";
import { Pagination } from "../ui/Pagination";
import type { NoteDetailDto, PaginationResult } from "../../types";

// Internal type for component state
interface NoteViewModel extends NoteDetailDto {
  selected?: boolean;
  isExpanded?: boolean;
  isEditing?: boolean;
}

const NotesGrid: React.FC = () => {
  const [notes, setNotes] = useState<NoteViewModel[]>([]);
  const [pagination, setPagination] = useState<PaginationResult>({
    page: 1,
    limit: 6,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<"user" | "ai" | undefined>(undefined);

  const fetchNotes = async (page = 1, limit = 6, type?: "user" | "ai") => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) {
        queryParams.append("type", type);
      }

      const response = await fetch(`/api/notes?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się pobrać notatek");
      }

      const data = await response.json();
      setNotes(
        data.data.map((note: NoteDetailDto) => ({
          ...note,
          selected: false,
          isExpanded: false,
          isEditing: false,
        }))
      );
      setPagination(data.pagination);
    } catch (error) {
      setError("Nie udało się pobrać notatek. Spróbuj odświeżyć stronę.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchNotes(newPage, pagination.limit, noteType);
  };

  const handleFilterChange = (type?: "user" | "ai") => {
    setNoteType(type);
    fetchNotes(1, pagination.limit, type);
  };

  const toggleNoteSelection = (id: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, selected: !note.selected } : note)));
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/note/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć notatki");
      }

      // Refresh notes list
      fetchNotes(pagination.page, pagination.limit, noteType);

      // Show success message (will be handled by Toast component later)
      console.log("Notatka została usunięta");
    } catch (error) {
      console.error("Błąd podczas usuwania notatki:", error);
      // Show error message (will be handled by Toast component later)
    }
  };

  useEffect(() => {
    // Load notes on component mount
    fetchNotes();

    // Listen for note creation/update events
    const handleNoteCreated = () => {
      fetchNotes(pagination.page, pagination.limit, noteType);
    };

    document.addEventListener("note-created", handleNoteCreated);
    document.addEventListener("note-updated", handleNoteCreated);

    return () => {
      document.removeEventListener("note-created", handleNoteCreated);
      document.removeEventListener("note-updated", handleNoteCreated);
    };
  }, []);

  if (isLoading && notes.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchNotes(pagination.page, pagination.limit, noteType)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Nie masz jeszcze żadnych notatek. Dodaj swoją pierwszą notatkę!
        </p>
        <button
          onClick={() => {
            const event = new CustomEvent("open-create-note-modal");
            document.dispatchEvent(event);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
        >
          Dodaj notatkę
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => handleFilterChange(undefined)}
          className={`px-3 py-1 rounded-md ${noteType === undefined ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"}`}
        >
          Wszystkie
        </button>
        <button
          onClick={() => handleFilterChange("user")}
          className={`px-3 py-1 rounded-md ${noteType === "user" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"}`}
        >
          Moje
        </button>
        <button
          onClick={() => handleFilterChange("ai")}
          className={`px-3 py-1 rounded-md ${noteType === "ai" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"}`}
        >
          AI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onToggleSelection={toggleNoteSelection} />
        ))}
      </div>

      {pagination.total > pagination.limit && (
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default NotesGrid;
