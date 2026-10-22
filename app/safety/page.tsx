import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { BRAND } from "@/lib/brand";
import { PLATFORM } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Safety tips",
  description: `How to buy, sell and hire safely on ${BRAND.name}.`,
};

export default function SafetyPage() {
  return (
    <LegalPage
      title={`Staying safe on ${BRAND.name}`}
      lastUpdated="22 October 2026"
      intro={
        <p>
          Most people you meet on {BRAND.name} are neighbours doing ordinary deals. A few simple
          habits keep it that way.
        </p>
      }
      sections={[
        {
          heading: `Always pay through ${BRAND.name}`,
          body: (
            <>
              <p>
                When you pay in the app, your money is held until you confirm you got what you paid
                for. If you pay by bank transfer or cash outside the app, we can&apos;t hold the money,
                step into a dispute, or get it back for you.
              </p>
              <p>
                If a seller asks you to pay outside {BRAND.name}, treat it as a warning sign and
                report them.
              </p>
            </>
          ),
        },
        {
          heading: "Check before you confirm",
          body: (
            <>
              <p>
                Look the item over, test it if you can, and make sure a service was done properly
                before you confirm. Confirming releases the payment to the seller.
              </p>
              <p>
                If something isn&apos;t right, open a dispute instead of confirming. If you do
                nothing, the order confirms itself {PLATFORM.autoConfirmDays} days after the seller
                marks it complete.
              </p>
            </>
          ),
        },
        {
          heading: "Meeting up for an item",
          body: (
            <ul>
              <li>Meet in a busy public place in daylight, such as a mall, bank or fuel station.</li>
              <li>Tell a friend or family member where you&apos;re going and who you&apos;re meeting.</li>
              <li>Bring someone with you for expensive items.</li>
              <li>Keep your conversation in {BRAND.name} messages so there&apos;s a record.</li>
            </ul>
          ),
        },
        {
          heading: "When a service provider visits",
          body: (
            <ul>
              <li>Check the provider&apos;s profile and reviews before booking.</li>
              <li>If you can, have someone else at home during the visit.</li>
              <li>Agree on the job and the price in messages before work starts.</li>
            </ul>
          ),
        },
        {
          heading: "Protect your accounts",
          body: (
            <ul>
              <li>Never share your bank PIN, card details or one-time codes (OTPs) with anyone.</li>
              <li>{BRAND.name} will never ask for your password or an OTP by message, call or email.</li>
              <li>Only enter payment details on the official payment page that opens from the app.</li>
            </ul>
          ),
        },
        {
          heading: "Report a problem",
          body: (
            <p>
              If someone pressures you, asks to pay outside the app, or makes you feel unsafe, stop
              the deal and email us at <strong>{BRAND.contactEmail}</strong>. If you are in danger,
              contact the police first.
            </p>
          ),
        },
      ]}
    />
  );
}
