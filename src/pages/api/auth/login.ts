import type { APIRoute } from "astro";

// Disable prerendering for this API route
export const prerender = false;

/**
 * POST handler for user login
 *
 * @param context - The Astro API context
 * @returns Response with auth token on successful login
 */
export const POST: APIRoute = async (context) => {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Supabase client not available" }), { status: 500, headers });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await context.request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), { status: 400, headers });
    }

    // Basic validation
    if (!requestBody.email || !requestBody.password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400, headers });
    }

    try {
      // Direct authentication attempt
      const { data, error } = await supabase.auth.signInWithPassword({
        email: requestBody.email,
        password: requestBody.password,
      });

      // Handle authentication errors
      if (error) {
        return new Response(
          JSON.stringify({
            error: "Authentication failed",
            details: error.message,
            code: error.code,
          }),
          { status: 401, headers }
        );
      }

      // Success response
      return new Response(
        JSON.stringify({
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at,
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
        }),
        { status: 200, headers }
      );
    } catch (authError) {
      return new Response(
        JSON.stringify({
          error: "Authentication process failed",
          details: authError instanceof Error ? authError.message : String(authError),
        }),
        { status: 500, headers }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers }
    );
  }
};
