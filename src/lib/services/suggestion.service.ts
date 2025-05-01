import type { SupabaseClient } from "../../db/supabase.client";
import type { Note, SuggestionResponse } from "../../types";
import { getNoteById } from "./note.service";

/**
 * Generate AI suggestions based on provided note IDs
 *
 * @param supabase - The authenticated Supabase client
 * @param noteIds - Array of note IDs to base suggestions on
 * @returns Object containing array of suggestions
 */
export async function generateSuggestions(supabase: SupabaseClient, noteIds: string[]): Promise<SuggestionResponse> {
  // Early return for invalid input
  if (!noteIds || noteIds.length === 0) {
    throw new Error("At least one note ID is required");
  }

  // Fetch all the notes
  const notePromises = noteIds.map((id) => getNoteById(supabase, id));
  const notes = await Promise.all(notePromises);

  // Filter out null values (notes that don't exist or don't belong to the user)
  const validNotes = notes.filter((note): note is Note => note !== null);

  // If no valid notes were found
  if (validNotes.length === 0) {
    throw new Error("No valid notes found with the provided IDs");
  }

  // In a real application, this would analyze note content and call an AI service
  // For now, we'll generate simple travel destination suggestions
  const suggestions = generateMockSuggestions();

  return { suggestions };
}

/**
 * Mock function to generate travel destination suggestions
 * In a real application, this would be replaced with a call to an AI service
 *
 * @returns Array of generated travel destination suggestions (max 5)
 */
function generateMockSuggestions(): string[] {
  // Potential travel destinations to suggest
  const travelDestinations = [
    "Barcelona, Spain - Known for stunning architecture and Mediterranean beaches",
    "Kyoto, Japan - Experience traditional Japanese culture and beautiful temples",
    "Santorini, Greece - Enjoy breathtaking views of white buildings and blue domes",
    "Bali, Indonesia - Relax on tropical beaches and explore lush rice terraces",
    "New York City, USA - Visit iconic landmarks and enjoy world-class dining",
    "Cape Town, South Africa - Experience diverse culture and stunning landscapes",
    "Marrakech, Morocco - Explore colorful markets and traditional riads",
    "Sydney, Australia - Enjoy beautiful harbors and iconic architecture",
    "Rio de Janeiro, Brazil - Experience vibrant culture and beautiful beaches",
    "Iceland - Witness stunning waterfalls, geysers, and northern lights",
    "Bangkok, Thailand - Explore temples and enjoy delicious street food",
    "Paris, France - Visit world-famous museums and enjoy French cuisine"
  ];

  // Shuffle the destinations array to get random suggestions each time
  const shuffledDestinations = [...travelDestinations].sort(() => Math.random() - 0.5);

  // Take the first 5 destinations (or fewer if the array is smaller)
  return shuffledDestinations.slice(0, 5);
}

/**
 * Save an AI-generated note
 *
 * @param supabase - The authenticated Supabase client
 * @param userId - The ID of the authenticated user
 * @param content - The content of the AI-generated note
 * @returns The created AI note
 */
export async function saveAiNote(supabase: SupabaseClient, userId: string, content: string): Promise<Note> {
  // Early return for invalid input
  if (!userId || !content) {
    throw new Error("User ID and note content are required");
  }

  // Validate content length
  if (content.length > 5000) {
    throw new Error("Note content cannot exceed 5000 characters");
  }

  // Create the AI-generated note in the database
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      content: content.trim(),
      is_ai_generated: true,
    })
    .select("id, content, is_ai_generated, created_at, updated_at")
    .single();

  // Handle database errors
  if (error) {
    throw new Error(`Database error while creating AI note: ${error.message}`);
  }

  // Return the created note
  return data as Note;
}
