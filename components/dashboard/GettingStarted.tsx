"use client";

import { BRAND } from "@/lib/brand";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, X } from "lucide-react";
import api from "@/lib/api";

interface GettingStartedData {
  has_location: boolean;
  has_avatar: boolean;
  has_payout_account: boolean;
  has_listing_or_service: boolean;
}

const STEPS: {
  key: keyof GettingStartedData;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    key: "has_location",
    title: "Set your area",
    description: "So neighbours can find what you list.",
    href: "/dashboard/profile",
  },
  {
    key: "has_avatar",
    title: "Add a profile photo",
    description: "People trust a face.",
    href: "/dashboard/profile",
  },
  {
    key: "has_payout_account",
    title: "Add a payout account",
    description: "So you get paid when you sell.",
    href: "/dashboard/profile?tab=payout",
  },
  {
    key: "has_listing_or_service",
    title: "Post your first listing or service",
    description: "Sell something or offer a skill.",
    href: "/dashboard/listings/create",
  },
];

const HIDDEN_KEY = "junction-getting-started-hidden";

// First-run checklist; disappears once every step is done or the user hides it
export default function GettingStarted() {
  // The dashboard only renders client-side after auth loads, so localStorage is available here
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDDEN_KEY) === "1";
    } catch {
      return false;
    }
  });

  const { data } = useQuery({
    queryKey: ["dashboard-getting-started"],
    queryFn: async () => {
      const response = await api.get("/dashboard/getting-started");
      return response.data as GettingStartedData;
    },
  });

  if (hidden || !data) return null;

  const doneCount = STEPS.filter((step) => data[step.key]).length;
  if (doneCount === STEPS.length) return null;

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      // Hiding still works for this visit
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm shadow-gray-200/30">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-gray-900">
            Getting started
          </h2>
          <p className="text-xs text-gray-500">
            {doneCount} of {STEPS.length} done — a few steps to get the most out of {BRAND.name}.
          </p>
        </div>
        <button
          onClick={hide}
          aria-label="Hide getting started"
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-4 mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
        />
      </div>

      <ul className="mt-2 divide-y divide-gray-100">
        {STEPS.map((step) => {
          const done = data[step.key];
          return (
            <li key={step.key}>
              {done ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </span>
                  <p className="text-[13px] font-medium text-gray-400 line-through">
                    {step.title}
                  </p>
                </div>
              ) : (
                <Link
                  href={step.href}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors"
                >
                  <span className="h-6 w-6 shrink-0 rounded-full border-2 border-gray-200" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
