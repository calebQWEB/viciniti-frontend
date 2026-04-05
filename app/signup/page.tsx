import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free Viciniti account and start buying, selling and hiring local services in your community.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <SignupForm />;
}
