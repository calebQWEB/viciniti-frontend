export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
};

// Format date to readable string
export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

// Truncate long text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Get initials from name for avatar placeholder
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Distance label for cards, e.g. "Under 1 km away", "1.5 km away", "12 km away".
// Locations are blurred to ~550 m for privacy, so nothing finer than half a kilometre is shown.
export const formatDistance = (km: number): string => {
  if (km < 1) return "Under 1 km away";
  if (km < 10) {
    const halfKm = Math.round(km * 2) / 2;
    return `${Number.isInteger(halfKm) ? halfKm : halfKm.toFixed(1)} km away`;
  }
  return `${Math.round(km)} km away`;
};
