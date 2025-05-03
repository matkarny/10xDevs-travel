import type { APIRoute } from "astro";
import { z } from "zod";
import type { SuggestionRequest, SuggestionResponse } from "../../types";

export const prerender = false;

// Schema dla walidacji danych wejściowych
const suggestionRequestSchema = z.object({
  note_ids: z.array(z.string().uuid()).min(1, "Wybierz co najmniej jedną notatkę")
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Pobierz klienta Supabase z kontekstu
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({ error: "Wymagane uwierzytelnienie" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sprawdź sesję użytkownika
    const { session } = await locals.supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Wymagane uwierzytelnienie" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parsuj i waliduj ciało żądania
    let requestBody: SuggestionRequest;
    try {
      requestBody = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowy format JSON w treści żądania" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Waliduj dane wejściowe
    const validationResult = suggestionRequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.format()
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { note_ids } = validationResult.data;

    // Pobierz zawartość wybranych notatek
    const { data: notes, error } = await supabase
      .from("notes")
      .select("content")
      .in("id", note_ids);

    if (error) {
      return new Response(
        JSON.stringify({ error: "Błąd podczas pobierania notatek" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!notes || notes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Nie znaleziono wybranych notatek" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Tymczasowa implementacja generowania sugestii na podstawie notatek
    // W przyszłości zostanie zastąpiona integracją z prawdziwym AI
    const noteContents = notes.map(note => note.content);
    
    // Przykładowe sugestie
    const suggestions = [
      `Na podstawie Twoich notatek, sugerujemy wycieczkę do Krakowa. Miasto oferuje wspaniałe zabytki i atrakcje kulturalne, które mogą Cię zainteresować.`,
      `Biorąc pod uwagę Twoje zainteresowania, warto rozważyć podróż do Gdańska. Miasto ma bogatą historię i morską atmosferę.`,
      `Twoje notatki sugerują, że możesz być zainteresowany podróżą do Wrocławia. Miasto słynie z licznych mostów i uroczego Rynku.`,
    ];

    // Zapisz wygenerowane sugestie jako notatki AI
    for (const suggestion of suggestions) {
      await supabase.from("notes").insert({
        user_id: session.user.id,
        content: suggestion,
        is_ai_generated: true
      });
    }

    const response: SuggestionResponse = {
      suggestions
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Błąd w API sugestii:", error);
    
    return new Response(
      JSON.stringify({
        error: "Nie udało się wygenerować sugestii",
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
