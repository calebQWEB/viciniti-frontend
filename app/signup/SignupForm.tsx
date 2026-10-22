"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Lock, Mail, User } from "lucide-react";
import { apiErrorDetail, register, login } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import { Field, FormError, PasswordField, SubmitButton } from "@/components/auth/AuthFields";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const MIN_PASSWORD_LENGTH = 8;

export default function SignupPage() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordLongEnough = formData.password.length >= MIN_PASSWORD_LENGTH;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordLongEnough) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      await register(formData.name, formData.email, formData.password);

      // Automatically log them in
      await login(formData.email, formData.password);

      // Fetch user data
      const response = await api.get("/users/me");
      setUser(response.data);
      setIsAuthenticated(true);

      router.push("/welcome");
    } catch (err) {
      setError(apiErrorDetail(err) || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      mode="signup"
      title="Create your account"
      subtitle="It's free and takes less than a minute."
      headline="Everything you need is closer than you think."
      below={
        <p className="text-[11.5px] text-gray-400 leading-relaxed text-center">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-primary-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      }
    >
      <FormError message={error} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field
          id="signup-name"
          label="Full name"
          icon={User}
          name="name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="name"
          required
        />

        <Field
          id="signup-email"
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          inputMode="email"
          required
        />

        <PasswordField
          id="signup-password"
          label="Password"
          icon={Lock}
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          aria-describedby="signup-password-hint"
          required
          hint={
            <p
              id="signup-password-hint"
              className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium transition-colors ${
                passwordLongEnough ? "text-primary-600" : "text-gray-400"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              At least {MIN_PASSWORD_LENGTH} characters
            </p>
          }
        />

        <SubmitButton isLoading={isLoading} label="Create account" loadingLabel="Creating account..." />
      </form>

      <GoogleSignInButton />
    </AuthShell>
  );
}
