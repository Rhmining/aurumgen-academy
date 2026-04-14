import clsx from "clsx";

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  showWordmark = true
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={clsx("inline-flex items-center gap-3.5 leading-none", className)}>
      <svg
        viewBox="0 0 96 96"
        aria-hidden="true"
        className={clsx("h-11 w-11 shrink-0 overflow-visible drop-shadow-[0_6px_14px_rgba(240,166,0,0.25)]", markClassName)}
      >
        <defs>
          <linearGradient id="aurumgen-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F09300" />
            <stop offset="45%" stopColor="#FFC400" />
            <stop offset="100%" stopColor="#F0B600" />
          </linearGradient>
        </defs>
        <rect x="10" y="8" width="76" height="16" rx="5" fill="url(#aurumgen-gold)" />
        <path d="M22 30h14v42H24.5c-2.2-9.5-3.2-22.2-2.5-42Z" fill="url(#aurumgen-gold)" />
        <path d="M60 30h14c.7 19.8-.3 32.5-2.5 42H60V30Z" fill="url(#aurumgen-gold)" />
        <circle cx="48" cy="43" r="9.5" fill="url(#aurumgen-gold)" />
        <circle cx="48" cy="62.5" r="9.5" fill="url(#aurumgen-gold)" />
        <path d="M20 76h56c-3.6 7.9-12.7 12-28 12S23.6 83.9 20 76Z" fill="url(#aurumgen-gold)" />
        <path d="M82 29.5v37.5" stroke="url(#aurumgen-gold)" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M82 67c0 0 3.3 3.2 3.3 5.4S83.8 77 82 78.4c-1.8-1.4-3.3-4-3.3-6s3.3-5.4 3.3-5.4Z"
          fill="url(#aurumgen-gold)"
        />
      </svg>

      {showWordmark ? (
        <span className={clsx("flex min-w-0 flex-col", textClassName)}>
          <span className="font-display text-[1.02rem] font-semibold tracking-[0.1em] text-[#DAA300] md:text-[1.08rem]">
            AURUMGEN
          </span>
          <span className="mt-1 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--foreground))] opacity-80 md:text-[0.8rem]">
            Academy
          </span>
        </span>
      ) : null}
    </span>
  );
}
