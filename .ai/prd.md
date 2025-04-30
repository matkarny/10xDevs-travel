# Dokument wymagań produktu (PRD) - VibeTravels MVP

## 1. Przegląd produktu

VibeTravels MVP to aplikacja webowa mająca na celu uproszczenie początkowej fazy planowania podróży. Umożliwia użytkownikom zapisywanie luźnych, tekstowych notatek dotyczących pomysłów na wycieczki. Kluczową funkcją jest integracja ze sztuczną inteligencją (AI), która na podstawie zebranych notatek użytkownika generuje nowe, opisowe propozycje kierunków lub zarysów podróży. Celem wersji MVP jest dostarczenie podstawowej funkcjonalności tworzenia notatek i generowania propozycji przez AI, wraz z prostym systemem kont użytkowników, aby zweryfikować kluczowe założenia produktu.

## 2. Problem użytkownika

Planowanie angażujących i interesujących wycieczek bywa trudne i czasochłonne. Użytkownicy często mają wiele luźnych pomysłów, inspiracji lub wymagań dotyczących przyszłych podróży, ale brakuje im narzędzia, które pomogłoby przekształcić te zdefragmentowane informacje w bardziej konkretne propozycje lub punkty wyjścia do dalszego planowania. Istnieje potrzeba prostego sposobu na agregację pomysłów i wykorzystanie nowoczesnych technologii (AI) do kreatywnego ich rozwinięcia.

## 3. Wymagania funkcjonalne

- FR-001: Uwierzytelnianie użytkowników: System umożliwiający rejestrację nowych użytkowników i logowanie istniejących. Szczegóły techniczne (np. użyta technologia, zakres przechowywanych danych) wymagają dalszej definicji.
- FR-002: Tworzenie notatek: Użytkownik może tworzyć nowe notatki w formie prostego tekstu.
- FR-003: Odczyt notatek: Użytkownik może przeglądać listę wszystkich swoich zapisanych notatek.
- FR-004: Usuwanie notatek: Użytkownik może usuwać pojedyncze notatki ze swojej listy.
- FR-010: Edycja notatek: Użytkownik może edytować treść swoich wcześniej utworzonych notatek.
- FR-005: Interfejs użytkownika: Główny widok aplikacji prezentuje listę notatek użytkownika.
- FR-006: Inicjacja AI: Dostępny jest przycisk lub akcja pozwalająca użytkownikowi zainicjować proces generowania propozycji przez AI.
- FR-007: Integracja z AI: System komunikuje się z zewnętrznym modelem LLM (Large Language Model).
    - FR-007a: Wejście dla AI: Do modelu LLM przekazywana jest treść wszystkich istniejących notatek danego użytkownika.
    - FR-007b: Logika AI: Szczegółowa logika działania i prompt używany do interakcji z LLM wymagają dalszej specyfikacji w fazie implementacji.
- FR-008: Generowanie propozycji: Model LLM generuje nową, opisową notatkę tekstową zawierającą propozycję kierunku lub zarys planu podróży.
- FR-009: Zapis propozycji AI: Wygenerowana przez AI propozycja jest automatycznie zapisywana jako nowa notatka w kolekcji użytkownika.

## 4. Granice produktu

Następujące funkcje i aspekty NIE wchodzą w zakres MVP:

