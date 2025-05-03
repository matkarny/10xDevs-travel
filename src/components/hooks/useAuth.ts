import { useState, useEffect, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseClient } from "../../db/supabase.client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

// Definicje typów odpowiedzi z API, zachowujemy je dla dokumentacji
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ApiAuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  user?: {
    id: string;
    email: string;
  };
  message?: string;
  error?: string;
  details?: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  // Korzystamy nadal z onAuthStateChange do synchronizacji stanu
  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        }));
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          session: null,
          isLoading: false,
          error: null,
        });
      }
    });

    // Pobieramy aktualną sesję przy inicjalizacji
    const fetchCurrentSession = async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Brak aktywnego tokenu lub błąd - stan niezalogowany
          setState({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        const data = await response.json();

        // Jeśli mamy dane sesji, aktualizujemy stan
        if (data.access_token) {
          // Dla uproszczenia, korzystamy z supabaseClient tylko do pobrania sesji
          // po otrzymaniu tokenu z API
          const { data: sessionData } = await supabaseClient.auth.getSession();

          setState({
            user: sessionData.session?.user ?? null,
            session: sessionData.session,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          session: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    };

    fetchCurrentSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Błąd logowania");
      }

      // Sesja zostanie zaktualizowana automatycznie przez event listener
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Błąd rejestracji");
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd wylogowania");
      }

      // Sesja zostanie wyczyszczona automatycznie przez event listener
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch("/api/auth/token", {
        method: "POST", // Odświeżanie tokenu przez POST
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd odświeżania sesji");
      }

      // Sesja zostanie zaktualizowana automatycznie przez event listener
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, []);

  return {
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: !!state.session,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}
