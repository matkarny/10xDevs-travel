import type { APIRoute } from "astro";
import { z } from "zod";
import { generateSuggestions } from "../../../lib/services/suggestion.service";

// Disable prerendering for this API route
export const prerender = false;

// Define the schema for validating the request body
const suggestionRequestSchema = z.object({
  note_ids: z.array(z.string().uuid("Each note ID must be a valid UUID")).min(1, "At least one note ID is required"),
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
 * POST handler for generating AI suggestions based on provided notes
 *
 * @param context - The Astro API context
 * @returns Response with generated suggestions or error
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
    } catch {
      return createResponse(
        {
          error: "Invalid JSON in request body",
        },
        400
      );
    }

    // Validate the request body against the schema
    const result = suggestionRequestSchema.safeParse(requestBody);
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

    try {
      // Call the service to generate suggestions
      const suggestions = await generateSuggestions(supabase, validatedData.note_ids);

      // Return the suggestions with 200 OK status
      return createResponse(suggestions, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("No valid notes found")) {
          return createResponse(
            {
              error: "No valid notes found with the provided IDs",
            },
            400
          );
        }
      }

      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch {
    // Return 500 Internal Server Error or 502 Bad Gateway for AI service errors
    return createResponse({ error: "AI service error" }, 502);
  }
};
