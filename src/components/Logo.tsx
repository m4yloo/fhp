/**
 * FHP brand mark — "bean cradling F".
 *
 * A two-lobed bean pod (the "Fazúľové" / bean identity) cradling a glowing
 * gradient F (the treasure inside). Uses the electric-violet → sky gradient
 * from the existing theme. Rendered as crisp SVG so it scales to any size.
 *
 * Pass `animated` to play the draw-in sequence (intro). Static otherwise.
 */

const BEAN =
  "M32 7 A15 15 0 0 1 43.2 32 A15 15 0 0 1 32 57 A15 15 0 0 1 20.8 32 A15 15 0 0 1 32 7 Z";

// F as stroked subpaths (vertical bar + top arm + mid arm).
const F = "M29 44 L29 18 L43 18 M29 31 L39 31";

export function Logo({
  size = 40,
  animated = false,
  className,
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="FHP logo"
    >
      <defs>
        <linearGradient id="fhp-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#9d5cff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="fhp-bean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e1d63" />
          <stop offset="100%" stopColor="#140e2a" />
        </linearGradient>
        <filter id="fhp-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* ambient glow behind the pod */}
      <path
        d={BEAN}
        fill="url(#fhp-grad)"
        filter="url(#fhp-glow)"
        className={animated ? "fhp-fade-glow" : undefined}
        style={animated ? { animationDuration: ".6s", animationDelay: ".1s" } : undefined}
        opacity={animated ? undefined : 0.35}
      />

      {/* pod fill (fades in when animated) */}
      <path
        d={BEAN}
        fill="url(#fhp-bean)"
        className={animated ? "fhp-fade" : undefined}
        style={animated ? { animationDuration: ".6s", animationDelay: ".15s" } : undefined}
      />

      {/* pod outline (draws in when animated) */}
      <path
        d={BEAN}
        fill="none"
        stroke="url(#fhp-grad)"
        strokeWidth="1.5"
        pathLength={1}
        className={animated ? "fhp-draw" : undefined}
        style={animated ? { animationDuration: ".7s", animationDelay: "0s" } : undefined}
      />

      {/* F glow */}
      <path
        d={F}
        stroke="url(#fhp-grad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#fhp-glow)"
        className={animated ? "fhp-fade-glow" : undefined}
        style={animated ? { animationDuration: ".5s", animationDelay: ".55s" } : undefined}
        opacity={animated ? undefined : 0.5}
      />

      {/* F */}
      <path
        d={F}
        stroke="url(#fhp-grad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className={animated ? "fhp-draw" : undefined}
        style={animated ? { animationDuration: ".6s", animationDelay: ".5s" } : undefined}
      />
    </svg>
  );
}
