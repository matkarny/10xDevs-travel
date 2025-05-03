import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";

interface NoteFormProps {
  id?: string;
  initialContent?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormErrors {
  content?: string;
  form?: string;
}

const NoteForm: React.FC<NoteFormProps> = ({ id, initialContent = "", onSubmit, onCancel, isSubmitting = false }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    // Set initial content in the textarea when it changes
    if (textareaRef.current) {
      textareaRef.current.value = initialContent;
    }
  }, [initialContent]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const content = textareaRef.current?.value || "";

    // Validate content field
    if (!content.trim()) {
      errors.content = "Treść notatki jest wymagana";
    } else if (content.length > 5000) {
      errors.content = "Treść notatki nie może przekraczać 5000 znaków";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = () => {
    // Clear errors for the content field when value changes
    if (errors.content) {
      setErrors((prev) => ({
        ...prev,
        content: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const content = textareaRef.current?.value || "";

    try {
      await onSubmit(content);
    } catch {
      // Ignore the specific error but set a generic error message
      setErrors((prev) => ({
        ...prev,
        form: "Nie udało się zapisać notatki. Spróbuj ponownie.",
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400">{errors.form}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Treść notatki
        </label>
        <textarea
          id="content"
          name="content"
          ref={textareaRef}
          onChange={handleChange}
          className={`w-full rounded-md border p-2 ${errors.content ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-700"}`}
          placeholder="Wpisz treść swojej notatki..."
          rows={6}
          maxLength={5000}
          required
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Zapisuję...
            </span>
          ) : id ? (
            "Zapisz zmiany"
          ) : (
            "Zapisz notatkę"
          )}
        </Button>
      </div>
    </form>
  );
};

export default NoteForm;
