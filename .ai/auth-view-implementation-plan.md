# Plan implementacji widoku Auth

## 1. Przegląd
Widok Auth umożliwia użytkownikom logowanie się do aplikacji lub rejestrację nowego konta. Bazuje na endpointach Supabase dostępnych przez API i oferuje przełączanie między formularzami logowania i rejestracji. Po pomyślnej autoryzacji, użytkownik zostanie przekierowany do strony głównej aplikacji.

## 2. Routing widoku
- Ścieżka: `/auth`
- Parametry URL: `?mode=register` (opcjonalny, domyślnie wyświetlany jest formularz logowania)

## 3. Struktura komponentów
```
AuthView (Astro Page)
├── AuthContainer (Astro Component)
│   ├── AuthHeader (Astro Component)
│   └── AuthForms (React Component)
│       ├── LoginForm (React Component)
│       │   ├── FormField (Email)
│       │   ├── FormField (Password)
│       │   ├── AuthButton
│       │   └── AuthErrorDisplay
│       └── RegisterForm (React Component)
│           ├── FormField (Email)
│           ├── FormField (Password)
│           ├── FormField (Confirm Password)
│           ├── AuthButton
│           └── AuthErrorDisplay
└── ToastContainer (React Component)
```

## 4. Szczegóły komponentów

### AuthView (Astro Page)
- Opis komponentu: Główny plik strony zawierający cały widok uwierzytelniania
- Główne elementy: Layout, AuthContainer, ToastContainer
- Obsługiwane interakcje: Parametr URL decyduje o wyświetlanym formularzu
- Typy: Nie wymaga dedykowanych typów
- Propsy: Nie dotyczy (komponent strony)

### AuthContainer (Astro Component)
- Opis komponentu: Container wyśrodkowujący zawartość formularzy
- Główne elementy: Karta zawierająca formularze, logo, nagłówek
- Obsługiwane interakcje: Brak (komponent statyczny)
- Typy: Nie wymaga dedykowanych typów
- Propsy: `mode: 'login' | 'register'`

### AuthHeader (Astro Component)
- Opis komponentu: Nagłówek z logo i tytułem formularza
- Główne elementy: Logo, tytuł
- Obsługiwane interakcje: Brak (komponent statyczny)
- Typy: Nie wymaga dedykowanych typów
- Propsy: `title: string`

### AuthForms (React Component)
- Opis komponentu: Komponent zarządzający stanem formularzy i wyświetlaniem odpowiedniego formularza
- Główne elementy: LoginForm lub RegisterForm zależnie od mode
- Obsługiwane interakcje: Przełączanie między formularzami
- Obsługiwana walidacja: Delegowana do komponentów formularzy
- Typy: `AuthFormsProps`
- Propsy: `mode: 'login' | 'register'`, `onModeChange: (mode: 'login' | 'register') => void`

### LoginForm (React Component)
- Opis komponentu: Formularz logowania z walidacją i obsługą błędów
- Główne elementy: Pola email i hasło, przycisk logowania, link do rejestracji
- Obsługiwane interakcje: Wprowadzanie danych, submit formularza, przełączanie na rejestrację
- Obsługiwana walidacja:
  - Email: wymagany, poprawny format email
  - Hasło: wymagane
  - Błędy API: niepoprawne dane logowania, brak użytkownika
- Typy: `LoginFormData`, `LoginFormProps`
- Propsy: `onLoginSuccess: () => void`, `onSwitchToRegister: () => void`

### RegisterForm (React Component)
- Opis komponentu: Formularz rejestracji z walidacją i obsługą błędów
- Główne elementy: Pola email, hasło, potwierdzenie hasła, przycisk rejestracji, link do logowania
- Obsługiwane interakcje: Wprowadzanie danych, submit formularza, przełączanie na logowanie
- Obsługiwana walidacja:
  - Email: wymagany, poprawny format, unikalny (sprawdzany przez API)
  - Hasło: wymagane, min. 8 znaków, zawiera cyfrę i znak specjalny
  - Potwierdzenie hasła: wymagane, identyczne z hasłem
  - Błędy API: email zajęty, błędy serwera
