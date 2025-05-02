# Plan implementacji widoku "Moje podróże"

## 1. Przegląd
Widok **Moje podróże** jest głównym widokiem aplikacji VibeTravels dla zalogowanych użytkowników. Umożliwia przeglądanie, tworzenie, edytowanie i usuwanie notatek dotyczących podróży, a także generowanie i zapisywanie sugestii AI opartych na istniejących notatkach użytkownika.

## 2. Routing widoku
- **Ścieżka:** `/` (strona główna dla zalogowanych użytkowników)

## 3. Struktura komponentów

```
MyTravelsView (Astro Page)
├── Header (Astro Component)
├── NoteSection (Astro Component)
│   ├── SectionHeader (Astro Component)
│   │   └── CreateNoteButton (React Component)
│   ├── NotesGrid (React Component)
│   │   └── NoteCard[] (React Component)
│   └── Pagination (React Component)
├── AISuggestionSection (React Component)
│   ├── SectionHeader (Astro Component)
│   │   └── GenerateSuggestionsButton (React Component)
│   └── SuggestionsList (React Component)
│       └── SuggestionCard[] (React Component)
├── Modals
│   ├── NoteFormModal (React Component)
│   │   └── NoteForm (React Component)
│   └── NoteSelectionModal (React Component)
│       └── NoteCheckboxList (React Component)
└── ToastContainer (React Component)
```

## 4. Zalecana struktura katalogów

- Główny komponent strony: `src/pages/index.astro`
- Komponenty sekcji notatek: `src/components/notes/`
- Komponenty AI suggestions: `src/components/suggestions/`
- Komponenty współdzielone (UI): `src/components/ui/`
- Komponenty modalne: `src/components/modals/`

## 5. Typy

### Typy podstawowe z backendu
```typescript
// Typy z src/types.ts
interface NoteDetailDto {
  id: string;
  content: string;
type?: "user" | "ai";
  created_at: string;
  updated_at: string;
}

interface CreateNoteDto {
  content: string;
}

interface UpdateNoteDto {
  content: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
}

interface NoteListResponse {
  data: NoteDetailDto[];
  pagination: PaginationResult;
}

interface SuggestionRequest {
  note_ids: string[];
}

interface SuggestionResponse {
  suggestions: string[];
}

interface AiNoteRequest {
  content: string;
}
```

### Niestandardowe typy ViewModels
```typescript
// ViewModel dla notatek
interface NoteViewModel extends NoteDetailDto {
  selected?: boolean;      // Używane do wyboru notatek do analizy przez AI
  isExpanded?: boolean;    // Rozwinięcie notatki do pełnego widoku
  isEditing?: boolean;     // Stan edycji dla notatki
}

// Stan edycji notatki
interface NoteFormState {
  id?: string;             // undefined dla nowej notatki, string dla edycji
  content: string;
  isSubmitting: boolean;
  errors: {
    content?: string;
    form?: string;
  };
}

// Stan wyboru notatek do AI
interface NoteSelectionState {
  selectedNoteIds: string[];
  isOpen: boolean;
}

// Stan sugestii AI
interface AiSuggestionState {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
}

// Typy dla toastów
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}
```

## 6. Zarządzanie stanem

### Główne hooki

#### `useNotesState`
Hook zarządzający stanem notatek użytkownika.

```typescript
function useNotesState() {
  const [notes, setNotes] = useState<NoteViewModel[]>([]);
  const [pagination, setPagination] = useState<PaginationResult>({ 
    page: 1, 
    limit: 6, 
    total: 0 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie notatek
  const fetchNotes = async (page: number = 1, limit: number = 6) => {
    setIsLoading(true);
    try {
      // Wywołanie API
      // Aktualizacja stanu
    } catch (error) {
      setError('Nie udało się pobrać notatek');
    } finally {
      setIsLoading(false);
    };
  };

  // Operacje CRUD dla notatek
  const createNote = async (content: string) => {...};
  const updateNote = async (id: string, content: string) => {...};
  const deleteNote = async (id: string) => {...};

  // Zarządzanie selekcją notatek do AI
  const toggleNoteSelection = (id: string) => {...};
  const getSelectedNotes = () => notes.filter(note => note.selected);

  // Efekt pobierania notatek przy montowaniu komponentu
  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    pagination,
    isLoading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleNoteSelection,
    getSelectedNotes
  };
}
```

#### `useAiSuggestions`
Hook zarządzający sugestiami AI.

