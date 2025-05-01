import type { SupabaseClient } from "../../db/supabase.client";
import type { Note, CreateNoteDto, UpdateNoteDto, PaginationParams, NoteListResponse } from "../../types";

/**
 * Get a note by its ID
 *
 * @param supabase - The authenticated Supabase client
 * @param noteId - The UUID of the note to retrieve
 * @returns The note if found and owned by the authenticated user, null otherwise
 */
export async function getNoteById(supabase: SupabaseClient, noteId: string): Promise<Note | null> {
  // Early return for invalid input
  if (!noteId) {
    return null;
  }

  // Query the database for the note with the specified ID
  // RLS policy will automatically filter to ensure user can only access their own notes
  const { data, error } = await supabase
    .from("notes")
    .select("id, content, is_ai_generated, created_at, updated_at")
    .eq("id", noteId)
    .single();

  // Handle database errors (other than not found)
  if (error && error.code !== "PGRST116") {
    // Log the error for debugging but don't expose details to the client
    // In a production environment, this should use a proper logging service
    throw new Error(`Database error while fetching note: ${error.message}`);
  }

  // Return the note data or null if not found
  return data as Note | null;
}

/**
 * Create a new note for the authenticated user
 *
 * @param supabase - The authenticated Supabase client
 * @param userId - The ID of the authenticated user
 * @param noteData - The data for the new note
 * @returns The created note
 */
export async function createNote(supabase: SupabaseClient, userId: string, noteData: CreateNoteDto): Promise<Note> {
  // Early return for invalid input
  if (!userId || !noteData.content) {
    throw new Error("User ID and note content are required");
  }

  // Validate content length
  if (noteData.content.length > 5000) {
    throw new Error("Note content cannot exceed 5000 characters");
  }

  // Create the note in the database
  // Note: is_ai_generated is always false for user-created notes
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      content: noteData.content.trim(),
      is_ai_generated: false,
    })
    .select("id, content, is_ai_generated, created_at, updated_at")
    .single();

  // Handle database errors
  if (error) {
    throw new Error(`Database error while creating note: ${error.message}`);
  }

  // Return the created note
  return data as Note;
}

/**
 * Update an existing note
 *
 * @param supabase - The authenticated Supabase client
 * @param noteId - The ID of the note to update
 * @param noteData - The updated note data
 * @returns The updated note or null if note doesn't exist or isn't owned by the user
 */
export async function updateNote(
  supabase: SupabaseClient,
  noteId: string,
  noteData: UpdateNoteDto
): Promise<Note | null> {
  // Early return for invalid input
  if (!noteId || !noteData.content) {
    throw new Error("Note ID and content are required");
  }

  // Validate content length
  if (noteData.content.length > 5000) {
    throw new Error("Note content cannot exceed 5000 characters");
  }

  // First check if the note exists and is not AI-generated
  const existingNote = await getNoteById(supabase, noteId);

  // If note doesn't exist or doesn't belong to the user (handled by RLS)
  if (!existingNote) {
    return null;
  }

  // Check if the note is AI-generated (cannot be updated)
  if (existingNote.is_ai_generated) {
    throw new Error("AI-generated notes cannot be updated");
  }

  // Update the note in the database
  const { data, error } = await supabase
    .from("notes")
    .update({
      content: noteData.content.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select("id, content, is_ai_generated, created_at, updated_at")
    .single();

  // Handle database errors
  if (error) {
    throw new Error(`Database error while updating note: ${error.message}`);
  }

  // Return the updated note
  return data as Note;
}

/**
 * Delete a note by its ID
 *
 * @param supabase - The authenticated Supabase client
 * @param noteId - The ID of the note to delete
 * @returns true if the note was deleted, false if it doesn't exist or isn't owned by the user
 */
export async function deleteNote(supabase: SupabaseClient, noteId: string): Promise<boolean> {
  // Early return for invalid input
  if (!noteId) {
    return false;
  }

  // First check if the note exists and belongs to the user
  const existingNote = await getNoteById(supabase, noteId);

  // If note doesn't exist or doesn't belong to the user (handled by RLS)
  if (!existingNote) {
    return false;
  }

  // Delete the note from the database
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  // Handle database errors
  if (error) {
    throw new Error(`Database error while deleting note: ${error.message}`);
  }

  // Return success
  return true;
}

/**
 * List notes with pagination and filtering
 *
 * @param supabase - The authenticated Supabase client
 * @param params - Pagination and filtering parameters
 * @returns List of notes with pagination info
 */
export async function listNotes(supabase: SupabaseClient, params: PaginationParams): Promise<NoteListResponse> {
  // Set default values for pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;

  // Parse sort parameter (default: created_at.desc)
  const sortParam = params.sort || "created_at.desc";
  const [column, order] = sortParam.split(".");
  const sortOrder = order === "asc" ? true : false; // true for ascending, false for descending

  // Build query
  let query = supabase
    .from("notes")
    .select("id, content, is_ai_generated, created_at, updated_at", { count: "exact" })
    .order(column, { ascending: sortOrder })
    .range(offset, offset + limit - 1);

  // Apply type filter if specified
  if (params.type === "user") {
    query = query.eq("is_ai_generated", false);
  } else if (params.type === "ai") {
    query = query.eq("is_ai_generated", true);
  }

  // Execute query
  const { data, error, count } = await query;

  // Handle database errors
  if (error) {
    throw new Error(`Database error while listing notes: ${error.message}`);
  }

  // Return formatted response
  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
    },
  };
}

/**
 * List AI-generated notes with pagination
 *
 * @param supabase - The authenticated Supabase client
 * @param params - Pagination parameters
 * @returns List of AI-generated notes with pagination info
 */
export async function listAiNotes(supabase: SupabaseClient, params: PaginationParams): Promise<NoteListResponse> {
  // Force the type parameter to be "ai"
  return listNotes(supabase, { ...params, type: "ai" });
}
