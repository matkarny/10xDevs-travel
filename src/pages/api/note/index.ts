import type { APIRoute } from "astro";
import { z } from "zod";
import { createNote } from "../../../lib/services/note.service";

// Disable prerendering for this API route
export const prerender = false;

// Define the schema for validating the request body
const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required").max(5000, "Content cannot exceed 5000 characters"),
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
 * POST handler for creating a new note
 *
 * @param context - The Astro API context
 * @returns Response with created note data or error
 */
export const POST: APIRoute = async (context) => {
  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    // Get the authenticated user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    // Parse and validate the request body
    let requestBody;
    try {
      requestBody = await context.request.json();
    } catch (errorType) {
      return createResponse(
        {
          error: "Invalid JSON in request body",
        },
        400
      );
    }

    // Validate the request body against the schema
    const result = createNoteSchema.safeParse(requestBody);
    if (!result.success) {
      return createResponse(
        {
          error: "Invalid input",
          details: result.error.errors,
        },
        400
      );
    }

    // Get the validated data
    const validatedData = result.data;

    // Call the service to create the note
    const note = await createNote(supabase, user.id, validatedData);

    // Return the created note with 201 Created status
    return createResponse(note, 201);
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("cannot exceed 5000 characters")) {
        return createResponse(
          {
            error: "Content length exceeds maximum of 5000 characters",
          },
          400
        );
      }
    }

    // Return 500 Internal Server Error for all other errors
    return createResponse({ error: "Internal Server Error" }, 500);
  }
};
