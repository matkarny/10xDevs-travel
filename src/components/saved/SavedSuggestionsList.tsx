import React, { useState, useEffect, useCallback } from "react";
import type { NoteDetailDto } from "../../types";
import AiNoteCard from "./AiNoteCard.js";
import PaginationControls from "../ui/PaginationControls.js";
import EmptyState from "../ui/EmptyState.js";
import DeleteConfirmationDialog from "../modals/DeleteConfirmationDialog.js";
import { Button } from "../ui/button.js";
import { showSuccessToast, showErrorToast } from "../ui/Toast.js";
import { RefreshCw } from "lucide-react";

// Hook do zarządzania pobieraniem propozycji AI
interface UseAiNotesProps {
  initialPage?: number;
  initialLimit?: number;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseAiNotesReturn {
  isLoading: boolean;
  error: string | null;
  notes: NoteDetailDto[];
  pagination: PaginationState;
  fetchNotes: () => Promise<void>;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
}

const useAiNotes = (initialPage = 1, initialLimit = 20): UseAiNotesReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteDetailDto[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 1,
  });

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Pobieranie zapisanych propozycji AI
      const response = await fetch(`/api/notes/ai?page=${pagination.page}&limit=${pagination.limit}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować.");
        }
        const errorData = await response.json();
        if (response.status === 500) {
          throw new Error("Serwer napotkał problem. Spróbuj ponownie za chwilę.");
        }
        throw new Error(errorData.message || "Nie udało się pobrać propozycji. Spróbuj ponownie.");
      }

      const data = await response.json();

      setNotes(data.notes || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setError(errorMessage);

      if (errorMessage.includes("sesja wygasła")) {
        window.location.href = "/login?redirectTo=/saved&sessionExpired=true";
        return;
      }

      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Zmiana strony
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  // Odświeżenie danych
  const refetch = useCallback(() => {
    return fetchNotes();
  }, [fetchNotes]);

  return {
    isLoading,
    error,
    notes,
    pagination,
    fetchNotes,
    refetch,
    setPage,
  };
};

// Hook do zarządzania usuwaniem propozycji
interface DeleteNoteActionState {
  isDeleting: boolean;
  noteIdToDelete: string | null;
  error: string | null;
}

interface UseDeleteNoteReturn {
  deleteState: DeleteNoteActionState;
  initiateDelete: (id: string) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

const useDeleteNote = (onDeleteSuccess?: () => void): UseDeleteNoteReturn => {
  const [deleteState, setDeleteState] = useState<DeleteNoteActionState>({
    isDeleting: false,
    noteIdToDelete: null,
    error: null,
  });

  // Inicjowanie procesu usuwania
  const initiateDelete = useCallback((id: string) => {
    setDeleteState((prev) => ({
      ...prev,
      noteIdToDelete: id,
      error: null,
    }));
  }, []);

  // Potwierdzenie usunięcia
  const confirmDelete = useCallback(async () => {
    if (!deleteState.noteIdToDelete) return;

    setDeleteState((prev) => ({ ...prev, isDeleting: true, error: null }));

    try {
      const response = await fetch(`/api/note/${deleteState.noteIdToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Obsługa specyficznych kodów błędów
        if (response.status === 401) {
          throw new Error("Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować.");
        }
        if (response.status === 404) {
          throw new Error("Propozycja nie istnieje lub została już usunięta.");
        }
        const errorData = await response.json();
        if (response.status === 500) {
          throw new Error("Wystąpił błąd podczas usuwania propozycji. Spróbuj ponownie.");
        }
        throw new Error(errorData.message || "Nie udało się usunąć propozycji.");
      }

      // Sukces
      setDeleteState({
        isDeleting: false,
        noteIdToDelete: null,
        error: null,
      });

      // Wywołanie funkcji callback po sukcesie
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd";
      setDeleteState((prev) => ({
        ...prev,
        isDeleting: false,
        error: errorMessage,
      }));
      if (errorMessage.includes("sesja wygasła")) {
        window.location.href = "/auth";
        return;
      }

      // Wyświetlamy różne komunikaty w zależności od rodzaju błędu
      if (errorMessage.includes("nie istnieje")) {
        showErrorToast(errorMessage);
        // Odświeżamy listę, bo prawdopodobnie element został już usunięty
        if (onDeleteSuccess) onDeleteSuccess();
        return;
      }

      showErrorToast(errorMessage);
    }
  }, [deleteState.noteIdToDelete, onDeleteSuccess]);

  // Anulowanie usuwania
  const cancelDelete = useCallback(() => {
    setDeleteState({
      isDeleting: false,
      noteIdToDelete: null,
      error: null,
    });
  }, []);

  return {
    deleteState,
    initiateDelete,
    confirmDelete,
    cancelDelete,
  };
};

// Komponent główny listy propozycji
interface SavedSuggestionsListProps {
  initialPage?: number;
  initialLimit?: number;
}

const SavedSuggestionsList = ({ initialPage = 1, initialLimit = 20 }: SavedSuggestionsListProps) => {
  const { deleteState, initiateDelete, confirmDelete, cancelDelete } = useDeleteNote(() => {
    // On successful delete
    refetch();
    showSuccessToast("Propozycja została pomyślnie usunięta");
  });

  const { isLoading, error, notes, pagination, fetchNotes, refetch, setPage } = useAiNotes(initialPage, initialLimit);

  // Optymalizacja stabilności referencji funkcji callback
  const handleDelete = useCallback(
    (id: string) => {
      initiateDelete(id);
    },
    [initiateDelete]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
    },
    [setPage]
  );

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Przekazanie danych do dialogu potwierdzenia
  const dialogData = {
    isOpen: !!deleteState.noteIdToDelete,
    onClose: cancelDelete,
    onConfirm: confirmDelete,
    title: "Potwierdź usunięcie",
    description: "Czy na pewno chcesz usunąć tę propozycję? Tej operacji nie można cofnąć.",
    isLoading: deleteState.isDeleting,
    confirmLabel: "Usuń",
    cancelLabel: "Anuluj",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Zapisane propozycje</h2>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Odśwież
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/20 text-destructive p-4 rounded-lg">
          <p>{error}</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
            Spróbuj ponownie
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
        </div>
      ) : notes.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <AiNoteCard
                key={note.id}
                note={note}
                onDelete={handleDelete}
                isDeleting={deleteState.isDeleting && deleteState.noteIdToDelete === note.id}
              />
            ))}
          </div>

          {pagination.total > pagination.limit && (
            <div className="flex justify-center mt-8">
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.page < pagination.totalPages}
                hasPrevPage={pagination.page > 1}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          message="Nie masz jeszcze zapisanych propozycji"
          actionLabel="Wygeneruj propozycje"
          onAction={() => (window.location.href = "/")}
        />
      )}

      {/* Confirmation dialog for note deletion */}
      <DeleteConfirmationDialog
        isOpen={dialogData.isOpen}
        onClose={dialogData.onClose}
        onConfirm={dialogData.onConfirm}
        title={dialogData.title}
        description={dialogData.description}
        isLoading={dialogData.isLoading}
        confirmLabel={dialogData.confirmLabel}
        cancelLabel={dialogData.cancelLabel}
      />
    </div>
  );
};

export default SavedSuggestionsList;
