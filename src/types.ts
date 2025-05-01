import type { Tables } from "./db/database.types";

// Note types
export type Note = Tables<"notes">;
export type NoteDetailDto = Pick<Note, "id" | "content" | "is_ai_generated" | "created_at" | "updated_at">;

// DTO types for API requests
export interface CreateNoteDto {
  content: string;
}

export interface UpdateNoteDto {
  content: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  type?: "user" | "ai";
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
}

export interface NoteListResponse {
  data: NoteDetailDto[];
  pagination: PaginationResult;
}

// Profile types
export type Profile = Tables<"profiles">;
export type ProfileDto = Pick<Profile, "id" | "created_at" | "updated_at">;

// AI Suggestion types
export interface SuggestionRequest {
  note_ids: string[];
}

export interface SuggestionResponse {
  suggestions: string[];
}

export interface AiNoteRequest {
  content: string;
}
