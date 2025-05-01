import type { APIRoute } from "astro";
import { z } from "zod";
import { updateNote } from "../../../lib/services/note.service";

// Disable prerendering for this API route
export const prerender = false;

// Define the schema for validating the ID parameter
const idParamSchema = z.object({
  id: z.string().uuid("Invalid note ID format. Must be a valid UUID."),
});

// Define the schema for validating the request body
const updateNoteSchema = z.object({
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
 * PUT handler for updating an existing note
 *
 * @param context - The Astro API context
 * @returns Response with updated note data or error
 */
export const PUT: APIRoute = async (context) => {
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

    // Parse and validate the request body
    let requestBody;
    try {
      requestBody = await context.request.json();
    } catch {
      return createResponse(
        {
          error: "Invalid JSON in request body",
        },
        400
      );
    }

    // Validate the request body against the schema
    const bodyResult = updateNoteSchema.safeParse(requestBody);
    if (!bodyResult.success) {
      return createResponse(
        {
          error: "Invalid input",
          details: bodyResult.error.errors,
        },
        400
      );
    }

    // Get the validated data
    const validatedData = bodyResult.data;

    // Call the service to update the note
    try {
      const note = await updateNote(supabase, validatedId, validatedData);

      // Return 404 Not Found if the note doesn't exist or doesn't belong to the user
      if (!note) {
        return createResponse({ error: "Note not found" }, 404);
      }

      // Return the updated note with 200 OK status
      return createResponse(note, 200);
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

        if (error.message.includes("AI-generated notes cannot be updated")) {
          return createResponse(
            {
              error: "AI-generated notes cannot be updated",
            },
            403
          );
        }
      }

      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch {
    // Return 500 Internal Server Error
    return createResponse({ error: "Internal Server Error" }, 500);
  }
};
