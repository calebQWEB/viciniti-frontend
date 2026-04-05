import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your Viciniti account to buy, sell and hire local services.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
