"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  type LucideIcon,
} from "lucide-react";

interface FieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "placeholder"
> {
  id: string;
  label: string;
  icon: LucideIcon;
  // Shown under the field, e.g. a password rule or a "Forgot password?" link
  hint?: React.ReactNode;
}

// Filled field with a leading icon and floating label (styles: .float-field in globals.css)
export function Field({
  id,
  label,
  icon: Icon,
  hint,
  ...inputProps
}: FieldProps) {
  return (
    <div>
      <div className="float-field">
        <input id={id} placeholder=" " {...inputProps} />
        <label htmlFor={id}>{label}</label>
        <Icon className="float-icon" aria-hidden="true" />
      </div>
      {hint}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  icon: Icon,
  hint,
  ...inputProps
}: FieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="float-field">
        <input
          id={id}
          placeholder=" "
          {...inputProps}
          type={visible ? "text" : "password"}
        />
        <label htmlFor={id}>{label}</label>
        <Icon className="float-icon" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
        >
          {visible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {hint}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div role="alert" aria-live="assertive">
      {message && (
        <div className="mb-4 flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-[13px]">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export function SubmitButton({
  isLoading,
  label,
  loadingLabel,
}: {
  isLoading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="group w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-2xl text-[13px] font-bold shadow-md shadow-primary-500/25 transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}
