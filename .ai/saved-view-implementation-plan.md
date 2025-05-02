# Plan implementacji widoku "Zapisane propozycje"

## 1. Przegląd
Widok "Zapisane propozycje" umożliwia użytkownikom przeglądanie i zarządzanie propozycjami wygenerowanymi przez AI. Jest to dedykowana sekcja aplikacji VibeTravels, która pozwala na przegląd, filtrowanie i usuwanie zapisanych sugestii podróży. Głównym celem tego widoku jest zapewnienie użytkownikowi wygodnego dostępu do wszystkich pomysłów, które zostały wcześniej wygenerowane i zapisane przez system AI.

## 2. Routing widoku
- **Ścieżka URL**: `/saved`
- **Nazwa widoku**: Saved Suggestions
- **Plik implementacji**: `/src/pages/saved.astro`

## 3. Struktura komponentów
```
SavedSuggestionsPage (Astro)
├── PageHeader (Astro)
├── SavedSuggestionsList (React)
│   ├── AiNoteCard (React)
│   │   └── DeleteButton (React)
├── PaginationControls (React)
├── EmptyState (React, warunkowe renderowanie) 
├── DeleteConfirmationDialog (React, warunkowe renderowanie)
└── ToastNotification (React, warunkowe renderowanie)
```

## 4. Szczegóły komponentów

### SavedSuggestionsPage
- **Opis komponentu**: Główny komponent strony odpowiedzialny za layoutowanie i ładowanie danych. Zarządza stanem i logią całego widoku.
- **Główne elementy**: Container, header, sekcja z listą propozycji, paginacja
- **Obsługiwane interakcje**: Inicjowanie pobierania danych przy załadowaniu strony
- **Obsługiwana walidacja**: Sprawdzanie czy użytkownik jest zalogowany
- **Typy**: NoteListResponse, PaginationParams
- **Propsy**: N/A (komponent główny)

### PageHeader
- **Opis komponentu**: Nagłówek strony zawierający tytuł "Zapisane propozycje" i ewentualnie dodatkowe elementy nawigacyjne.
- **Główne elementy**: Tytuł, opcjonalnie breadcrumbs
- **Obsługiwane interakcje**: N/A
- **Obsługiwana walidacja**: N/A
- **Typy**: N/A
- **Propsy**: title: string

### SavedSuggestionsList
- **Opis komponentu**: Reaktywny komponent wyświetlający listę kart zapisanych propozycji AI.
- **Główne elementy**: Kontener, lista kart AiNoteCard, stan ładowania, stan pusty
- **Obsługiwane interakcje**: Przekazywanie akcji usuwania do komponentów dzieci
- **Obsługiwana walidacja**: Sprawdzanie czy istnieją propozycje do wyświetlenia
- **Typy**: NoteDetailDto[], onDelete: (id: string) => void
- **Propsy**: notes: NoteDetailDto[], loading: boolean, onDeleteNote: (id: string) => void

### AiNoteCard
- **Opis komponentu**: Karta pojedynczej propozycji AI zawierająca treść propozycji, datę utworzenia i przycisk usuwania.
- **Główne elementy**: Kontener karty, wyświetlenie treści, oznaczenie AI, data, przycisk usuwania
- **Obsługiwane interakcje**: Kliknięcie przycisku usuwania
- **Obsługiwana walidacja**: N/A
- **Typy**: NoteDetailDto
- **Propsy**: note: NoteDetailDto, onDelete: (id: string) => void

### DeleteButton
- **Opis komponentu**: Przycisk usuwania propozycji z ikoną kosza.
- **Główne elementy**: Przycisk, ikona
- **Obsługiwane interakcje**: Kliknięcie wywołujące dialog potwierdzenia
- **Obsługiwana walidacja**: N/A
- **Typy**: N/A
- **Propsy**: onClick: () => void, disabled: boolean

### PaginationControls
- **Opis komponentu**: Kontrolki paginacji umożliwiające nawigację między stronami wyników.
- **Główne elementy**: Przyciski nawigacji (poprzednia/następna strona), wyświetlenie aktualnej strony
- **Obsługiwane interakcje**: Zmiana strony
- **Obsługiwana walidacja**: Sprawdzanie limitów paginacji (pierwsza/ostatnia strona)
- **Typy**: PaginationViewModel
- **Propsy**: pagination: PaginationViewModel, onPageChange: (page: number) => void

### EmptyState
- **Opis komponentu**: Komponent wyświetlany gdy brak propozycji AI do pokazania.
- **Główne elementy**: Ilustracja, komunikat, opcjonalnie przycisk akcji
- **Obsługiwane interakcje**: Opcjonalnie przycisk przekierowujący do generowania propozycji
- **Obsługiwana walidacja**: N/A
- **Typy**: N/A
- **Propsy**: message: string, actionLabel?: string, onAction?: () => void

