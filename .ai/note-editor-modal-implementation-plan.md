# Plan implementacji widoku Note Editor Modal

## 1. Przegląd
Modal edycji notatek to komponowany komponent interfejsu użytkownika, który umożliwia tworzenie nowych notatek oraz edycję istniejących notatek stworzonych przez użytkownika. Modal zawiera prosty formularz z polem tekstowym do wprowadzania treści notatki oraz przyciskami akcji (Zapisz, Anuluj). Komponent obsługuje walidację wprowadzonych danych i zapewnia odpowiednią dostępność dla użytkowników korzystających z czytników ekranu lub klawiatury.

## 2. Routing widoku
Ten komponent nie ma dedykowanej ścieżki URL, ponieważ jest modalem wyświetlanym w kontekście innych widoków (głównie na stronie "Moje podróże"). Modal jest aktywowany po kliknięciu przycisku "Dodaj notatkę" lub "Edytuj" przy istniejącej notatce.

## 3. Struktura komponentów
```
NoteEditorModal
├── Dialog (shadcn/ui)
│   ├── DialogTrigger (opcjonalnie)
│   ├── DialogContent
│   │   ├── DialogHeader
│   │   │   ├── DialogTitle
│   │   │   └── DialogDescription
│   │   ├── NoteForm
│   │   │   ├── Form (shadcn/ui)
│   │   │   │   ├── FormField (pole tekstowe)
│   │   │   │   └── FormFooter (przyciski akcji)
│   │   └── DialogFooter
└── Toaster (powiadomienia)
```

## 4. Szczegóły komponentów

### NoteEditorModal
- **Opis komponentu**: Główny komponent modalny odpowiedzialny za wyświetlanie formularza edycji notatki w kontekście modalnym.
- **Główne elementy**: Dialog, DialogContent, NoteForm
- **Obsługiwane interakcje**: 
  - Otwarcie modalu (przy tworzeniu lub edycji)
  - Zamknięcie modalu (po zapisaniu, anulowaniu lub kliknięciu poza modalem)
- **Obsługiwana walidacja**: Nie dotyczy (walidacja jest w formularzu)
- **Typy**: `NoteEditorModalProps`
- **Propsy**:
  - `isOpen: boolean` - czy modal jest otwarty
  - `onOpenChange: (open: boolean) => void` - handler zmiany stanu otwarcia
  - `noteId?: string` - opcjonalne ID notatki do edycji (brak dla nowej notatki)
  - `onSuccess?: () => void` - callback wywoływany po pomyślnym zapisaniu

### NoteForm
- **Opis komponentu**: Formularz umożliwiający wprowadzenie lub edycję treści notatki.
- **Główne elementy**: 
  - Form (z shadcn/ui)
  - FormField z komponentem Textarea do wprowadzania treści
  - Przyciski akcji (Zapisz, Anuluj)
- **Obsługiwane interakcje**:
  - Wprowadzanie tekstu
  - Zatwierdzanie formularza (przycisk Zapisz)
  - Anulowanie (przycisk Anuluj)
- **Obsługiwana walidacja**:
  - Maksymalna długość tekstu: 5000 znaków
  - Pole nie może być puste
- **Typy**: `NoteFormProps`, `NoteFormValues`
- **Propsy**:
  - `noteId?: string` - opcjonalne ID notatki do edycji
  - `defaultValues?: NoteFormValues` - początkowe wartości formularza
  - `onSubmit: (values: NoteFormValues) => Promise<void>` - handler zatwierdzenia
  - `onCancel: () => void` - handler anulowania
  - `isSubmitting: boolean` - czy trwa zapisywanie

## 5. Typy

