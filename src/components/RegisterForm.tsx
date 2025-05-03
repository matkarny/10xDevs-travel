import React, { useRef, useState, useCallback } from "react";
import FormField from "./FormField";
import AuthButton from "./AuthButton";
import AuthErrorDisplay from "./AuthErrorDisplay";
import { toast } from "../components/ui/Toast";

export interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";

    if (!email) {
      newErrors.email = "Email jest wymagany";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Podaj poprawny adres email";
    }

    if (!password) {
      newErrors.password = "Hasło jest wymagane";
    } else if (password.length < 8) {
      newErrors.password = "Hasło musi mieć co najmniej 8 znaków";
    } else if (!/\d/.test(password)) {
      newErrors.password = "Hasło musi zawierać co najmniej 1 cyfrę";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = "Hasło musi zawierać co najmniej 1 znak specjalny";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Potwierdzenie hasła jest wymagane";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Hasła muszą być identyczne";
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
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailRef.current?.value,
            password: passwordRef.current?.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || "Błąd rejestracji");
        }

        // Use simplified toast API
        toast.success("Konto zostało utworzone! Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację.");

        onSwitchToLogin();
      } catch (error: unknown) {
        let errorMessage = "Wystąpił problem podczas rejestracji";

        // Konwersja nieznanego error na obiekt z message
        const errorWithMessage =
          error instanceof Error ? error : new Error(typeof error === "string" ? error : "Nieznany błąd");

        if (
          errorWithMessage.message.includes("already registered") ||
          errorWithMessage.message.includes("already in use")
        ) {
          errorMessage = "Użytkownik o podanym adresie email już istnieje";
        } else if (errorWithMessage.message.toLowerCase().includes("password")) {
          errorMessage = "Hasło nie spełnia wymagań bezpieczeństwa";
        }

        setAuthError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSwitchToLogin]
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
        placeholder="Min. 8 znaków, cyfra i znak specjalny"
      />

      <FormField
        ref={confirmPasswordRef}
        id="confirmPassword"
        name="confirmPassword"
        label="Potwierdź hasło"
        type="password"
        error={errors.confirmPassword}
        required
        placeholder="Powtórz hasło"
      />

      <div className="mt-6">
        <AuthButton text="Zarejestruj się" isLoading={isSubmitting} type="submit" />
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        Masz już konto?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
        >
          Zaloguj się
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
