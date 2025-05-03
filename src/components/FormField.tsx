import { forwardRef } from "react";

export interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  name?: string;
  defaultValue?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, type, error, required = false, placeholder = "", name, defaultValue = "" }, ref) => {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          id={id}
          name={name || id}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`mt-1 block w-full rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