- Typy: `RegisterFormData`, `RegisterFormProps`
- Propsy: `onRegisterSuccess: () => void`, `onSwitchToLogin: () => void`

### FormField (React Component)
- Opis komponentu: Uniwersalny komponent pola formularza z etykietą i obsługą błędów
- Główne elementy: Label, Input, ErrorMessage
- Obsługiwane interakcje: Wprowadzanie danych, fokus, blur
- Obsługiwana walidacja: Wyświetlanie błędów z formularza nadrzędnego
- Typy: `FormFieldProps`
- Propsy: `id: string`, `label: string`, `type: string`, `value: string`, `error?: string`, `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void`, `required?: boolean`

### AuthButton (React Component)
- Opis komponentu: Przycisk akcji formularza ze stanem ładowania
- Główne elementy: Button, LoadingIndicator
- Obsługiwane interakcje: Kliknięcie
- Typy: `AuthButtonProps`
- Propsy: `text: string`, `isLoading: boolean`, `onClick?: () => void`, `type?: 'button' | 'submit' | 'reset'`

### AuthErrorDisplay (React Component)
- Opis komponentu: Wyświetlanie błędów autentykacji
- Główne elementy: ErrorMessage, Icon
- Obsługiwane interakcje: Brak
- Typy: `AuthErrorDisplayProps`
- Propsy: `error: string | null`

### ToastContainer (React Component)
- Opis komponentu: Kontener dla powiadomień typu toast
- Główne elementy: Dynamicznie generowane Toast
- Obsługiwane interakcje: Zamykanie toastów
- Typy: `ToastProps`
- Propsy: Brak (zarządzany przez system toastów)

## 5. Typy

### Typy żądań i odpowiedzi
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
  };
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

interface LogoutResponse {
  message: string;
}
```

### Typy formularzy
```typescript
interface AuthFormsProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}

interface AuthButtonProps {
  text: string;
  isLoading: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

interface AuthErrorDisplayProps {
  error: string | null;
}
```

### Typy stanu
```typescript
interface AuthFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}
```

## 6. Zarządzanie stanem

### Hook useAuthForm
Customowy hook do zarządzania stanem formularzy:

```typescript
function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Funkcje zarządzające stanem formularza, walidacją i submitowaniem
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {...};
  const validate = (): boolean => {...};
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {...};
  
  return { formData, errors, isLoading, apiError, handleChange, handleSubmit };
}

// Analogicznie dla useRegisterForm
```

### Hook useToast
Hook do zarządzania systemem powiadomień:

```typescript
function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  const addToast = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {...};
  const removeToast = (id: string) => {...};
  
  return { toasts, addToast, removeToast };
}
```

## 7. Integracja API

### Funkcje API
```typescript
async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Błąd logowania');
  }
  
  return response.json();
}

async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Błąd rejestracji');
  }
  
  return response.json();
}

