# Architektura UI dla VibeTravels MVP

## 1. Przegląd struktury UI

VibeTravels MVP to aplikacja webowa umożliwiająca użytkownikom zapisywanie luźnych notatek dotyczących pomysłów na podróże oraz generowanie sugestii podróży przy użyciu AI. Struktura UI została zaprojektowana z myślą o prostocie użytkowania i intuicyjnej nawigacji.

Główne elementy struktury UI:
- **Widok uwierzytelniania** - formularz logowania i rejestracji dla niezalogowanych użytkowników
- **Panel nawigacyjny** - górny pasek z zakładkami do głównych sekcji aplikacji oraz opcją wylogowania
- **Sekcja "Moje podróże"** - trójdzielny widok zawierający notatki użytkownika, przycisk generowania sugestii i propozycje AI
- **Sekcja "Zapisane propozycje"** - widok zapisanych przez użytkownika propozycji AI

Aplikacja wykorzystuje responsywny design, który dostosowuje się do urządzeń mobilnych i desktopowych przy zachowaniu spójnego układu i funkcjonalności.

## 2. Lista widoków

### Widok logowania/rejestracji
- **Nazwa widoku**: Auth View
- **Ścieżka widoku**: `/auth` (z opcjonalnym parametrem `?mode=register` dla formularza rejestracji)
- **Główny cel**: Umożliwienie użytkownikom logowania lub rejestracji w aplikacji
- **Kluczowe informacje do wyświetlenia**: 
  - Formularz logowania/rejestracji
  - Przycisk przełączania między trybami logowania i rejestracji
  - Informacje o statusie logowania/rejestracji
- **Kluczowe komponenty widoku**:
  - Formularz z polami: email, hasło (i potwierdzenie hasła dla rejestracji)
  - Przyciski akcji (Zaloguj/Zarejestruj)
  - Komunikaty o błędach walidacji
- **UX, dostępność i względy bezpieczeństwa**:
  - Walidacja pól formularza w czasie rzeczywistym
  - Czytelne komunikaty błędów
  - Bezpieczne przechowywanie danych uwierzytelniania
  - Obsługa tabulacji i dostępność dla czytników ekranu
  - System toastów do informowania o statusie logowania/rejestracji

### Widok "Moje podróże"
- **Nazwa widoku**: My Travels
- **Ścieżka widoku**: `/` (strona główna dla zalogowanych użytkowników)
- **Główny cel**: Wyświetlanie notatek użytkownika i generowanie sugestii AI
- **Kluczowe informacje do wyświetlenia**:
  - Lista notatek użytkownika
  - Przycisk do generowania sugestii AI
  - Lista wygenerowanych propozycji AI
- **Kluczowe komponenty widoku**:
  - Sekcja notatek z kartami notatek użytkownika
  - Formularz tworzenia/edycji notatek
  - Przyciski akcji dla notatek (edycja, usunięcie)
  - Przycisk "Gdzie powinienem się udać" z funkcją wyboru notatek
  - Sekcja propozycji AI z możliwością zapisania
  - Animacja ładowania podczas generowania sugestii
- **UX, dostępność i względy bezpieczeństwa**:
  - Karty notatek o stałej szerokości i dynamicznej wysokości
  - Możliwość wyboru notatek do analizy AI
  - Interaktywne elementy dla propozycji AI (przycisk "Zapisz" po najechaniu)
  - Wyraźny podział wizualny między sekcjami
  - Powiadomienia toast po wykonaniu akcji

### Widok "Zapisane propozycje"
- **Nazwa widoku**: Saved Suggestions
- **Ścieżka widoku**: `/saved`
- **Główny cel**: Przeglądanie zapisanych propozycji wygenerowanych przez AI
- **Kluczowe informacje do wyświetlenia**:
  - Lista zapisanych propozycji AI
- **Kluczowe komponenty widoku**:
  - Karty z zapisanymi propozycjami AI
  - Przyciski akcji (usunięcie)
- **UX, dostępność i względy bezpieczeństwa**:
  - Jednolity wygląd kart propozycji
  - Wyraźne oznaczenie propozycji jako wygenerowanych przez AI
  - Powiadomienia toast po wykonaniu akcji

### Modal tworzenia/edycji notatki
- **Nazwa widoku**: Note Editor Modal
- **Ścieżka widoku**: Komponent modalny (bez osobnej ścieżki)
- **Główny cel**: Umożliwienie tworzenia i edycji notatek
- **Kluczowe informacje do wyświetlenia**:
  - Formularz edycji treści notatki
- **Kluczowe komponenty widoku**:
  - Pole tekstowe do wprowadzania treści notatki
  - Przyciski akcji (Zapisz, Anuluj)
- **UX, dostępność i względy bezpieczeństwa**:
  - Proste pole tekstowe bez formatowania
  - Walidacja długości tekstu (max 5000 znaków)
  - Obsługa tabulacji i dostępność dla czytników ekranu
  - Zapamiętywanie stanu formularza przy przerwaniu edycji

## 3. Mapa podróży użytkownika

