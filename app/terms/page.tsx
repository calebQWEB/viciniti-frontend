import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { BRAND } from "@/lib/brand";
import { PLATFORM } from "@/lib/platform";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The rules for buying, selling and hiring on ${BRAND.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="22 October 2026"
      draft
      intro={
        <p>
          These terms are an agreement between you and {BRAND.legalName}, which runs {BRAND.name}.
          By creating an account or using {BRAND.name}, you agree to them.
        </p>
      }
      sections={[
        {
          heading: "What we do",
          body: (
            <p>
              {BRAND.name} is a marketplace that connects people who want to buy, sell, hire or offer
              services near them. We hold payments and release them when a deal is complete. We
              don&apos;t own the items or provide the services listed; the people who list them do.
            </p>
          ),
        },
        {
          heading: "Your account",
          body: (
            <ul>
              <li>You must be at least 18 years old and give accurate details about yourself.</li>
              <li>Keep your password private. You are responsible for activity on your account.</li>
              <li>One person, one account. We may suspend accounts used for fraud or abuse.</li>
            </ul>
          ),
        },
        {
          heading: "Listing items and services",
          body: (
            <>
              <p>Listing is free. When you list something, you confirm that:</p>
              <ul>
                <li>you own the item or are allowed to sell it, or are able to provide the service;</li>
                <li>the description, photos, price and location are accurate;</li>
                <li>it is legal to sell in Nigeria. Weapons, drugs, stolen goods and counterfeit items are not allowed.</li>
              </ul>
              <p>We may remove listings that break these rules.</p>
            </>
          ),
        },
        {
          heading: "Payments and payouts",
          body: (
            <>
              <p>
                Payments are processed by Flutterwave. When a buyer pays, {BRAND.name} holds the
                money until the deal is complete:
              </p>
              <ul>
                <li>The seller hands over the item or completes the service, then marks the order complete.</li>
                <li>The buyer confirms, or the order confirms itself {PLATFORM.autoConfirmDays} days after being marked complete if the buyer takes no action.</li>
                <li>The seller is paid to their saved bank account {PLATFORM.payoutDays} days after confirmation, as long as no dispute is open.</li>
              </ul>
              <p>
                Sellers can list without a bank account, but payouts wait until one is added.
                Orders that aren&apos;t paid within {PLATFORM.unpaidOrderMinutes} minutes are cancelled,
                and booking requests a provider doesn&apos;t answer within {PLATFORM.bookingRequestHours} hours
                expire.
              </p>
            </>
          ),
        },
        {
          heading: "Fees",
          body: (
            <p>
              Buyers pay the listed price. Sellers pay a fee of <strong>{PLATFORM.feePercent}%</strong> of
              the sale, capped at <strong>{formatPrice(PLATFORM.feeCap)}</strong> per order, taken from the
              payout. There is no fee to list. We will tell you before any fee changes.
            </p>
          ),
        },
        {
          heading: "Disputes and chargebacks",
          body: (
            <>
              <p>
                If something isn&apos;t as described or wasn&apos;t delivered, the buyer should open a
                dispute before confirming. Both sides can submit evidence, such as photos and
                messages, and our team reviews it and decides how the held payment is released or
                refunded.
              </p>
              <p>
                If a buyer&apos;s bank reverses a payment (a chargeback) and the seller loses the case,
                a chargeback fee of <strong>{formatPrice(PLATFORM.chargebackFee)}</strong> is deducted from
                the seller&apos;s account.
              </p>
            </>
          ),
        },
        {
          heading: "Your responsibilities",
          body: (
            <ul>
              <li>Pay through {BRAND.name} only. Deals paid outside the app aren&apos;t protected.</li>
              <li>Treat other people with respect. No harassment, scams or misleading listings.</li>
              <li>Follow our <Link href="/safety" className="font-semibold text-primary-600 hover:underline">safety tips</Link> when meeting in person.</li>
            </ul>
          ),
        },
        {
          heading: "Limits of our responsibility",
          body: (
            <p>
              Deals are between buyers and sellers. We work to keep {BRAND.name} safe and handle
              disputes fairly, but we can&apos;t guarantee the quality, safety or legality of what is
              listed, or that every user is who they say they are. To the extent the law allows, we
              aren&apos;t liable for losses arising from deals between users beyond the payment we hold.
            </p>
          ),
        },
        {
          heading: "Changes, law and contact",
          body: (
            <p>
              We may update these terms and will tell you about important changes. These terms are
              governed by the laws of the Federal Republic of Nigeria. Questions? Email{" "}
              <strong>{BRAND.contactEmail}</strong>.
            </p>
          ),
        },
      ]}
    />
  );
}
