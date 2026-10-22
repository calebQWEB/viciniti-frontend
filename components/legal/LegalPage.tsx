import MainLayout from "@/components/layout/MainLayout";
import { FileWarning } from "lucide-react";

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro: React.ReactNode;
  sections: LegalSection[];
  // Shows the "pending legal review" note
  draft?: boolean;
}

// Shared layout for Terms, Privacy and Safety: readable width, section headings, normal site chrome
export default function LegalPage({ title, lastUpdated, intro, sections, draft = false }: LegalPageProps) {
  return (
    <MainLayout>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
        <header className="border-b border-earth-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Last updated {lastUpdated}
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
          <div className="mt-3 text-sm leading-7 text-gray-600">{intro}</div>

          {draft && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-[13px] text-amber-900">
              <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p>
                <strong>Draft, pending legal review.</strong> This page explains how the platform works
                today and will be finalised before launch.
              </p>
            </div>
          )}
        </header>

        <div className="divide-y divide-earth-100">
          {sections.map((section, i) => (
            <section key={section.heading} aria-labelledby={`section-${i}`} className="py-6">
              <h2 id={`section-${i}`} className="text-base md:text-lg font-bold text-gray-900">
                {section.heading}
              </h2>
              <div className="mt-2 space-y-3 text-sm leading-7 text-gray-600 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-gray-800">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </article>
    </MainLayout>
  );
}
