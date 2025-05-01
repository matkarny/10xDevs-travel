import type { APIRoute } from "astro";

// Disable prerendering for this API route
export const prerender = false;

/**
 * GET handler for retrieving the current user's authentication token
 * UWAGA: Ten endpoint powinien być używany tylko w środowisku deweloperskim
 *
 * @param context - The Astro API context
 * @returns Response with the current auth token
 */
export const GET: APIRoute = async (context) => {
  // Get Supabase client from context (added by middleware)
  const supabase = context.locals.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get the current session
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return new Response(JSON.stringify({ error: "No active session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Return the access token
  return new Response(
    JSON.stringify({
      access_token: sessionData.session.access_token,
      expires_at: sessionData.session.expires_at,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
