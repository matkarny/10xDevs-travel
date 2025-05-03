import React from "react";
import { Button } from "./button.js";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState = ({ message, actionLabel, onAction, icon }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon ? (
        <div className="mb-4">{icon}</div>
      ) : (
        <div className="mb-4 text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;