import type { APIRoute } from "astro";
import { z } from "zod";
import { getNoteById } from "../../../lib/services/note.service";

// Cache duration in seconds
const CACHE_MAX_AGE = 60; // 1 minute cache

// Disable prerendering for this API route
export const prerender = false;

// Define the schema for validating the ID parameter
const idParamSchema = z.object({
  id: z.string().uuid("Invalid note ID format. Must be a valid UUID."),
});

/**
 * Creates a Response with standard headers including caching directives
 *
 * @param body - Response body
 * @param status - HTTP status code
 * @param cacheControl - Cache control directive
 * @returns Response object with appropriate headers
 */
const createResponse = (body: unknown, status: number, cacheControl?: string): Response => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": cacheControl || "no-store, must-revalidate",
  };

  return new Response(JSON.stringify(body), { status, headers });
};

/**
 * GET handler for retrieving a note by ID
 *
 * @param context - The Astro API context
 * @returns Response with note data or error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    // Get and validate the ID parameter from the URL
    const { id } = context.params;
    const result = idParamSchema.safeParse({ id });

    // Return 400 Bad Request if ID validation fails
    if (!result.success) {
      return createResponse(
        {
          error: "Invalid input",
          details: result.error.errors,
        },
        400
      );
    }

    // Get the validated ID
    const validatedId = result.data.id;

    // Call the service to fetch the note
    const note = await getNoteById(supabase, validatedId);

    // Return 404 Not Found if the note doesn't exist or doesn't belong to the user
    if (!note) {
      return createResponse({ error: "Note not found" }, 404);
    }

    // Return the note data with 200 OK status and caching headers
    // Notes can be cached for a short time to improve performance
    return createResponse(note, 200, `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE * 2}`);
  } catch {
    // Return 500 Internal Server Error
    // In a production environment, this should use a proper logging service
    return createResponse({ error: "Internal Server Error" }, 500);
  }
};
