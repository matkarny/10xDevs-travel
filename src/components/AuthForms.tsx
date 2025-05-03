import { useState, useCallback } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export interface AuthFormsProps {
  mode: "login" | "register";
}

const AuthForms = ({ mode: initialMode }: AuthFormsProps) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Update URL query parameter when mode changes
  const handleModeChange = useCallback((newMode: "login" | "register") => {
    setMode(newMode);

    // Update URL without full page reload
    const url = new URL(window.location.href);
    if (newMode === "register") {
      url.searchParams.set("mode", "register");
    } else {
      url.searchParams.delete("mode");
    }
    window.history.pushState({}, "", url);
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback(() => {
    // Redirect to home page after successful auth
    window.location.href = "/";
  }, []);

  return (
    <div className="w-full">
      {mode === "login" ? (
        <LoginForm onLoginSuccess={handleAuthSuccess} onSwitchToRegister={() => handleModeChange("register")} />
      ) : (
        <RegisterForm onRegisterSuccess={handleAuthSuccess} onSwitchToLogin={() => handleModeChange("login")} />
      )}
    </div>
  );
};

export default AuthForms;