- Współdzielenie notatek/planów: Brak możliwości udostępniania notatek innym użytkownikom.
- Obsługa multimediów: Aplikacja obsługuje wyłącznie notatki tekstowe; brak wsparcia dla zdjęć, filmów itp.
- Zaawansowane planowanie: Brak funkcji szczegółowego planowania logistyki, budżetu, rezerwacji czy harmonogramów.
- Edycja notatek AI: Brak możliwości edycji notatek wygenerowanych przez AI (użytkownik może edytować własne notatki - patrz FR-010).
- Eksport danych: Brak możliwości eksportowania notatek.
- Limity: Brak narzuconych limitów co do liczby notatek czy generowanych propozycji AI.
- Profile użytkowników i preferencje: Brak dedykowanej sekcji profilu użytkownika do zapisywania preferencji turystycznych (nawet opisowych).
- Monitoring i analityka: Brak śledzenia aktywności użytkowników i pomiaru metryk sukcesu.
- Zarządzanie ryzykiem AI: Brak specyficznych mechanizmów oceny lub moderacji treści generowanych przez AI.
- Backup danych: Brak zaimplementowanego systemu backupu danych użytkowników (akceptacja ryzyka utraty danych dla MVP).
- API: Brak publicznego ani prywatnego API.
- Powiadomienia: Brak systemu powiadomień czy przypomnień.
- Zaawansowane uwierzytelnianie: Brak integracji z zewnętrznymi dostawcami tożsamości (np. Google, Facebook, Azure AD).

## 5. Historyjki użytkowników

### Uwierzytelnianie i Zarządzanie Kontem

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji VibeTravels, podając niezbędne dane (np. email, hasło), abym mógł zacząć zapisywać swoje notatki o podróżach.
- Kryteria akceptacji:
    - Formularz rejestracji jest dostępny.
    - Użytkownik może wprowadzić wymagane dane (np. email, hasło).
    - System waliduje poprawność danych (np. format email, siła hasła - do ustalenia).
    - Po pomyślnej rejestracji użytkownik jest informowany o sukcesie i może się zalogować.
    - Dane użytkownika są bezpiecznie przechowywane.

- ID: US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do aplikacji VibeTravels przy użyciu moich danych uwierzytelniających (np. email, hasło), abym mógł uzyskać dostęp do moich notatek.
- Kryteria akceptacji:
    - Formularz logowania jest dostępny.
    - Użytkownik może wprowadzić swoje dane uwierzytelniające.
    - System weryfikuje poprawność danych.
    - Po pomyślnym zalogowaniu użytkownik jest przekierowywany do głównego panelu aplikacji.
    - W przypadku błędnych danych użytkownik otrzymuje stosowny komunikat.
    - Sesja użytkownika jest zarządzana (np. przez tokeny, ciasteczka).

- ID: US-003
- Tytuł: Wylogowanie z aplikacji
- Opis: Jako zalogowany użytkownik, chcę móc wylogować się z aplikacji, aby zakończyć moją sesję i zabezpieczyć dostęp do konta.
- Kryteria akceptacji:
    - Przycisk lub opcja wylogowania jest dostępna dla zalogowanego użytkownika.
    - Po kliknięciu wylogowania sesja użytkownika jest kończona.
    - Użytkownik jest przekierowywany do strony logowania lub strony głównej dla niezalogowanych.

### Zarządzanie Notatkami

- ID: US-004
- Tytuł: Tworzenie nowej notatki
- Opis: Jako zalogowany użytkownik, chcę móc dodać nową, tekstową notatkę opisującą mój pomysł na podróż, abym mógł go zapisać na później.
- Kryteria akceptacji:
    - Dostępny jest interfejs (np. pole tekstowe i przycisk "Dodaj") do tworzenia nowej notatki.
    - Użytkownik może wprowadzić dowolny tekst.
    - Po zatwierdzeniu notatka jest zapisywana i powiązana z kontem użytkownika.
    - Nowa notatka pojawia się na liście notatek użytkownika.

- ID: US-005
- Tytuł: Przeglądanie listy notatek
- Opis: Jako zalogowany użytkownik, chcę widzieć listę wszystkich moich zapisanych notatek na głównym ekranie aplikacji, abym mógł łatwo przejrzeć moje pomysły.
- Kryteria akceptacji:
    - Po zalogowaniu użytkownik widzi panel główny.
    - Na panelu głównym wyświetlana jest lista wszystkich notatek należących do użytkownika.
    - Notatki są wyświetlane w czytelny sposób (np. każda jako osobny element listy).
    - Lista jest aktualizowana po dodaniu lub usunięciu notatki.