```typescript
function useAiSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async (noteIds: string[]) => {
    if (noteIds.length === 0) {
      setError('Wybierz co najmniej jedną notatkę');
      return;
    }

    setIsGenerating(true);
    try {
      // Wywołanie API
      // Aktualizacja stanu
    } catch (error) {
      setError('Nie udało się wygenerować sugestii');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsSuggestion = async (content: string) => {
    try {
      // Wywołanie API do zapisania jako notatka AI
    } catch (error) {
      setError('Nie udało się zapisać sugestii jako notatki');
    }
  };

  return {
    suggestions,
    isGenerating,
    error,
    generateSuggestions,
    saveAsSuggestion
  };
}
```

#### `useNotesModal`
Hook zarządzający stanem modali dla notatek.

```typescript
function useNotesModal() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  
  // Funkcje otwierające/zamykające modale
  const openCreateModal = () => {...};
  const openEditModal = (noteId: string) => {...};
  const openSelectionModal = () => {...};
  const closeAllModals = () => {...};
  
  return {
    isCreateModalOpen,
    isEditModalOpen,
    isSelectionModalOpen,
    currentNoteId,
    openCreateModal,
    openEditModal,
    openSelectionModal,
    closeAllModals
  };
}
```

#### `useToast`
Hook zarządzający systemem powiadomień toast.

```typescript
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (type: ToastType, message: string, duration: number = 5000) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  return { toasts, addToast, removeToast };
}
```

## 7. Integracja API

### Wywołania API

