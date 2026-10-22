import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `What information ${BRAND.name} collects, why, and your rights.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="22 October 2026"
      draft
      intro={
        <p>
          This policy explains what information {BRAND.legalName} collects when you use {BRAND.name},
          how we use it, and the choices you have. We follow the Nigeria Data Protection Act 2023.
        </p>
      }
      sections={[
        {
          heading: "What we collect",
          body: (
            <ul>
              <li><strong>Account details:</strong> your name, email address and password (stored only as a secure one-way hash, never in plain text).</li>
              <li><strong>Profile:</strong> your photo, bio and the area you set, including its map coordinates.</li>
              <li><strong>Listings:</strong> the photos, descriptions, prices and locations you post.</li>
              <li><strong>Payout details:</strong> the bank name, account number and account name you add to get paid.</li>
              <li><strong>Activity:</strong> your orders, bookings, payments, reviews and messages with other users.</li>
              <li><strong>Your location:</strong> only if you choose &ldquo;Use my current location&rdquo;. Your browser asks for permission first.</li>
            </ul>
          ),
        },
        {
          heading: "How we use it",
          body: (
            <ul>
              <li>To run your account and show you items and services near you.</li>
              <li>To process payments, hold them safely and pay sellers.</li>
              <li>To send emails about your orders, messages, payouts and account.</li>
              <li>To handle disputes and keep the platform safe from fraud and abuse.</li>
            </ul>
          ),
        },
        {
          heading: "What other people can see",
          body: (
            <p>
              Your name, photo, bio, area, listings and reviews are visible to other users. Other
              people see your listing&apos;s location to within about half a kilometre, never your
              exact address, and distances are rounded to the nearest half kilometre. Your email
              address and bank details are never shown to other users.
            </p>
          ),
        },
        {
          heading: "Services we work with",
          body: (
            <>
              <p>We share only what each service needs to do its job:</p>
              <ul>
                <li><strong>Flutterwave</strong> processes payments, verifies bank accounts and sends payouts.</li>
                <li><strong>Cloudinary</strong> stores the photos you upload.</li>
                <li><strong>Resend</strong> sends our emails.</li>
                <li><strong>OpenStreetMap (Nominatim)</strong> turns locations into area names when you search for or detect your area.</li>
                <li><strong>Railway</strong> and <strong>Vercel</strong> host our servers and website.</li>
              </ul>
              <p>We don&apos;t sell your information.</p>
            </>
          ),
        },
        {
          heading: "How long we keep it",
          body: (
            <p>
              We keep your information while your account is open. Records of payments and disputes
              may be kept longer where the law requires it. Your browser also stores your chosen area
              and some settings on your device; you can clear these at any time.
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              You can ask to see, correct or delete your information, or object to how we use it. You
              can update most details yourself from your profile. For anything else, email{" "}
              <strong>{BRAND.contactEmail}</strong>. You can also complain to the Nigeria Data
              Protection Commission.
            </p>
          ),
        },
        {
          heading: "Changes and contact",
          body: (
            <p>
              We&apos;ll tell you about important changes to this policy. Questions? Email{" "}
              <strong>{BRAND.contactEmail}</strong>.
            </p>
          ),
        },
      ]}
    />
  );
}