async function logoutUser(): Promise<LogoutResponse> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Błąd wylogowania');
  }
  
  return response.json();
}
```

## 8. Interakcje użytkownika

### Formularz logowania
1. Użytkownik wprowadza email i hasło
2. Walidacja w czasie rzeczywistym (na focus out) sprawdza poprawność pól
3. Po kliknięciu przycisku "Zaloguj"
   - Walidacja formularza
   - Wysłanie żądania do API
   - Obsługa stanu ładowania
   - W przypadku sukcesu: toast sukcesu i przekierowanie na stronę główną
   - W przypadku błędu: wyświetlenie komunikatu błędu
4. Link "Zarejestruj się" przełącza na formularz rejestracji

### Formularz rejestracji
1. Użytkownik wprowadza email, hasło i potwierdzenie hasła
2. Walidacja w czasie rzeczywistym sprawdza poprawność pól
3. Po kliknięciu przycisku "Zarejestruj"
   - Walidacja formularza
   - Wysłanie żądania do API
   - Obsługa stanu ładowania
   - W przypadku sukcesu: toast sukcesu i przekierowanie na stronę główną
   - W przypadku błędu: wyświetlenie komunikatu błędu
4. Link "Masz już konto? Zaloguj się" przełącza na formularz logowania

## 9. Warunki i walidacja

### Formularz logowania
- Email:
  - Wymagany: "Email jest wymagany"
  - Format: "Wprowadź poprawny adres email"
- Hasło:
  - Wymagane: "Hasło jest wymagane"

### Formularz rejestracji
- Email:
  - Wymagany: "Email jest wymagany"
  - Format: "Wprowadź poprawny adres email"
- Hasło:
  - Wymagane: "Hasło jest wymagane"
  - Minimalna długość: "Hasło musi zawierać co najmniej 8 znaków"
  - Złożoność: "Hasło musi zawierać co najmniej jedną cyfrę i jeden znak specjalny"
- Potwierdzenie hasła:
  - Wymagane: "Potwierdzenie hasła jest wymagane"
  - Zgodność: "Hasła muszą być identyczne"

## 10. Obsługa błędów

### Błędy walidacji
- Błędy walidacji są wyświetlane bezpośrednio pod odpowiednimi polami formularza
- Komunikaty są jasne i precyzyjne

### Błędy API
- Błędy API są wyświetlane na górze formularza w komponencie AuthErrorDisplay
- W przypadku wielu możliwych błędów, mapowane są do przyjaznych dla użytkownika komunikatów:
  - 401 (Unauthorized): "Niepoprawny email lub hasło"
  - 400 (Bad Request): Zależnie od treści błędu
    - Email already exists: "Podany adres email jest już zarejestrowany"
    - Invalid email format: "Niepoprawny format adresu email"
    - Password too weak: "Hasło nie spełnia wymagań bezpieczeństwa"
  - 500 (Internal Server Error): "Wystąpił błąd serwera. Spróbuj ponownie później."
  - Błędy sieciowe: "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."

### Toasty
- Błędy krytyczne są wyświetlane jako toasty na dole ekranu
- Komunikaty sukcesu są wyświetlane jako toasty na dole ekranu

## 11. Kroki implementacji

1. Utworzenie struktury plików:
   - `src/pages/auth.astro` - Strona główna widoku
   - `src/components/auth/AuthContainer.astro` - Kontener dla formularzy
   - `src/components/auth/AuthHeader.astro` - Nagłówek formularzy
   - `src/components/auth/AuthForms.tsx` - Komponent React zarządzający formularzami
   - `src/components/auth/LoginForm.tsx` - Formularz logowania
   - `src/components/auth/RegisterForm.tsx` - Formularz rejestracji
   - `src/components/auth/FormField.tsx` - Komponent pola formularza
   - `src/components/auth/AuthButton.tsx` - Przycisk akcji
   - `src/components/auth/AuthErrorDisplay.tsx` - Wyświetlanie błędów
   - `src/components/common/Toast.tsx` - Komponent toast
   - `src/components/common/ToastContainer.tsx` - Kontener dla toastów

2. Implementacja komponentów Astro:
   - Implementacja `auth.astro` z obsługą parametrów URL
   - Implementacja `AuthContainer.astro` z układem karty formularza
   - Implementacja `AuthHeader.astro` z logo i tytułem

3. Implementacja komponentów formularzy:
   - Implementacja komponentów bazowych: `FormField`, `AuthButton`, `AuthErrorDisplay`
   - Implementacja `LoginForm` z walidacją i integracją API
   - Implementacja `RegisterForm` z walidacją i integracją API

4. Implementacja zarządzania stanem:
   - Implementacja hooka `useAuthForm` dla każdego formularza
   - Implementacja `AuthForms` zarządzającego przełączaniem formularzy

5. Implementacja systemu toastów:
   - Implementacja komponentów `Toast` i `ToastContainer`
   - Implementacja hooka `useToast`

6. Integracja z API:
   - Implementacja funkcji API dla logowania, rejestracji i wylogowania
   - Integracja obsługi błędów API

7. Testy:
   - Testy jednostkowe dla walidacji formularzy
   - Testy funkcjonalne dla przepływu logowania i rejestracji
   - Testowanie obsługi błędów i przypadków brzegowych

8. Dopracowanie UI:
   - Dopracowanie responsywności widoku na różnych urządzeniach
   - Dodanie animacji dla poprawy UX (np. przejścia między formularzami)
   - Ulepszenie dostępności (ARIA atrybuty, obsługa klawiatury)