### DeleteConfirmationDialog
- **Opis komponentu**: Dialog potwierdzenia usunięcia propozycji.
- **Główne elementy**: Okno modalne, tytuł, pytanie, przyciski potwierdzenia/anulowania
- **Obsługiwane interakcje**: Potwierdzenie lub anulowanie usunięcia
- **Obsługiwana walidacja**: N/A
- **Typy**: N/A
- **Propsy**: isOpen: boolean, onConfirm: () => void, onCancel: () => void, noteTitle: string

### ToastNotification
- **Opis komponentu**: Komponent powiadomień typu toast wyświetlający informacje o sukcesie lub błędzie operacji.
- **Główne elementy**: Container, ikona statusu, treść wiadomości
- **Obsługiwane interakcje**: Automatyczne znikanie, opcjonalnie przycisk zamknięcia
- **Obsługiwana walidacja**: N/A
- **Typy**: ToastViewModel
- **Propsy**: toast: ToastViewModel, onClose: () => void

## 5. Typy

### AiNoteViewModel
```typescript
interface AiNoteViewModel {
  id: string;
  content: string;
  createdAt: string; // sformatowana data
  timeAgo: string; // relatywny czas (np. "2 godziny temu")
}
```

### PaginationViewModel
```typescript
interface PaginationViewModel {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### DeleteNoteActionState
```typescript
interface DeleteNoteActionState {
  isDeleting: boolean;
  noteIdToDelete: string | null;
  error: string | null;
}
```

### ToastViewModel
```typescript
interface ToastViewModel {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  autoHideDuration?: number;
}
```

## 6. Zarządzanie stanem
Do zarządzania stanem widoku "Zapisane propozycje" zostaną wykorzystane następujące customowe hooki React:

### useAiNotes()
```typescript
const useAiNotes = (initialPage = 1, initialLimit = 20) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteDetailDto[]>([]);
  const [pagination, setPagination] = useState<PaginationResult>({
    page: initialPage,
    limit: initialLimit,
    total: 0
  });
  
  // Funkcja fetchNotes do pobierania notatek
  // Funkcja refetch do odświeżania listy
  // Funkcja setPage do zmiany strony
  
  return { isLoading, error, notes, pagination, fetchNotes, refetch, setPage };
};
```

### useDeleteNote()
```typescript
const useDeleteNote = (onDeleteSuccess?: () => void) => {
  const [deleteState, setDeleteState] = useState<DeleteNoteActionState>({
    isDeleting: false,
    noteIdToDelete: null,
    error: null
  });
  
  // Funkcja initiateDelete do rozpoczęcia procesu usuwania
  // Funkcja confirmDelete do potwierdzenia usunięcia
  // Funkcja cancelDelete do anulowania usunięcia
  
  return { deleteState, initiateDelete, confirmDelete, cancelDelete };
};
```

### useToast()
```typescript
const useToast = () => {
  const [toast, setToast] = useState<ToastViewModel>({
    message: '',
    type: 'info',
    isVisible: false
  });
  
  // Funkcja showToast do wyświetlania powiadomienia
  // Funkcja hideToast do ukrywania powiadomienia
  
  return { toast, showToast, hideToast };
};
```

## 7. Integracja API

### fetchAiNotes
```typescript
const fetchAiNotes = async (params: PaginationParams): Promise<NoteListResponse> => {
  const { page = 1, limit = 20, sort = 'created_at.desc' } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  queryParams.append('sort', sort);
  
  const response = await fetch(`/api/notes/ai?${queryParams.toString()}`);
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch AI notes');
  }
  
  return await response.json();
};
```

### deleteNote
```typescript
const deleteNote = async (id: string): Promise<boolean> => {
  const response = await fetch(`/api/note/${id}`, {
    method: 'DELETE',
  });
  
  if (response.status === 204) {
    return true;
  }
  
  if (response.status === 404) {
    throw new Error('Notatka nie została znaleziona');
  }
  
  if (response.status === 401) {
    throw new Error('Unauthorized');
  }
  
  throw new Error('Failed to delete note');
};
```

## 8. Interakcje użytkownika

1. **Ładowanie widoku**
   - **Akcja**: Użytkownik przechodzi do URL `/saved`
   - **Wynik**: System pobiera i wyświetla listę zapisanych propozycji AI

2. **Paginacja wyników**
   - **Akcja**: Użytkownik klika przycisk następnej/poprzedniej strony
   - **Wynik**: System pobiera i wyświetla odpowiednią stronę wyników

3. **Inicjowanie usunięcia propozycji**
   - **Akcja**: Użytkownik klika przycisk "Usuń" na karcie propozycji
   - **Wynik**: System wyświetla dialog potwierdzenia usunięcia

4. **Potwierdzenie usunięcia propozycji**
   - **Akcja**: Użytkownik potwierdza usunięcie w dialogu
   - **Wynik**: System usuwa propozycję, odświeża listę i wyświetla powiadomienie o sukcesie

5. **Anulowanie usunięcia propozycji**
   - **Akcja**: Użytkownik anuluje usunięcie w dialogu
   - **Wynik**: System zamyka dialog i zachowuje propozycję na liście

6. **Stan pusty**
   - **Akcja**: Brak propozycji AI do wyświetlenia
   - **Wynik**: System wyświetla komponent EmptyState

## 9. Warunki i walidacja

1. **Walidacja autoryzacji**
   - **Warunek**: Użytkownik musi być zalogowany, aby zobaczyć swoje propozycje AI
   - **Komponenty**: SavedSuggestionsPage
   - **Wpływ na UI**: Przekierowanie do strony logowania, jeśli użytkownik nie jest zalogowany

2. **Walidacja paginacji**
   - **Warunek**: Numer strony musi być liczbą całkowitą większą od 0
   - **Komponenty**: PaginationControls
   - **Wpływ na UI**: Nieaktywny przycisk poprzedniej strony, gdy jest to pierwsza strona

3. **Walidacja dostępności propozycji**
   - **Warunek**: Lista propozycji może być pusta
   - **Komponenty**: SavedSuggestionsList
   - **Wpływ na UI**: Wyświetlenie komponentu EmptyState zamiast listy, gdy brak propozycji

## 10. Obsługa błędów

1. **Błąd autoryzacji (401)**
   - **Przyczyna**: Brak ważnego tokenu uwierzytelniającego
   - **Obsługa**: Przekierowanie do strony logowania z informacją o wygaśnięciu sesji
   - **Komunikat**: "Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować."

2. **Błąd pobierania propozycji**
   - **Przyczyna**: Problem z połączeniem sieciowym lub błąd serwera
   - **Obsługa**: Wyświetlenie komunikatu o błędzie i przycisku do ponownej próby
   - **Komunikat**: "Nie udało się pobrać propozycji. Spróbuj ponownie."

3. **Błąd usuwania propozycji (404)**
   - **Przyczyna**: Propozycja została już usunięta lub nie istnieje
   - **Obsługa**: Wyświetlenie komunikatu toast i odświeżenie listy
   - **Komunikat**: "Propozycja nie istnieje lub została już usunięta."

4. **Błąd usuwania propozycji (500)**
   - **Przyczyna**: Problem z serwerem podczas usuwania
   - **Obsługa**: Wyświetlenie komunikatu toast z możliwością ponowienia akcji
   - **Komunikat**: "Wystąpił błąd podczas usuwania propozycji. Spróbuj ponownie."

## 11. Kroki implementacji

1. **Utworzenie podstawowej struktury plików**
   - Utworzenie pliku strony `src/pages/saved.astro`
   - Utworzenie folderu komponentów `src/components/saved-suggestions/`

2. **Implementacja modeli danych i typów**
   - Utworzenie pliku `src/components/saved-suggestions/types.ts` z definicjami typów
   - Zdefiniowanie TypeScript interfaces dla komponentów

3. **Implementacja customowych hooków**
   - Utworzenie pliku `src/components/hooks/useAiNotes.ts`
   - Utworzenie pliku `src/components/hooks/useDeleteNote.ts`
   - Utworzenie pliku `src/components/hooks/useToast.ts`

4. **Implementacja komponentów UI**
   - Implementacja AiNoteCard
   - Implementacja DeleteButton
   - Implementacja DeleteConfirmationDialog
   - Implementacja PaginationControls
   - Implementacja EmptyState
   - Implementacja ToastNotification

5. **Integracja z API**
   - Implementacja funkcji dostępowych do API w `src/lib/services/note.service.ts`
   - Połączenie hooków z funkcjami API

6. **Składanie komponentów w całość**
   - Implementacja komponentu SavedSuggestionsList
   - Implementacja strony SavedSuggestionsPage w Astro

7. **Testowanie i debugowanie**
   - Testowanie interakcji użytkownika
   - Testowanie obsługi błędów
   - Testowanie różnych stanów UI (ładowanie, pusty, błąd)

8. **Finalizacja i refaktoryzacja**
   - Optymalizacja wydajności (memoizacja, lazy loading)
   - Upewnienie się, że wszystkie teksty są właściwe
   - Finalne dostosowanie stylów UI
