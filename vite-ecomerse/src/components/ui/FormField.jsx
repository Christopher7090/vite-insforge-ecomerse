import { useState } from "react";
// Campo de formulario reutilizable: label + input + mensaje de error.
// Lo van a usar Login, Registro, Recuperar/Restablecer password, Checkout, Perfil, formularios de Admin, etc.
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  showToggle = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
      <input
        id={name}
        name={name}
        type={showToggle && showPassword ? "text" : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`field-input ${error ? "field-input-error" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />        
 {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
          >
            {!showPassword ? <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg> : <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 3 18 18" />
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a14.5 14.5 0 0 1-3 3.8" />
    <path d="M6.6 6.6C3.6 8.5 2 12 2 12s3.6 7 10 7c1 0 2-.2 2.9-.5" />
  </svg>}
          </button>
        )
      }
      </div>
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
