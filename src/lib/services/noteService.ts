import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  NoteDetailDto, 
  CreateNoteDto, 
  UpdateNoteDto, 
  PaginationParams,
  NoteListResponse,
  SuggestionRequest,
  SuggestionResponse
} from '../../types';

export class NoteService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Fetch notes with pagination
   */
  async getNotes(params: PaginationParams = {}): Promise<NoteListResponse> {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'created_at.desc',
      type = 'user' 
    } = params;

    const offset = (page - 1) * limit;
    const [sortField, sortOrder] = sort.split('.');

    // Build query
    let query = this.supabase
      .from('notes')
      .select('id, content, is_ai_generated, created_at, updated_at', { count: 'exact' });

    // Filter by note type if specified
    if (type === 'user') {
      query = query.eq('is_ai_generated', false);
    } else if (type === 'ai') {
      query = query.eq('is_ai_generated', true);
    }

    // Apply pagination and sorting
    query = query
      .order(sortField, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching notes: ${error.message}`);
    }

    return {
      data: data as NoteDetailDto[],
      pagination: {
        page,
        limit,
        total: count || 0
      }
    };
  }

  /**
   * Get a single note by ID
   */
  async getNote(id: string): Promise<NoteDetailDto> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('id, content, is_ai_generated, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching note: ${error.message}`);
    }

    return data as NoteDetailDto;
  }

  /**
   * Create a new note
   */
  async createNote(noteData: CreateNoteDto): Promise<NoteDetailDto> {
    const { data, error } = await this.supabase
      .from('notes')
      .insert([{ 
        content: noteData.content,
        is_ai_generated: false
      }])
      .select('id, content, is_ai_generated, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Error creating note: ${error.message}`);
    }

    return data as NoteDetailDto;
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, noteData: UpdateNoteDto): Promise<NoteDetailDto> {
    const { data, error } = await this.supabase
      .from('notes')
      .update({ content: noteData.content })
      .eq('id', id)
      .select('id, content, is_ai_generated, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Error updating note: ${error.message}`);
    }

    return data as NoteDetailDto;
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting note: ${error.message}`);
    }
  }

  /**
   * Generate AI suggestions based on selected notes
   */
  async generateSuggestions(request: SuggestionRequest): Promise<SuggestionResponse> {
    const response = await fetch('/api/suggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error generating suggestions');
    }

    return await response.json() as SuggestionResponse;
  }
}

/**
 * Create a note service instance
 */
export const createNoteService = (supabase: SupabaseClient): NoteService => {
  return new NoteService(supabase);
};
