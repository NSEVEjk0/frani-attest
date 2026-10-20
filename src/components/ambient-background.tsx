"use client";

/**
 * AmbientBackground — paper canvas.
 *
 * Warm paper, a faint emerald wash, and a subtle grain. Clean and quiet —
 * like a well-printed certificate.
 */

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

export function AmbientBackground() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #faf9f6, #f4f2ed)" }} />
      {/* Emerald wash, top-right, very faint */}
      <div
        style={{
          position: "absolute",
          top: "-25%",
          right: "-10%",
          width: "70vw",
          height: "70vw",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, transparent 60%)",
        }}
      />
      {/* Grain */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${NOISE_URI}")`, opacity: 0.025 }} />
    </div>
  );
}