- ID: US-006
- Tytuł: Usuwanie notatki
- Opis: Jako zalogowany użytkownik, chcę móc usunąć wybraną notatkę z mojej listy, jeśli uznam, że nie jest już potrzebna.
- Kryteria akceptacji:
    - Przy każdej notatce na liście znajduje się opcja jej usunięcia (np. przycisk "Usuń").
    - Po wybraniu opcji usunięcia, notatka jest trwale usuwana z systemu.
    - Notatka znika z listy wyświetlanej użytkownikowi.
    - (Opcjonalnie) System prosi o potwierdzenie przed usunięciem.

- ID: US-009
- Tytuł: Edycja istniejącej notatki
- Opis: Jako zalogowany użytkownik, chcę móc edytować treść moich wcześniej utworzonych notatek, abym mógł poprawić błędy lub zaktualizować informacje.
- Kryteria akceptacji:
    - Przy każdej notatce stworzonej przez użytkownika (nie AI) na liście znajduje się opcja jej edycji (np. przycisk "Edytuj").
    - Po wybraniu opcji edycji, użytkownik może zmodyfikować istniejącą treść notatki w polu tekstowym.
    - Po zatwierdzeniu zmian, zaktualizowana treść notatki jest zapisywana.
    - Zaktualizowana notatka jest wyświetlana na liście z nową treścią.

### Generowanie Propozycji AI

- ID: US-007
- Tytuł: Inicjowanie generowania propozycji przez AI
- Opis: Jako zalogowany użytkownik, chcę móc kliknąć przycisk "Generuj Propozycje", aby system AI przeanalizował moje istniejące notatki i zaproponował nowy pomysł na podróż.
- Kryteria akceptacji:
    - Przycisk "Generuj Propozycje" (lub o podobnym znaczeniu) jest widoczny i dostępny dla zalogowanego użytkownika.
    - Kliknięcie przycisku inicjuje proces komunikacji z zewnętrznym LLM.
    - System wysyła treść *wszystkich* aktualnych notatek użytkownika do AI.
    - Użytkownik może otrzymać informację zwrotną, że proces generowania trwa (np. wskaźnik ładowania).

- ID: US-008
- Tytuł: Przeglądanie wygenerowanej propozycji AI
- Opis: Jako zalogowany użytkownik, po zainicjowaniu generowania propozycji przez AI, chcę zobaczyć wynikową, nową notatkę dodaną do mojej listy, abym mógł zapoznać się z sugestią AI.
- Kryteria akceptacji:
    - Po zakończeniu przetwarzania przez AI, nowa notatka (wygenerowana propozycja) pojawia się na liście notatek użytkownika.
    - Notatka ta jest wyraźnie oznaczona lub stylistycznie odróżniona jako wygenerowana przez AI (do decyzji projektowej).
    - Treść notatki odpowiada opisowej propozycji podróży.
    - Notatka jest automatycznie zapisywana w systemie i powiązana z kontem użytkownika.

## 6. Metryki sukcesu

Początkowo zdefiniowane kryteria sukcesu dla pełnej wersji produktu to:
- 90% użytkowników posiada wypełnione preferencje turystyczne w swoim profilu.
- 75% użytkowników generuje 3 lub więcej planów wycieczek na rok.

Jednakże, ze względu na ograniczenia zakresu MVP (brak funkcjonalności profili użytkownika, brak mechanizmów monitoringu aktywności), powyższe metryki nie będą mierzone na tym etapie.

Kluczową miarą sukcesu MVP będzie:
- Dostarczenie w pełni działającej aplikacji obejmującej wszystkie wymagania funkcjonalne (FR-001 do FR-009) i historyjki użytkownika (US-001 do US-008) w założonym czasie (1 miesiąc).
- Zebranie wstępnych opinii od użytkowników (jeśli będą dostępni testerzy) dotyczących użyteczności podstawowych funkcji i jakości generowanych propozycji AI.
