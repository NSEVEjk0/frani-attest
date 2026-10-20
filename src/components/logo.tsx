/**
 * Frani Attest — wordmark + mark.
 *
 * The mark is a verification seal: a double-ring stamp with a check drawn as
 * a single continuous stroke. It reads as authority + approval at any size.
 */

export function AttestMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* outer ring */}
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
      {/* inner ring */}
      <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      {/* check */}
      <path
        d="M16.5 24.5 22 30 31.5 19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AttestWordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <AttestMark size={30} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "1.05rem",
          letterSpacing: "0.02em",
          color: dark ? "#0a0a0a" : "inherit",
        }}
      >
        Frani<span style={{ fontWeight: 400, opacity: 0.55 }}> Attest</span>
      </span>
    </span>
  );
}
