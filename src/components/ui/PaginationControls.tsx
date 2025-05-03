import React from "react";
import { Button } from "./button.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ 
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
}: PaginationControlsProps) => {
  // Funkcja generująca numery stron do wyświetlenia
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];

    // Dla małej liczby stron, pokaż wszystkie
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    // Dla większej liczby stron, pokaż bieżącą stronę z sąsiadami
    // Zawsze dołącz pierwszą i ostatnią stronę
    pageNumbers.push(1);

    if (currentPage <= 3) {
      // Jeśli jesteśmy blisko początku, pokaż pierwsze kilka stron
      pageNumbers.push(2, 3, 4);
    } else if (currentPage >= totalPages - 2) {
      // Jeśli jesteśmy blisko końca, pokaż ostatnie kilka stron
      pageNumbers.push(totalPages - 3, totalPages - 2, totalPages - 1);
    } else {
      // W przeciwnym razie pokaż bieżącą stronę z sąsiadami
      pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
    }

    // Dodaj ostatnią stronę, jeśli nie została już uwzględniona
    if (pageNumbers[pageNumbers.length - 1] !== totalPages) {
      // Dodaj wskaźnik wielokropka, jeśli jest przerwa
      if (Number(pageNumbers[pageNumbers.length - 1]) < totalPages - 1) {
        pageNumbers.push("..."); // Użyj "..." do reprezentacji wielokropka
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <nav aria-label="Paginacja" className="flex justify-center mt-6">
      <ul className="flex space-x-1">
        {/* Przycisk poprzedniej strony */}
        <li>
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            variant="outline"
            size="icon"
            className="h-9 w-9 p-0"
            aria-label="Poprzednia strona"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>

        {/* Numery stron */}
        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-muted-foreground flex items-center">...</span>
            ) : (
              <Button
                onClick={() => onPageChange(Number(page))}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className="h-9 w-9 p-0"
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            )}
          </li>
        ))}

        {/* Przycisk następnej strony */}
        <li>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            variant="outline"
            size="icon"
            className="h-9 w-9 p-0"
            aria-label="Następna strona"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default PaginationControls;