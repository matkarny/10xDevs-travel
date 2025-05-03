import type { APIRoute } from "astro";
import { createNoteService } from "../../lib/services/noteService";
import { z } from "zod";

export const prerender = false;

// Schema for query parameters validation
const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional().default("created_at.desc"),
  type: z.enum(["user", "ai"]).optional(),
});

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Get supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user session
    const { session } = await locals.supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Validate query parameters
    const validationResult = queryParamsSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid query parameters", 
          details: validationResult.error.format() 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create note service
    const noteService = createNoteService(supabase);
    
    // Fetch notes with pagination
    const result = await noteService.getNotes(validationResult.data);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notes API:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch notes", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
