import type { APIRoute } from "astro";
import { z } from "zod";
import { listAiNotes } from "../../../lib/services/note.service";

// Disable prerendering for this API route
export const prerender = false;

// Define the schema for validating query parameters
const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z.string().optional().default("created_at.desc"),
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
 * GET handler for listing AI-generated notes with pagination
 *
 * @param context - The Astro API context
 * @returns Response with list of AI-generated notes and pagination info
 */
export const GET: APIRoute = async (context) => {
  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    // Parse and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = {
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      sort: url.searchParams.get("sort"),
    };

    // Parse query parameters using the schema
    const parsedParams = queryParamsSchema.safeParse({
      page: queryParams.page,
      limit: queryParams.limit,
      sort: queryParams.sort,
    });

    // Return 400 Bad Request if validation fails
    if (!parsedParams.success) {
      return createResponse({
        error: "Invalid query parameters",
        details: parsedParams.error.errors,
      }, 400);
    }

    // Get the validated parameters
    const validatedParams = parsedParams.data;

    // Call the service to list AI-generated notes
    const result = await listAiNotes(supabase, validatedParams);

    // Return the notes with 200 OK status
    return createResponse(result, 200);
  } catch (error) {
    // Return 500 Internal Server Error
    return createResponse({ error: "Internal Server Error" }, 500);
  }
};
