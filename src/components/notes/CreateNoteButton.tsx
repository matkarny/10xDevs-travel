import React from 'react';
import { Button } from '../ui/button';

interface CreateNoteButtonProps {
  onClick: () => void;
}

const CreateNoteButton: React.FC<CreateNoteButtonProps> = ({ onClick }) => {
  return (
    <Button 
      onClick={onClick}
      className="bg-primary hover:bg-primary/90 text-white flex items-center space-x-2"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" 
          clipRule="evenodd" 
        />
      </svg>
      <span>Dodaj notatkę</span>
    </Button>
  );
};

export default CreateNoteButton;
