import type { APIRoute } from "astro";
import { getUserProfile } from "../../../lib/services/profile.service";

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
 * GET handler for retrieving the authenticated user's profile
 *
 * @param context - The Astro API context
 * @returns Response with profile data or error
 */
export const GET: APIRoute = async (context) => {
  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    // Get the authenticated user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return createResponse({ error: "Unauthorized" }, 401);
    }

    // Call the service to fetch the user's profile
    const profile = await getUserProfile(supabase, user.id);

    // Return 404 Not Found if the profile doesn't exist
    if (!profile) {
      return createResponse({ error: "Profile not found" }, 404);
    }

    // Return the profile with 200 OK status
    return createResponse(profile, 200);
  } catch {
    // Return 500 Internal Server Error
    return createResponse({ error: "Internal Server Error" }, 500);
  }
};
