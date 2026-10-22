import { BRAND } from "@/lib/brand";
import { PLATFORM } from "@/lib/platform";
import StreetPattern from "@/components/location/StreetPattern";

// The escrow flow, in the order it actually happens
const STEPS = [
  {
    title: `You pay through ${BRAND.name}`,
    description: "Your money is held safely. The seller can see it's paid.",
  },
  {
    title: "Meet up or get the job done",
    description: "The seller hands over the item or finishes the service and marks it done.",
  },
  {
    title: "You confirm, they get paid",
    description: "Not as described? Open a dispute before you confirm and we'll step in.",
  },
];

export default function TrustSection() {
  return (
    <section className="pb-10 md:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-primary-800 text-white">
          {/* Same street grid as the map, very faint */}
          <StreetPattern className="opacity-50" />

          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
            <div>
              <h2 className="text-xl md:text-[1.7rem] font-extrabold leading-tight tracking-tight text-balance">
                Buy from neighbours without the worry.
              </h2>
              <p className="mt-3 max-w-md text-sm text-primary-200">
                When you pay on {BRAND.name}, the seller doesn&apos;t get the money until you confirm
                you got what you paid for.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Payments by Flutterwave",
                  "Disputes reviewed by our team",
                  `Payouts ${PLATFORM.payoutDays} days after confirmation`,
                ].map((point) => (
                  <span key={point} className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-primary-100">
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <ol className="space-y-1">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative grid grid-cols-[40px_1fr] gap-4 py-2.5">
                  {i < STEPS.length - 1 && (
                    <span className="absolute left-[19px] top-[52px] bottom-[-10px] w-0.5 bg-white/15" aria-hidden="true" />
                  )}
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold tabular-nums ${
                      i === 0 ? "bg-accent-500 text-primary-900" : "bg-white/10 text-accent-400"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">{step.title}</h3>
                    <p className="mt-0.5 text-[13px] text-primary-200">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
