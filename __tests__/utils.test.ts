import { formatDistance } from "@/lib/utils";

// Locations are blurred to ~550 m, so labels never show anything finer than half a kilometre
describe("formatDistance", () => {
  it.each([
    [0.2, "Under 1 km away"],
    [0.5, "Under 1 km away"],
    [0.99, "Under 1 km away"],
    [1, "1 km away"],
    [1.24, "1 km away"],
    [1.26, "1.5 km away"],
    [2.5, "2.5 km away"],
    [9.6, "9.5 km away"],
    [12.4, "12 km away"],
    [37.8, "38 km away"],
  ])("%p km -> %p", (km, label) => {
    expect(formatDistance(km)).toBe(label);
  });
});
