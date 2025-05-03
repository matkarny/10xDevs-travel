import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { SupabaseClient } from "./supabase.client";

/**
 * Tworzy instancję klienta Supabase dla środowiska serwerowego (API, SSR)
 * z obsługą ciasteczek Astro
 */
export function createServerSupabaseClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  return createClient<Database>(supabaseUrl, supabaseAnonKey) as SupabaseClient;
}
