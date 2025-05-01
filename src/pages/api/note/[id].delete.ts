import type { APIRoute } from "astro";
import { z } from "zod";
import { deleteNote } from "../../../lib/services/note.service";

// Disable prerendering for this API route
export const prerender = false;

// Define the schema for validating the ID parameter
const idParamSchema = z.object({
  id: z.string().uuid("Invalid note ID format. Must be a valid UUID."),
});

/**
 * Creates a Response with standard headers
 *
 * @param body - Response body
 * @param status - HTTP status code
 * @returns Response object with appropriate headers
 */
const createResponse = (body: unknown, status: number): Response => {
  const headers = {
    "Content-Type": "application/json",
  };

  return new Response(JSON.stringify(body), { status, headers });
};

/**
 * DELETE handler for removing a note
 *
 * @param context - The Astro API context
 * @returns Response with success or error
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    // Get and validate the ID parameter from the URL
    const { id } = context.params;
    const idResult = idParamSchema.safeParse({ id });

    // Return 400 Bad Request if ID validation fails
    if (!idResult.success) {
      return createResponse(
        {
          error: "Invalid input",
          details: idResult.error.errors,
        },
        400
      );
    }

    // Get the validated ID
    const validatedId = idResult.data.id;

    // Call the service to delete the note
    const deleted = await deleteNote(supabase, validatedId);

    // Return 404 Not Found if the note doesn't exist or doesn't belong to the user
    if (!deleted) {
      return createResponse({ error: "Note not found" }, 404);
    }

    // Return 204 No Content for successful deletion (no response body)
    return new Response(null, { status: 204 });
  } catch {
    // Return 500 Internal Server Error
    return createResponse({ error: "Internal Server Error" }, 500);
  }
};
