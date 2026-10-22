import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PLATFORM } from "@/lib/platform";
import { formatPrice } from "@/lib/utils";

export default function SellBand() {
  return (
    <section className="pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 rounded-[24px] border border-earth-200 bg-white p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-gray-900">
              Got something to sell, or a skill to offer?
            </h2>
            <p className="mt-1.5 max-w-xl text-[13px] text-gray-500">
              List it in a minute. People a short ride away see it first, and you get paid
              straight to your bank account.
            </p>
            <p className="mt-3 text-[13px] text-gray-700">
              <span className="text-lg font-extrabold text-primary-600 tabular-nums">{PLATFORM.feePercent}%</span>{" "}
              only when it sells, capped at {formatPrice(PLATFORM.feeCap)}. Listing is free.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/dashboard/listings/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-primary-600 transition-colors"
            >
              Sell an item
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard/services/create"
              className="inline-flex items-center rounded-xl bg-earth-100 px-4 py-2.5 text-[13px] font-bold text-gray-800 hover:bg-earth-200 transition-colors"
            >
              Offer a service
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
