"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { apiErrorDetail, login, postLoginPath } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import { Field, FormError, PasswordField, SubmitButton } from "@/components/auth/AuthFields";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Sent here because the account was suspended mid-session; signing in again shows the reason
  const notice =
    useSearchParams().get("notice") === "suspended"
      ? "This account has been suspended. Sign in to see why, or contact support if you think it's a mistake."
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      const response = await api.get("/users/me");
      setUser(response.data);
      setIsAuthenticated(true);
      router.push(postLoginPath(response.data));
    } catch (err) {
      setError(apiErrorDetail(err) || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      title="Welcome back"
      subtitle="Sign in to see what's happening near you."
      headline="Your neighbourhood's been busy."
    >
      <FormError message={error || notice} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field
          id="login-email"
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          required
        />

        <PasswordField
          id="login-password"
          label="Password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          hint={
            <div className="mt-1.5 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-primary-600 hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
          }
        />

        <SubmitButton isLoading={isLoading} label="Sign in" loadingLabel="Signing in..." />
      </form>

      <GoogleSignInButton />
    </AuthShell>
  );
}
