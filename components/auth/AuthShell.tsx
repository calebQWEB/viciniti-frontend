import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import NeighbourhoodPanel from "./NeighbourhoodPanel";

type AuthMode = "login" | "signup";

interface AuthShellProps {
  mode: AuthMode;
  title: string;
  subtitle: string;
  // Marketing line shown on the neighbourhood panel
  headline: string;
  children: React.ReactNode;
  // Small print under the card, e.g. the sign-up terms
  below?: React.ReactNode;
}

const MODES: { key: AuthMode; label: string; href: string }[] = [
  { key: "login", label: "Sign in", href: "/login" },
  { key: "signup", label: "Create account", href: "/signup" },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center space-x-2 group" aria-label={`${BRAND.name} home`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform ${
          light ? "bg-white shadow-primary-900/30" : "bg-primary-600 shadow-primary-500/20"
        }`}
      >
        <span className={`font-black text-sm ${light ? "text-primary-700" : "text-white"}`}>{BRAND.initial}</span>
      </div>
      <span
        className={`text-lg font-bold tracking-tight ${light ? "text-white" : "text-gray-900"}`}
      >
        {BRAND.name}
      </span>
    </Link>
  );
}

// Login and sign-up are separate pages; this switch links between them
function ModeSwitch({ mode }: { mode: AuthMode }) {
  return (
    <nav aria-label="Sign in or create an account" className="grid grid-cols-2 p-1 bg-earth-100 rounded-2xl">
      {MODES.map((m) => {
        const active = m.key === mode;
        return (
          <Link
            key={m.key}
            href={m.href}
            aria-current={active ? "page" : undefined}
            className={`py-2 rounded-xl text-center text-[12.5px] font-semibold transition-all ${
              active
                ? "bg-white text-gray-900 shadow-sm shadow-gray-900/10"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Split-screen layout for login and sign-up: neighbourhood panel on the left, form card on the right
export default function AuthShell({ mode, title, subtitle, headline, children, below }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Desktop panel */}
      <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        <NeighbourhoodPanel headline={headline} />
      </aside>

      {/* Mobile header band */}
      <div className="lg:hidden bg-primary-700 px-5 pt-6 pb-10 text-white">
        <Logo light />
        <p className="mt-6 text-2xl font-extrabold leading-tight tracking-tight">{headline}</p>
      </div>

      <main className="flex min-h-screen flex-col px-4 sm:px-10 lg:px-16 xl:px-24 -mt-4 lg:mt-0 rounded-t-3xl lg:rounded-none bg-linear-to-b from-primary-50 via-earth-50 to-earth-50">
        <div className="hidden lg:flex pt-8">
          <Logo />
        </div>

        <div className="flex flex-1 items-center py-8 lg:py-10">
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_1px_0_rgba(0,0,0,0.03),0_18px_40px_-24px_rgba(29,77,56,0.35)] space-y-5">
              <ModeSwitch mode={mode} />

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
                  {title}
                </h1>
                <p className="mt-1 text-[13px] text-gray-500">{subtitle}</p>
              </div>

              <div>{children}</div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-primary-50 text-[11.5px] text-primary-700">
                <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                Payments are held safely until both sides confirm the deal.
              </div>
            </div>

            {below && <div className="mt-4 px-2">{below}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