### Proces uwierzytelniania
1. Użytkownik wchodzi na stronę i widzi formularz logowania
2. Użytkownik może:
   - Wprowadzić dane logowania i kliknąć "Zaloguj"
   - Przełączyć na formularz rejestracji, wprowadzić dane i kliknąć "Zarejestruj"
3. Po pomyślnym uwierzytelnieniu, użytkownik jest przekierowywany na stronę główną "Moje podróże"
4. W każdej chwili zalogowany użytkownik może wylogować się, klikając "Wyloguj" w menu nawigacyjnym

### Zarządzanie notatkami
1. Na stronie "Moje podróże" użytkownik widzi listę swoich notatek
2. Użytkownik może:
   - Utworzyć nową notatkę, klikając przycisk "Dodaj notatkę"
   - Edytować istniejącą notatkę, klikając przycisk "Edytuj" przy notatce
   - Usunąć notatkę, klikając przycisk "Usuń" przy notatce
3. Podczas tworzenia/edycji, otwiera się modal z polem tekstowym
4. Po zapisaniu zmian, lista notatek jest automatycznie aktualizowana
5. System wyświetla komunikat toast potwierdzający wykonanie akcji

### Generowanie sugestii AI
1. Na stronie "Moje podróże" użytkownik może wybrać pojedyncze notatki lub wszystkie
2. Po wybraniu notatek użytkownik klika przycisk "Gdzie powinienem się udać"
3. System wyświetla animację ładowania podczas przetwarzania
4. Po zakończeniu, wygenerowane propozycje AI pojawiają się w dolnej części strony
5. Po najechaniu na propozycję, pojawia się przycisk "Zapisz"
6. Kliknięcie "Zapisz" przenosi propozycję do sekcji "Zapisane propozycje"
7. System wyświetla komunikat toast potwierdzający zapisanie propozycji

### Przeglądanie zapisanych propozycji
1. Użytkownik przechodzi do zakładki "Zapisane propozycje" z górnego menu
2. Wyświetlana jest lista wszystkich zapisanych propozycji AI
3. Użytkownik może usunąć propozycję, klikając przycisk "Usuń"
4. System wyświetla komunikat toast potwierdzający usunięcie

## 4. Układ i struktura nawigacji

### Główna struktura nawigacyjna
- **Panel górny (Navbar)** - dostępny na wszystkich ekranach dla zalogowanych użytkowników:
  - Logo aplikacji (lewy róg)
  - Zakładka "Moje podróże" (aktywna domyślnie)
  - Zakładka "Zapisane propozycje"
  - Przycisk "Wyloguj" (prawy róg)

### Nawigacja kontekstowa
- W widoku "Moje podróże":
  - Przycisk "Dodaj notatkę" w górnej części listy notatek
  - Przycisk "Gdzie powinienem się udać" w środkowej części ekranu
  - Przyciski akcji przy notatkach (edycja, usunięcie)
  - Przyciski "Zapisz" przy propozycjach AI (widoczne po najechaniu)

- W widoku "Zapisane propozycje":
  - Przyciski "Usuń" przy zapisanych propozycjach

### Zachowanie responsywne
- W wersji mobilnej:
  - Górny panel nawigacyjny pozostaje bez zmian
  - Karty notatek i propozycji zajmują pełną szerokość ekranu
  - Formularze i przyciski dostosowują się do mniejszych ekranów
  - Zachowane są wszystkie funkcjonalności z wersji desktopowej

## 5. Kluczowe komponenty

### Komponenty nawigacyjne
- **NavigationBar** - górny pasek nawigacyjny z zakładkami i opcją wylogowania
- **AuthRedirect** - komponent przekierowujący niezalogowanych użytkowników do ekranu logowania

### Komponenty notatek
- **NoteCard** - karta wyświetlająca treść notatki i przyciski akcji
- **NoteList** - kontener wyświetlający listę notatek użytkownika
- **NoteEditor** - modal z formularzem do tworzenia i edycji notatek
- **NoteSelection** - komponent do wyboru notatek do analizy AI

### Komponenty AI
- **SuggestionGenerator** - sekcja z przyciskiem "Gdzie powinienem się udać" i logiką wyboru notatek
- **AIProposalCard** - karta wyświetlająca propozycję AI z przyciskiem "Zapisz"
- **SavedProposalList** - kontener wyświetlający listę zapisanych propozycji AI
- **LoadingAnimation** - animacja wyświetlana podczas generowania propozycji

### Komponenty funkcjonalne
- **ToastNotification** - system powiadomień informujących o statusie wykonanych akcji
- **AuthForm** - formularz logowania/rejestracji z walidacją
- **ErrorBoundary** - komponent obsługujący nieoczekiwane błędy w aplikacji

### Contexty i hooki
- **AuthContext** - zarządzanie stanem uwierzytelnienia użytkownika
- **NotesContext** - zarządzanie stanem notatek użytkownika
- **AIContext** - zarządzanie stanem propozycji AI
- **useNotes** - hook dostarczający funkcje do zarządzania notatkami
- **useAIProposals** - hook dostarczający funkcje do generowania i zarządzania propozycjami AI
