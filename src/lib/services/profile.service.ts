import type { SupabaseClient } from "../../db/supabase.client";
import type { Profile } from "../../types";

/**
 * Get the profile of the authenticated user
 *
 * @param supabase - The authenticated Supabase client
 * @param userId - The ID of the authenticated user
 * @returns The user profile or null if not found
 */
export async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  // Early return for invalid input
  if (!userId) {
    return null;
  }

  // Query the database for the user profile
  const { data, error } = await supabase
    .from("profiles")
    .select("id, created_at, updated_at")
    .eq("id", userId)
    .single();

  // Handle database errors
  if (error && error.code !== "PGRST116") {
    throw new Error(`Database error while fetching profile: ${error.message}`);
  }

  // Return the profile data or null if not found
  return data as Profile | null;
}

/**
 * Create or update a user profile
 * This function is typically called when a new user signs up
 *
 * @param supabase - The authenticated Supabase client
 * @param userId - The ID of the user (can be null/empty for new users)
 * @returns The created or updated profile
 */
export async function createOrUpdateProfile(supabase: SupabaseClient, userId?: string): Promise<Profile> {
  // Generate a new user ID if not provided (for new users)
  const profileId = userId || crypto.randomUUID();

  // Check if profile already exists (only if userId was provided)
  if (userId) {
    const existingProfile = await getUserProfile(supabase, userId);

    // If profile exists, return it
    if (existingProfile) {
      return existingProfile;
    }
  }

  // Create a new profile with the provided or generated ID
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: profileId })
    .select("id, created_at, updated_at")
    .single();

  // Handle database errors
  if (error) {
    throw new Error(`Database error while creating profile: ${error.message}`);
  }

  // Return the created profile
  return data as Profile;
}