```typescript
// Typy notatki z systemu (istnieją już w types.ts)
interface Note {
  id: string;
  content: string;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

// Dane wejściowe formularza
interface NoteFormValues {
  content: string;
}

// Dane dla żądania PUT podczas aktualizacji
interface UpdateNoteInput {
  content: string;
}

// Props komponentu modalnego
interface NoteEditorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteId?: string;
  onSuccess?: () => void;
}

// Props formularza notatki
interface NoteFormProps {
  noteId?: string;
  defaultValues?: NoteFormValues;
  onSubmit: (values: NoteFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Schemat walidacji formularza (Zod)
const noteFormSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Notatka nie może być pusta." })
    .max(5000, { message: "Notatka nie może przekraczać 5000 znaków." })
});

// Typ dla kontekstu hooka zarządzającego edytorem
interface UseNoteEditorReturn {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  noteToEdit: Note | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: Error | null;
  handleOpenChange: (open: boolean) => void;
  handleSave: (values: NoteFormValues) => Promise<void>;
  handleCancel: () => void;
}
```

## 6. Zarządzanie stanem

Implementacja hooka `useNoteEditor` do zarządzania stanem modalu:

```typescript
function useNoteEditor(noteId?: string, onSuccess?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Pobieranie danych notatki przy edycji
  useEffect(() => {
    if (noteId && isOpen) {
      fetchNote();
    }
  }, [noteId, isOpen]);

  const fetchNote = async () => {
    if (!noteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/note/${noteId}`);
      if (!response.ok) {
        throw new Error(`Błąd ${response.status}: ${await response.text()}`);
      }
      
      const note: Note = await response.json();
      
      // Sprawdzenie czy notatka nie jest wygenerowana przez AI
      if (note.is_ai_generated) {
        toast({
          title: "Błąd",
          description: "Nie można edytować notatek wygenerowanych przez AI.",
          variant: "destructive"
        });
        setIsOpen(false);
        return;
      }
      
      setNoteToEdit(note);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Wystąpił nieznany błąd'));
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać notatki do edycji.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (values: NoteFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (noteId) {
        // Aktualizacja istniejącej notatki
        const response = await fetch(`/api/note/${noteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Błąd ${response.status}: ${errorText}`);
        }
        
        toast({
          title: "Sukces",
          description: "Notatka została zaktualizowana."
        });
      } else {
        // Tworzenie nowej notatki - obsługa w komponencie nadrzędnym
      }
      
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Wystąpił nieznany błąd'));
      toast({
        title: "Błąd",
        description: err instanceof Error ? err.message : "Nie udało się zapisać notatki.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    // Jeśli zamykamy modal podczas edycji, możemy pokazać dialog potwierdzający
    setIsOpen(open);
    if (!open) {
      setNoteToEdit(null);
      setError(null);
    }
  };

  return {
    isOpen,
    setIsOpen,
    noteToEdit,
    isLoading,
    isSubmitting,
    error,
    handleOpenChange,
    handleSave,
    handleCancel
  };
}
```

## 7. Integracja API

Do integracji z API potrzebne są następujące funkcje:

1. **Pobieranie notatki do edycji**:
   - Endpoint: `GET /api/note/{id}`
   - Zwracany typ: `Note`
   - Obsługa błędów: 401 (nieautoryzowany), 404 (nie znaleziono)

2. **Aktualizacja notatki**:
   - Endpoint: `PUT /api/note/{id}`
   - Dane wejściowe: `{ content: string }`
   - Zwracany typ: `Note`
   - Obsługa błędów: 400 (nieprawidłowe dane), 401 (nieautoryzowany), 403 (zabronione - notatka AI), 404 (nie znaleziono)

Oba endpointy są już zaimplementowane w backendzie.

## 8. Interakcje użytkownika

1. **Tworzenie nowej notatki**:
   - Użytkownik klika przycisk "Dodaj notatkę" na stronie głównej
   - Otwiera się modal z pustym formularzem
   - Użytkownik wprowadza treść notatki
   - Użytkownik klika "Zapisz", aby utworzyć notatkę
   - System wyświetla komunikat o sukcesie
   - Modal zostaje zamknięty, a lista notatek odświeżona

2. **Edytowanie istniejącej notatki**:
   - Użytkownik klika przycisk "Edytuj" przy wybranej notatce
   - Otwiera się modal z formularzem wypełnionym aktualną treścią notatki
   - Użytkownik modyfikuje treść
   - Użytkownik klika "Zapisz", aby zaktualizować notatkę
   - System wyświetla komunikat o sukcesie
   - Modal zostaje zamknięty, a lista notatek odświeżona

3. **Anulowanie edycji**:
   - Użytkownik klika "Anuluj" lub poza obszarem modalu
   - Modal zostaje zamknięty bez zapisywania zmian

## 9. Warunki i walidacja

1. **Warunki dotyczące treści notatki**:
   - Pole nie może być puste (walidacja po stronie klienta)
   - Maksymalna długość tekstu: 5000 znaków (walidacja po stronie klienta i serwera)

2. **Warunki związane z edycją**:
   - Nie można edytować notatek wygenerowanych przez AI (walidacja przy pobieraniu oraz na backendzie)
   - Użytkownik może edytować tylko własne notatki (weryfikacja na backendzie)

## 10. Obsługa błędów

1. **Błędy walidacji formularza**:
   - Wyświetlanie komunikatu błędu pod polem, gdy treść jest pusta
   - Wyświetlanie komunikatu błędu pod polem, gdy treść przekracza 5000 znaków
   - Blokowanie przycisku "Zapisz" do czasu poprawienia błędów

2. **Błędy API**:
   - 400: Nieprawidłowe dane wejściowe - wyświetlenie komunikatu o błędzie
   - 401: Brak autoryzacji - przekierowanie do strony logowania
   - 403: Próba edycji notatki AI - wyświetlenie komunikatu o braku uprawnień
   - 404: Notatka nie istnieje - wyświetlenie komunikatu o błędzie
   - 500: Błąd serwera - wyświetlenie ogólnego komunikatu o błędzie

3. **Błędy sieci**:
   - Utrata połączenia - wyświetlenie komunikatu o braku połączenia
   - Timeout - wyświetlenie komunikatu o przekroczeniu czasu

## 11. Kroki implementacji

1. **Utworzenie typów i schematów walidacji**:
   - Zdefiniowanie typów `NoteFormValues`, `NoteEditorModalProps`, `NoteFormProps`
   - Implementacja schematu walidacji Zod

2. **Implementacja hooka `useNoteEditor`**:
   - Logika pobierania notatki
   - Logika aktualizacji notatki
   - Zarządzanie stanem modalu
   - Obsługa błędów i komunikatów

3. **Implementacja komponentu formularza `NoteForm`**:
   - Wykorzystanie komponentu Form z shadcn/ui
   - Implementacja pola tekstowego z walidacją
   - Dodanie przycisków akcji
   - Implementacja obsługi zdarzeń

4. **Implementacja komponentu modalnego `NoteEditorModal`**:
   - Wykorzystanie komponentu Dialog z shadcn/ui
   - Integracja z formularzem
   - Implementacja obsługi stanu modalu

5. **Integracja z komponentem listy notatek**:
   - Dodanie przycisków "Dodaj notatkę" i "Edytuj"
   - Implementacja odświeżania listy po zmianach

6. **Implementacja obsługi błędów i komunikatów**:
   - Dodanie komponentu Toast dla powiadomień
   - Implementacja obsługi błędów API
   - Obsługa walidacji formularza

7. **Testy dostępności i użyteczności**:
   - Sprawdzenie obsługi klawiatury
   - Weryfikacja atrybutów ARIA
   - Testowanie responsywności

8. **Optymalizacje**:
   - Dodanie zapamiętywania stanu formularza (np. przy przypadkowym zamknięciu)
   - Optymalizacja wydajności dla długich tekstów
