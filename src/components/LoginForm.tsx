import React, { useRef, useState, useCallback } from "react";
import FormField from "./FormField";
import AuthButton from "./AuthButton";
import AuthErrorDisplay from "./AuthErrorDisplay";
import { supabaseClient } from "../db/supabase.client";
import { toast } from "../components/ui/Toast";

export interface LoginFormProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    if (!email) {
      newErrors.email = "Email jest wymagany";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Podaj poprawny adres email";
    }

    if (!password) {
      newErrors.password = "Hasło jest wymagane";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setAuthError(null);

      if (!validateForm()) return;

      setIsSubmitting(true);

      try {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email: emailRef.current?.value || "",
          password: passwordRef.current?.value || "",
        });

        if (error) throw error;

        // Use simplified toast API
        toast.success("Pomyślnie zalogowano! Witamy ponownie w aplikacji!");

        onLoginSuccess();
      } catch (error: any) {
        let errorMessage = "Wystąpił problem podczas logowania";

        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Niepoprawny email lub hasło";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Adres email nie został potwierdzony";
        }

        setAuthError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onLoginSuccess]
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <AuthErrorDisplay error={authError} />

      <FormField
        ref={emailRef}
        id="email"
        name="email"
        label="Adres email"
        type="email"
        error={errors.email}
        required
        placeholder="twoj@email.com"
      />

      <FormField
        ref={passwordRef}
        id="password"
        name="password"
        label="Hasło"
        type="password"
        error={errors.password}
        required
        placeholder="Twoje hasło"
      />

      <div className="mt-6">
        <AuthButton text="Zaloguj się" isLoading={isSubmitting} type="submit" />
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        Nie masz jeszcze konta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
        >
          Zarejestruj się
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
