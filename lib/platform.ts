// Marketplace rules shown to users (landing page, Terms).
// These mirror the backend: PLATFORM_FEE_PERCENTAGE, PLATFORM_FEE_CAP and CHARGEBACK_FEE in
// viciniti-backend/app/config.py, and the payout/expiry timings in app/utils/scheduler.py.
// Change both sides together.
export const PLATFORM = {
  feePercent: 4,
  feeCap: 30000,
  chargebackFee: 2500,
  // Days between the buyer confirming and the seller's payout
  payoutDays: 3,
  // Days after the seller marks an order complete before it auto-confirms
  autoConfirmDays: 3,
  // Minutes an unpaid order stays open
  unpaidOrderMinutes: 30,
  // Hours a booking request waits for the provider
  bookingRequestHours: 72,
} as const;
