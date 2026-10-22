// Browser geolocation + OpenStreetMap Nominatim geocoding.
// Nominatim's public API allows ~1 request/second, so callers should debounce searches.

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

export interface Place {
  latitude: number;
  longitude: number;
  name: string;
  // Full address line, shown under the name in suggestion lists
  detail?: string;
}

type NominatimAddress = Record<string, string | undefined>;

interface NominatimSearchResult {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: NominatimAddress;
}

// Most local useful name first: a neighbourhood beats a city for a local marketplace
function areaName(address?: NominatimAddress): string | null {
  if (!address) return null;
  return (
    address.suburb ||
    address.neighbourhood ||
    address.city_district ||
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state ||
    null
  );
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: "jsonv2",
      zoom: "14",
      "accept-language": "en",
    });
    const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`);
    if (!response.ok) return null;
    const data = await response.json();
    return areaName(data.address);
  } catch {
    return null;
  }
}

/** Device position plus a readable area name. Rejects with a user-facing message. */
export function detectCurrentLocation(): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Your browser doesn't support location. Search for your area instead."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        // Keep the coordinates even if naming the place fails
        const name = await reverseGeocode(coords.latitude, coords.longitude);
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          name: name ?? "Current location",
        });
      },
      (error) => {
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "Location access is blocked. Allow it in your browser settings, or search for your area instead."
              : "We couldn't get your location. Try again, or search for your area instead.",
          ),
        );
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

/** Areas in Nigeria matching the query. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
    countrycodes: "ng",
    "accept-language": "en",
  });
  const response = await fetch(`${NOMINATIM_URL}/search?${params}`, { signal });
  if (!response.ok) throw new Error("Place search failed");

  const results = (await response.json()) as NominatimSearchResult[];
  const seen = new Set<string>();
  return results
    .filter((result) => {
      if (seen.has(result.display_name)) return false;
      seen.add(result.display_name);
      return true;
    })
    .map((result) => ({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      name: result.name || areaName(result.address) || result.display_name.split(",")[0],
      detail: result.display_name,
    }));
}

/** Great-circle distance in km; mirrors the backend's distance_km calculation. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}
