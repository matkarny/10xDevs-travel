import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import NoteEditorForm from "../notes/NoteEditorForm";
import { useNoteEditor, type NoteFormValues } from "../hooks/useNoteEditor";

export interface NoteEditorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteId?: string;
  onSuccess?: () => void;
}

/**
 * Modal component for creating and editing notes
 */
const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onOpenChange,
  noteId,
  onSuccess,
}) => {
  // Use the custom hook to manage state and operations
  const {
    noteToEdit,
    isLoading,
    isSubmitting,
    handleSave,
    handleCancel,
    handleOpenChange,
  } = useNoteEditor(noteId, onSuccess);

  // Pass the open state to the hook handler
  React.useEffect(() => {
    handleOpenChange(isOpen);
  }, [isOpen, handleOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {noteId ? "Edytuj notatkę" : "Dodaj nową notatkę"}
          </DialogTitle>
          <DialogDescription>
            {noteId
              ? "Wprowadź zmiany w swojej notatce i zapisz je."
              : "Wprowadź treść swojej notatki i kliknij Zapisz."}
          </DialogDescription>
        </DialogHeader>

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
        ) : (
          <NoteEditorForm
            noteId={noteId}
            note={noteToEdit}
            onSubmit={handleSave}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
        
        <DialogFooter className="flex flex-col gap-2 sm:gap-0">
          {/* Additional footer content if needed */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteEditorModal;
