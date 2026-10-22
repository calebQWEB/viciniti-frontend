"use client";

import { BRAND } from "@/lib/brand";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, ShoppingBag, Store, Repeat, Check } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";
import LocationForm from "@/components/location/LocationForm";
import BankAccountSection from "@/components/shared/BankAccountSection";
import { User, UserIntent } from "@/types/user";

type Step = "area" | "intent" | "payout";

const INTENTS: {
  key: UserIntent;
  title: string;
  description: string;
  icon: typeof ShoppingBag;
}[] = [
  {
    key: "buy",
    title: "Buy & hire",
    description: "Find things and people for the job, nearby.",
    icon: ShoppingBag,
  },
  {
    key: "sell",
    title: "Sell & offer services",
    description: "List items or offer your skills to neighbours.",
    icon: Store,
  },
  {
    key: "both",
    title: "A bit of both",
    description: "Buy, sell, hire and offer — all of it.",
    icon: Repeat,
  },
];

// Where each intent lands after the welcome flow
const DESTINATIONS: Record<UserIntent, string> = {
  buy: "/browse/items",
  sell: "/dashboard/listings/create",
  both: "/dashboard",
};

export default function WelcomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setUser } = useAuthStore();
  const setBrowserLocation = useLocationStore((state) => state.setLocation);

  const [step, setStep] = useState<Step>("area");
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace("/login");
    else if (user?.onboarded_at) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, user?.onboarded_at, router]);

  const saveProfile = async (data: Partial<User>) => {
    const response = await api.put("/users/me", data);
    setUser(response.data);
  };

  const finish = async (chosen: UserIntent | null) => {
    setSaving(true);
    setError(null);
    try {
      await api.post("/users/me/complete-onboarding");
      // Not updating the auth store here: that would trip the "already onboarded" redirect above.
      // The next page refetches /users/me anyway.
      router.push(chosen ? DESTINATIONS[chosen] : "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await action();
    } catch {
      setError("We couldn't save that. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user || user.onboarded_at) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  const steps: Step[] = intent === "buy" ? ["area", "intent"] : ["area", "intent", "payout"];
  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
              <span className="text-white font-black text-sm">{BRAND.initial}</span>
            </div>
            <span className="text-lg font-bold font-heading text-gray-900 tracking-tight">
              {BRAND.name}
            </span>
          </div>
          <button
            onClick={() => finish(intent)}
            disabled={saving}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Skip setup
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6" aria-label={`Step ${steps.indexOf(step) + 1} of ${steps.length}`}>
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= steps.indexOf(step) ? "bg-primary-500" : "bg-earth-200"
              }`}
            />
          ))}
        </div>

        <div className="card p-6 sm:p-8 hover:shadow-sm">
          {step === "area" && (
            <>
              <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Welcome, {firstName}! Where are you?
              </h1>
              <p className="mt-1.5 mb-6 text-sm text-gray-500">
                {BRAND.name} is all about what&apos;s nearby. Your area decides what you see and
                helps neighbours find what you list.
              </p>

              {user.latitude != null && user.location && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl bg-primary-50 px-4 py-3 text-sm">
                  <Check className="w-4 h-4 text-primary-600 shrink-0" />
                  <span className="text-gray-600">Your area:</span>
                  <span className="font-bold text-gray-900 truncate">{user.location}</span>
                </div>
              )}

              <LocationForm
                onPick={(place, source) =>
                  run(async () => {
                    setBrowserLocation(place.latitude, place.longitude, place.name, source);
                    await saveProfile({
                      location: place.name,
                      latitude: place.latitude,
                      longitude: place.longitude,
                    });
                    setStep("intent");
                  })
                }
              />

              <button
                onClick={() => setStep("intent")}
                disabled={saving}
                className="mt-5 w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                {user.latitude != null ? "Continue" : "Skip this step"}
              </button>
            </>
          )}

          {step === "intent" && (
            <>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                What brings you to {BRAND.name}?
              </h1>
              <p className="mt-1.5 mb-6 text-sm text-gray-500">
                We&apos;ll point you to the right place. You can always do everything.
              </p>

              <div className="space-y-2.5">
                {INTENTS.map(({ key, title, description, icon: Icon }) => (
                  <button
                    key={key}
                    disabled={saving}
                    onClick={() =>
                      run(async () => {
                        await saveProfile({ intent: key });
                        setIntent(key);
                        if (key === "buy") await finish(key);
                        else setStep("payout");
                      })
                    }
                    className="w-full flex items-center gap-4 p-4 text-left rounded-2xl border border-earth-200 hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-60"
                  >
                    <div className="w-10 h-10 shrink-0 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep("area")}
                disabled={saving}
                className="mt-5 w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Back
              </button>
            </>
          )}

          {step === "payout" && (
            <>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Get paid when you sell
              </h1>
              <p className="mt-1.5 mb-6 text-sm text-gray-500">
                Add the bank account your earnings should go to. You can list without one,
                but payouts wait until it&apos;s added.
              </p>

              <BankAccountSection />

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => finish(intent)}
                  disabled={saving}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-60"
                >
                  {saving ? "Finishing..." : "Finish"}
                </button>
                <button
                  onClick={() => finish(intent)}
                  disabled={saving}
                  className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}

          {error && <p className="mt-4 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
