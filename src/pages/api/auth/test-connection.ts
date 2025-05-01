import type { APIRoute } from "astro";

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET handler for testing Supabase connection
 *
 * @param context - The Astro API context
 * @returns Response with connection status
 */
export const GET: APIRoute = async (context) => {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
      return new Response(
        JSON.stringify({
          error: "Supabase client not available in context",
          status: "error",
        }),
        { status: 500, headers }
      );
    }

    // Test connection by making a simple query
    const { data, error } = await supabase.from("notes").select("count").limit(1);

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status: "error",
        }),
        { status: 500, headers }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Connection to Supabase successful",
        data,
        status: "success",
      }),
      { status: 200, headers }
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      }),
      { status: 500, headers }
    );
  }
};
