import type { APIRoute } from "astro";

// Disable prerendering for this API route
export const prerender = false;

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
 * POST handler for user logout
 *
 * @param context - The Astro API context
 * @returns Response confirming logout
 */
export const POST: APIRoute = async (context) => {
  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    // Handle sign out errors
    if (error) {
      return createResponse(
        {
          error: "Logout failed",
          details: error.message,
        },
        500
      );
    }

    // Return success response
    return createResponse(
      {
        message: "Logged out successfully",
      },
      200
    );
  } catch (error) {
    // Return 500 Internal Server Error for unexpected errors
    return createResponse({ error: "Internal server error" }, 500);
  }
};
