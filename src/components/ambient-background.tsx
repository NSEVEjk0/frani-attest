"use client";

/**
 * AmbientBackground — trust canvas.
 *
 * Deep charcoal-navy base, a single restrained emerald glow, a faint grid
 * that fades out, and grain. Quiet authority.
 */

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E";

export function AmbientBackground() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #0b0e14, #080a0f)" }} />
      {/* Emerald glow, top-left, very faint */}
      <div
        style={{
          position: "absolute",
          top: "-25%",
          left: "-10%",
          width: "70vw",
          height: "70vw",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 60%)",
        }}
      />
      {/* Faint grid, fading out */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, black 20%, transparent 75%)",
        }}
      />
      {/* Grain */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${NOISE_URI}")`, opacity: 0.03 }} />
    </div>
  );
}
