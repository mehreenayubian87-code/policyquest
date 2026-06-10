export function PolicyIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2
  };

  return (
    <span className="policyIcon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {name === "user" ? (
          <>
            <circle cx="12" cy="8" r="4" {...common} />
            <path d="M4 21c1.6-4 4.2-6 8-6s6.4 2 8 6" {...common} />
          </>
        ) : name === "briefcase" ? (
          <>
            <path d="M9 7V5h6v2" {...common} />
            <rect x="4" y="7" width="16" height="12" rx="2" {...common} />
            <path d="M4 12h16" {...common} />
          </>
        ) : name === "network" ? (
          <>
            <circle cx="6" cy="12" r="3" {...common} />
            <circle cx="18" cy="6" r="3" {...common} />
            <circle cx="18" cy="18" r="3" {...common} />
            <path d="M8.5 10.5l7-3M8.5 13.5l7 3" {...common} />
          </>
        ) : name === "chart" ? (
          <>
            <path d="M5 19V5M5 19h14" {...common} />
            <path d="M8 16v-5M12 16V8M16 16v-3" {...common} />
          </>
        ) : name === "landmark" ? (
          <>
            <path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M5 18h14M12 4l8 4H4z" {...common} />
          </>
        ) : name === "scale" ? (
          <>
            <path d="M12 4v16M6 7h12M7 7l-3 6h6zM17 7l-3 6h6z" {...common} />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="8" {...common} />
            <path d="M9 12l2 2 4-5" {...common} />
          </>
        )}
      </svg>
    </span>
  );
}
