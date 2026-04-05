// Stale times — how long before data is considered outdated
export const STALE_TIMES = {
  // Static-ish data — changes rarely
  profile: 5 * 60 * 1000, // 5 minutes
  listings: 2 * 60 * 1000, // 2 minutes
  services: 2 * 60 * 1000, // 2 minutes
  publicProfile: 5 * 60 * 1000, // 5 minutes

  // Dynamic data — changes more frequently
  orders: 60 * 1000, // 1 minute
  bookings: 60 * 1000, // 1 minute
  transactions: 60 * 1000, // 1 minute
  notifications: 30 * 1000, // 30 seconds
  messages: 15 * 1000, // 15 seconds
};
