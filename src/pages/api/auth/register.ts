import type { APIRoute } from "astro";
import { z } from "zod";
import { createOrUpdateProfile } from "../../../lib/services/profile.service";

// Disable prerendering for this API route
export const prerender = false;

// Define the schema for validating the request body
const registerRequestSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
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
 * POST handler for user registration
 *
 * @param context - The Astro API context
 * @returns Response with auth token on successful registration
 */
export const POST: APIRoute = async (context) => {
  try {
    // Get Supabase client from context (added by middleware)
    const supabase = context.locals.supabase;
    if (!supabase) {
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
    const result = registerRequestSchema.safeParse(requestBody);
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

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    // Handle registration errors
    if (error) {
      return createResponse(
        {
          error: "Registration failed",
          details: error.message,
          code: error.code,
          status: error.status,
        },
        400
      );
    }

    // Create a profile for the new user
    if (data.user) {
      await createOrUpdateProfile(supabase, data.user.id);
    }

    // Return the session data including access token, if available
    if (data.session) {
      return createResponse(
        {
          message: "Registration successful",
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
        },
        201
      );
    } else {
      // If email confirmation is required, no session will be returned
      return createResponse(
        {
          message: "Registration successful. Please check your email to confirm your account.",
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
        },
        201
      );
    }
  } catch (error) {
    // Return 500 Internal Server Error for unexpected errors
    return createResponse({ error: "Internal server error" }, 500);
  }
};
