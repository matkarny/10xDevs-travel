import React from "react";
import type { NoteDetailDto } from "../../types";
import { Button } from "../ui/button.js";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card.js";
import { Sparkles, Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const DeleteButton = React.memo(({ onClick, disabled = false, isLoading = false }: DeleteButtonProps) => {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label="Usuń propozycję"
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Usuwanie...</span>
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-1" />
          <span>Usuń</span>
        </>
      )}
    </Button>
  );
});

DeleteButton.displayName = "DeleteButton";

interface AiNoteCardProps {
  note: NoteDetailDto;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const AiNoteCard = ({ note, onDelete, isDeleting = false }: AiNoteCardProps) => {
  // Format dates using native JavaScript
  const createdAt = new Date(note.created_at);
  const formattedDate = createdAt.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const handleDelete = () => {
    onDelete(note.id);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <div className="flex items-center text-primary">
          <Sparkles className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Propozycja AI</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="whitespace-pre-wrap text-sm">{note.content}</div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2 pt-2 border-t">
        <div className="flex w-full justify-between items-center">
          <div className="text-xs text-muted-foreground" title={formattedDate}>
            {formattedDate}
          </div>
          <DeleteButton onClick={handleDelete} isLoading={isDeleting} />
        </div>
      </CardFooter>
    </Card>
  );
};

// Memoizacja całego komponentu karty, aby zapobiec niepotrzebnym renderowaniom
// Komponent będzie renderowany ponownie tylko wtedy, gdy zmienią się jego propsy
const MemoizedAiNoteCard = React.memo(AiNoteCard, (prevProps, nextProps) => {
  // Głębsze porównanie obiektów note, ponieważ są to obiekty złożone
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.created_at === nextProps.note.created_at &&
    prevProps.onDelete === nextProps.onDelete
  );
});

MemoizedAiNoteCard.displayName = "MemoizedAiNoteCard";

export default MemoizedAiNoteCard;