#### Pobieranie notatek
```typescript
async function fetchNotes(page: number = 1, limit: number = 6, type?: 'user' | 'ai') {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (type) {
    queryParams.append('type', type);
  }
  
  const response = await fetch(`/api/notes?${queryParams.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Nie udało się pobrać notatek');
  }
  
  return await response.json() as NoteListResponse;
}
```

#### Tworzenie notatki
```typescript
async function createNote(content: string) {
  const response = await fetch('/api/note', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Nie udało się utworzyć notatki');
  }
  
  return await response.json() as NoteDetailDto;
}
```

#### Aktualizacja notatki
```typescript
async function updateNote(id: string, content: string) {
  const response = await fetch(`/api/note/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Nie udało się zaktualizować notatki');
  }
  
  return await response.json() as NoteDetailDto;
}
```

#### Usuwanie notatki
```typescript
async function deleteNote(id: string) {
  const response = await fetch(`/api/note/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Nie udało się usunąć notatki');
  }
  
  return true;
}
```

#### Generowanie sugestii AI
```typescript
async function generateSuggestions(noteIds: string[]) {
  const response = await fetch('/api/suggestion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note_ids: noteIds }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Nie udało się wygenerować sugestii');
  }
  
  return await response.json() as SuggestionResponse;
}
```

#### Zapisywanie sugestii jako notatki AI
```typescript
async function saveAsSuggestion(content: string) {
  const response = await fetch('/api/note/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Nie udało się zapisać sugestii jako notatki');
  }
  
  return await response.json() as NoteDetailDto;
}
```

## 8. Interakcje użytkownika

### Przeglądanie notatek

1. **Widok listy notatek**
   - Po zalogowaniu użytkownik automatycznie trafia na stronę główną z notatkami
   - Notatki są wyświetlane w formie kart w siatce
   - Widoczny jest tytuł sekcji i przycisk "Dodaj notatkę"
   - Użytkownik może przewijać stronę z notatkami (paginacja)

2. **Filtracja notatek**
   - Możliwość przełączania między wszystkimi notatkami a tylko notatkami AI
   - Kliknięcie przycisku filtru aktualizuje listę notatek

3. **Paginacja**
   - Na dole sekcji notatek znajduje się komponent paginacji
   - Kliknięcie numeru strony lub przycisku "Następna/Poprzednia" ładuje odpowiednią stronę notatek

### Zarządzanie notatkami

1. **Tworzenie notatki**
   - Kliknięcie przycisku "Dodaj notatkę" otwiera modal z formularzem
   - Formularz zawiera pole tekstowe na treść notatki
   - Przyciski "Anuluj" i "Zapisz"
   - Po zapisaniu modal się zamyka, a lista notatek odświeża się automatycznie
   - Pojawia się powiadomienie toast o sukcesie

2. **Edycja notatki**
   - Przy każdej notatce utworzonej przez użytkownika widoczny jest przycisk "Edytuj"
   - Kliknięcie przycisku otwiera modal z formularzem wypełnionym aktualną treścią
   - Po zapisaniu zmian modal się zamyka, a notatka aktualizuje się na liście
   - Pojawia się powiadomienie toast o sukcesie

3. **Usuwanie notatki**
   - Przy każdej notatce widoczny jest przycisk "Usuń"
   - Kliknięcie przycisku wywołuje potwierdzenie usunięcia (mały modal lub alert)
   - Po potwierdzeniu notatka znika z listy
   - Pojawia się powiadomienie toast o sukcesie

### Interakcje z AI

1. **Wybieranie notatek do analizy przez AI**
   - Kliknięcie przycisku "Gdzie powinienem się udać" otwiera modal wyboru notatek
   - Użytkownik zaznacza checkboxy przy notatkach, które chce uwzględnić w analizie
   - Przycisk "Generuj sugestie" jest aktywny tylko gdy wybrano co najmniej jedną notatkę
   - Przycisk "Anuluj" zamyka modal bez wykonywania akcji

2. **Generowanie sugestii**
   - Po kliknięciu "Generuj sugestie" modal się zamyka
   - Pojawia się animacja ładowania w sekcji sugestii AI
   - Po zakończeniu generowania wyświetlane są sugestie (max 5)

3. **Zapisywanie sugestii jako notatki**
   - Przy każdej sugestii widoczny jest przycisk "Zapisz jako notatkę"
   - Kliknięcie przycisku zapisuje sugestję jako notatkę AI
   - Pojawia się powiadomienie toast o sukcesie
   - Notatka pojawia się na liście notatek (jeśli filtr na to pozwala)

## 9. Warunki i walidacja

### Formularz tworzenia/edycji notatki

1. **Walidacja pola treści**
   - Pole jest wymagane: "Treść notatki jest wymagana"
   - Maksymalna długość: "Treść notatki nie może przekraczać 5000 znaków"
   - Walidacja w czasie rzeczywistym (na blur lub submit)

2. **Walidacja formularza**
   - Przycisk "Zapisz" jest nieaktywny, gdy formularz nie przechodzi walidacji
   - Błędy są wyświetlane pod odpowiednimi polami
   - Ogólny błąd formularza (np. z API) jest wyświetlany na górze

### Modal wyboru notatek do analizy AI

1. **Walidacja wyboru**
   - Wybór co najmniej jednej notatki jest wymagany
   - Przycisk "Generuj sugestie" jest nieaktywny, gdy nie wybrano żadnej notatki
   - Komunikat o błędzie: "Wybierz co najmniej jedną notatkę do analizy"

### Zapis sugestii AI

1. **Walidacja treści sugestii**
   - System sprawdza, czy treść sugestii nie przekracza 5000 znaków
   - W przypadku przekroczenia limitu: "Treść sugestii jest zbyt długa"

## 10. Obsługa błędów

### Błędy ładowania danych

1. **Błąd pobierania notatek**
   - W przypadku nieudanego ładowania notatek wyświetlany jest komunikat błędu
   - "Nie udało się pobrać notatek. Spróbuj odświeżyć stronę."
   - Przycisk "Spróbuj ponownie" pozwala ponowić próbę pobrania

2. **Brak notatek**
   - Jeśli użytkownik nie ma jeszcze żadnych notatek, wyświetlany jest przyjazny komunikat
   - "Nie masz jeszcze żadnych notatek. Dodaj swoją pierwszą notatkę!"
   - Przycisk "Dodaj notatkę" bezpośrednio w sekcji komunikatu

### Błędy operacji CRUD

1. **Błąd tworzenia/edycji notatki**
   - W przypadku błędu podczas zapisywania wyświetlany jest komunikat w formularzu
   - "Nie udało się zapisać notatki. Spróbuj ponownie."
   - Formularz pozostaje otwarty, umożliwiając poprawkę i ponowną próbę

2. **Błąd usuwania notatki**
   - W przypadku błędu podczas usuwania wyświetlane jest powiadomienie toast
   - "Nie udało się usunąć notatki. Spróbuj ponownie później."

### Błędy AI

1. **Błąd generowania sugestii**
   - W przypadku błędu podczas generowania sugestii wyświetlany jest komunikat
   - "Nie udało się wygenerować sugestii. Spróbuj ponownie później."
   - Przycisk "Spróbuj ponownie" pozwala ponowić próbę

2. **Błąd zapisywania sugestii jako notatki**
   - W przypadku błędu podczas zapisywania sugestii wyświetlane jest powiadomienie toast
   - "Nie udało się zapisać sugestii jako notatki. Spróbuj ponownie."

### Błędy połączenia

1. **Utrata połączenia z internetem**
   - W przypadku utraty połączenia wyświetlany jest komunikat na górze strony
   - "Brak połączenia z internetem. Sprawdź swoje połączenie i spróbuj ponownie."
   - Automatyczne odnawianie próby połączenia

## 11. Kroki implementacji

### 1. Przygotowanie struktury projektów i komponentów

1. Utworzenie głównego pliku strony:
   ```
   src/pages/index.astro
   ```

2. Utworzenie struktury katalogów komponentów:
   ```
   src/components/notes/
   src/components/suggestions/
   src/components/ui/
   src/components/modals/
   ```

3. Implementacja podstawowego layoutu strony w `index.astro`

### 2. Implementacja komponentów statycznych (Astro)

1. **Header** - Górny pasek nawigacyjny:
   ```
   src/components/Header.astro
   ```

2. **NoteSection** - Kontener dla sekcji notatek:
   ```
   src/components/notes/NoteSection.astro
   ```

3. **SectionHeader** - Nagłówki sekcji:
   ```
   src/components/ui/SectionHeader.astro
   ```

### 3. Implementacja komponentów UI (React + Shadcn/ui)

1. **CreateNoteButton** - Przycisk tworzenia nowej notatki:
   ```
   src/components/notes/CreateNoteButton.tsx
   ```

2. **NoteCard** - Komponent karty pojedynczej notatki:
   ```
   src/components/notes/NoteCard.tsx
   ```

3. **NotesGrid** - Siatka notatek z obsługą pustego stanu:
   ```
   src/components/notes/NotesGrid.tsx
   ```

4. **Pagination** - Komponent paginacji:
   ```
   src/components/ui/Pagination.tsx
   ```

5. **ToastContainer** i **Toast** - System powiadomień:
   ```
   src/components/ui/Toast.tsx
   src/components/ui/ToastContainer.tsx
   ```

### 4. Implementacja modali (React)

1. **NoteFormModal** - Modal z formularzem tworzenia/edycji notatki:
   ```
   src/components/modals/NoteFormModal.tsx
   ```

2. **NoteForm** - Formularz edycji notatki:
   ```
   src/components/notes/NoteForm.tsx
   ```

3. **NoteSelectionModal** - Modal wyboru notatek do analizy AI:
   ```
   src/components/modals/NoteSelectionModal.tsx
   ```

4. **NoteCheckboxList** - Lista notatek z checkboxami:
   ```
   src/components/notes/NoteCheckboxList.tsx
   ```

### 5. Implementacja komponentów sekcji AI (React)

1. **AISuggestionSection** - Kontener dla sekcji sugestii AI:
   ```
   src/components/suggestions/AISuggestionSection.tsx
   ```

2. **GenerateSuggestionsButton** - Przycisk generowania sugestii:
   ```
   src/components/suggestions/GenerateSuggestionsButton.tsx
   ```

3. **SuggestionsList** - Lista wygenerowanych sugestii:
   ```
   src/components/suggestions/SuggestionsList.tsx
   ```

4. **SuggestionCard** - Karta pojedynczej sugestii:
   ```
   src/components/suggestions/SuggestionCard.tsx
   ```

### 6. Implementacja hooków stanu (React)

1. **useNotesState** - Hook do zarządzania stanem notatek:
   ```
   src/hooks/useNotesState.ts
   ```

2. **useAiSuggestions** - Hook do zarządzania sugestiami AI:
   ```
   src/hooks/useAiSuggestions.ts
   ```

3. **useNotesModal** - Hook do zarządzania stanem modali:
   ```
   src/hooks/useNotesModal.ts
   ```

4. **useToast** - Hook do zarządzania powiadomieniami:
   ```
   src/hooks/useToast.ts
   ```

### 7. Implementacja funkcji pomocnicznych

1. **API client** - Funkcje do komunikacji z API:
   ```
   src/lib/api/notes.ts
   src/lib/api/suggestions.ts
   ```

2. **Validators** - Funkcje do walidacji:
   ```
   src/lib/validators/noteValidators.ts
   ```

3. **Utils** - Funkcje pomocnicze:
   ```
   src/lib/utils.ts
   ```

### 8. Integracja i testowanie

1. Integracja komponentów z hookami stanu
2. Testowanie operacji CRUD dla notatek
3. Testowanie generowania i zapisywania sugestii AI
4. Testowanie obsługi błędów i przypadków brzegowych
5. Testowanie dostępności i responsywności
