# API Endpoint Implementation Plan: GET /api/note/{id}

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionemu użytkownikowi pobranie szczegółów pojedynczej notatki na podstawie jej unikalnego identyfikatora (UUID). Zwraca pełne dane notatki, jeśli istnieje i należy do użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/note/{id}`
- **Parametry**: 
  - Wymagane:
    - `id` (Path Parameter): UUID notatki do pobrania.
  - Opcjonalne: Brak
- **Request Body**: Brak (żądanie GET nie ma ciała).

## 3. Wykorzystywane typy
- **Path Parameter Validation**: Zod schema `z.object({ id: z.string().uuid() })`
- **Response DTO**: `NoteDetailDto` (z `src/types.ts`)
  ```typescript
  export type NoteDetailDto = Pick<Note, 'id' | 'content' | 'is_ai_generated' | 'created_at' | 'updated_at'>;
  ```
- **Service Function Return Type**: `Promise<Note | null>` (gdzie `Note` to `Tables<'notes'>` z `src/db/database.types.ts`)

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK)**:
  ```json
  {
    "id": "uuid",
    "content": "string",
    "is_ai_generated": boolean,
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  }
  ```
  - Content-Type: `application/json`
- **Błędy**:
  - `400 Bad Request`: Jeśli parametr `id` w ścieżce nie jest poprawnym UUID.
    ```json
    { "error": "Invalid input", "details": [/* Zod error details */] }
    ```
  - `401 Unauthorized`: Jeśli użytkownik nie jest uwierzytelniony (brak ważnego tokenu JWT).
    ```json
    { "error": "Unauthorized" }
    ```
  - `404 Not Found`: Jeśli notatka o podanym `id` nie istnieje lub nie należy do uwierzytelnionego użytkownika.
    ```json
    { "error": "Note not found" }
    ```
  - `500 Internal Server Error`: W przypadku nieoczekiwanych błędów serwera lub bazy danych.
    ```json
    { "error": "Internal Server Error" }
    ```

## 5. Przepływ danych
1.  Żądanie GET trafia do endpointu Astro API `/src/pages/api/note/[id].ts`.
2.  Middleware Astro weryfikuje token JWT i dołącza uwierzytelnionego klienta Supabase do `context.locals.supabase`.
3.  Handler API pobiera parametr `id` ze ścieżki (`context.params.id`).
4.  Waliduje `id` przy użyciu schematu Zod. W przypadku błędu zwraca `400`.
5.  Handler API wywołuje funkcję serwisową `NoteService.getNoteById(supabase, id)` przekazując klienta Supabase i zwalidowany `id`.
6.  Funkcja serwisowa wykonuje zapytanie do Supabase:
    ```javascript
    const { data, error } = await supabase
      .from('notes')
      .select('id, content, is_ai_generated, created_at, updated_at')
      .eq('id', noteId)
      .single();
    ```
7.  Polityka RLS Supabase automatycznie filtruje wyniki, aby zapewnić, że `user_id` pasuje do `auth.uid()`.
8.  Funkcja serwisowa sprawdza wynik zapytania:
    - Jeśli `error` istnieje (inny niż błąd braku wiersza), zgłasza błąd (który zostanie złapany przez handler i zwrócony jako `500`).
    - Jeśli `data` jest `null` (notatka nie znaleziona lub RLS odfiltrował), zwraca `null`.
    - Jeśli `data` istnieje, zwraca obiekt notatki.
9.  Handler API otrzymuje wynik z serwisu:
    - Jeśli `null`, zwraca odpowiedź `404 Not Found`.
    - Jeśli obiekt notatki, zwraca odpowiedź `200 OK` z danymi notatki w formacie `NoteDetailDto`.
    - Jeśli serwis zgłosił błąd, handler łapie go i zwraca `500 Internal Server Error`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Obsługiwane przez middleware Astro i Supabase Auth (JWT w nagłówku `Authorization`). Endpoint jest dostępny tylko dla uwierzytelnionych użytkowników.
- **Autoryzacja**: Egzekwowana przez politykę RLS Supabase `Enable read access for own notes`. Użytkownicy mogą pobierać tylko notatki, których są właścicielami (`user_id` == `auth.uid()`).
- **Walidacja danych wejściowych**: Parametr `id` jest walidowany jako UUID przy użyciu Zod, aby zapobiec nieprawidłowym zapytaniom do bazy danych.

## 7. Obsługa błędów
- **Błędy walidacji (Zod)**: Zwróć `400 Bad Request` z komunikatem błędu i szczegółami Zod.
- **Brak uwierzytelnienia**: Middleware/Supabase zwróci `401 Unauthorized`.
- **Zasób nie znaleziony**: Jeśli `NoteService.getNoteById` zwróci `null`, zwróć `404 Not Found`.
- **Błędy Supabase/Bazy Danych**: Złap błędy zgłoszone przez klienta Supabase lub serwis, zaloguj je (np. `console.error`) i zwróć `500 Internal Server Error`.
- Używaj wczesnych powrotów (`early returns`) dla warunków błędów w handlerze API.

## 8. Wydajność
- Zapytanie do bazy danych jest proste (`SELECT ... WHERE id = ?`). Kolumna `id` jest kluczem głównym, więc wyszukiwanie jest bardzo szybkie.
- Indeks `idx_notes_user_id` nie jest bezpośrednio używany w tym zapytaniu, ale polityka RLS może z niego korzystać pośrednio.
- Głównym czynnikiem opóźnienia będzie czas odpowiedzi sieciowej do Supabase.
- Nie przewiduje się znaczących wąskich gardeł wydajności dla tego konkretnego endpointu.

## 9. Etapy wdrożenia
1.  **Utwórz plik serwisu**: Stwórz `src/lib/services/note.service.ts` (jeśli jeszcze nie istnieje).
2.  **Zaimplementuj funkcję serwisową**: Dodaj funkcję `async getNoteById(supabase: SupabaseClient, noteId: string): Promise<Note | null>` w `note.service.ts`. Zaimplementuj logikę zapytania do Supabase, używając `.select().eq('id', noteId).single()` i obsługując przypadki `data` i `error`.
3.  **Utwórz plik endpointu API**: Stwórz `src/pages/api/note/[id].ts`.
4.  **Zdefiniuj typ `GET`**: W pliku API dodaj `export const GET: APIRoute = async (context) => { ... }`.
5.  **Dodaj `prerender = false`**: `export const prerender = false;` w pliku API.
6.  **Pobierz klienta Supabase**: Uzyskaj `supabase` z `context.locals.supabase`.
7.  **Pobierz i zwaliduj `id`**: Pobierz `id` z `context.params.id`. Zdefiniuj schemat Zod dla `id` (`z.string().uuid()`) i użyj `.safeParse()` do walidacji. W przypadku błędu zwróć `new Response(JSON.stringify({ error: 'Invalid note ID format', details: result.error.errors }), { status: 400 })`.
8.  **Wywołaj serwis**: Wywołaj `NoteService.getNoteById(supabase, validatedId)` w bloku `try...catch`.
9.  **Obsłuż odpowiedź serwisu**: 
    - Jeśli wynik to `null`, zwróć `new Response(JSON.stringify({ error: 'Note not found' }), { status: 404 })`.
    - Jeśli zwrócono obiekt notatki, zwróć `new Response(JSON.stringify(note), { status: 200, headers: { 'Content-Type': 'application/json' } })` (Astro automatycznie konwertuje obiekty do JSON, więc można zwrócić bezpośrednio obiekt `note`).
10. **Obsłuż błędy serwisu**: W bloku `catch`, zaloguj błąd (`console.error(error)`) i zwróć `new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })`.
11. **Dodaj testy**: Napisz testy jednostkowe dla funkcji serwisowej i testy integracyjne dla endpointu API (opcjonalne, ale zalecane).
