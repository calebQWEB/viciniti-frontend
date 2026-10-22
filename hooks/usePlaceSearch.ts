import { useEffect, useState } from "react";
import { Place, searchPlaces } from "@/lib/geo";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

/** Debounced area search. Pass an empty string to stay idle. */
export const usePlaceSearch = (query: string) => {
  const [results, setResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        setResults(await searchPlaces(trimmed, controller.signal));
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, isSearching };
};
