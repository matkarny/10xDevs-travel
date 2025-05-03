import React, { useState, useEffect } from "react";
import NoteFormModal from "./NoteFormModal";
import NoteSelectionModal from "./NoteSelectionModal";

const AppModals: React.FC = () => {
  const [isNoteFormModalOpen, setIsNoteFormModalOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(undefined);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  const openCreateNoteModal = () => {
    setCurrentNoteId(undefined);
    setIsNoteFormModalOpen(true);
  };

  const openEditNoteModal = (noteId: string) => {
    setCurrentNoteId(noteId);
    setIsNoteFormModalOpen(true);
  };

  const openSelectionModal = () => {
    setIsSelectionModalOpen(true);
  };

  const closeAllModals = () => {
    setIsNoteFormModalOpen(false);
    setIsSelectionModalOpen(false);
    setCurrentNoteId(undefined);
  };

  const handleNotesSelected = (noteIds: string[]) => {
    setIsSelectionModalOpen(false);

    const event = new CustomEvent("notes-selected", {
      detail: { noteIds },
    });
    document.dispatchEvent(event);
  };

  useEffect(() => {
    const handleOpenCreateNoteModal = () => openCreateNoteModal();

    const handleOpenEditNoteModal = (event: CustomEvent) => {
      const noteId = event.detail?.noteId;
      if (noteId) openEditNoteModal(noteId);
    };

    const handleOpenNoteSelectionModal = () => openSelectionModal();

    document.addEventListener("open-create-note-modal", handleOpenCreateNoteModal);
    document.addEventListener("open-edit-note-modal", handleOpenEditNoteModal as EventListener);
    document.addEventListener("open-note-selection-modal", handleOpenNoteSelectionModal);

    return () => {
      document.removeEventListener("open-create-note-modal", handleOpenCreateNoteModal);
      document.removeEventListener("open-edit-note-modal", handleOpenEditNoteModal as EventListener);
      document.removeEventListener("open-note-selection-modal", handleOpenNoteSelectionModal);
    };
  }, []);

  return (
    <>
      <NoteFormModal isOpen={isNoteFormModalOpen} onClose={closeAllModals} noteId={currentNoteId} />

      <NoteSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={closeAllModals}
        onNotesSelected={handleNotesSelected}
      />
    </>
  );
};

export default AppModals;
