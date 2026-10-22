import { useId } from "react";

interface StreetPatternProps {
  // Draw the two curved "main roads" over the grid
  roads?: boolean;
  className?: string;
}

// Faint street-grid background used on dark green surfaces (map, profile band, trust section).
// Fills its positioned parent.
export default function StreetPattern({ roads = false, className = "" }: StreetPatternProps) {
  // Unique per instance so several patterns on one page don't share an id
  const patternId = `streets-${useId().replace(/:/g, "")}`;

  return (
    <svg className={`absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <pattern id={patternId} width="88" height="88" patternUnits="userSpaceOnUse">
          <path d="M0 44h88M44 0v88" stroke="white" strokeOpacity="0.07" strokeWidth="1.5" />
          <path d="M0 0h88v88" fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      {roads && (
        <>
          <path d="M-20 320 C 180 260, 320 420, 760 300" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="10" />
          <path d="M260 -20 C 230 200, 380 380, 300 900" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="7" />
        </>
      )}
    </svg>
  );
}
