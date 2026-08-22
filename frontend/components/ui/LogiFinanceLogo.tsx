export function LogiFinanceLogo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { wrapper: "h-8", text: "text-base" },
    md: { wrapper: "h-10", text: "text-lg" },
    lg: { wrapper: "h-14", text: "text-2xl" },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes[size].wrapper} aspect-square`}>
        <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          {/* Truck body */}
          <path d="M20 55 C20 40, 35 25, 55 25 L95 25" stroke="#1a1c1c" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M95 25 L130 25 C140 25, 145 30, 145 40 L145 65 L20 65 L20 55Z" stroke="#ff8c00" strokeWidth="5" fill="none" />
          {/* Truck cabin */}
          <path d="M145 35 L170 35 C178 35, 185 42, 185 50 L185 65 L145 65Z" stroke="#1a1c1c" strokeWidth="5" fill="none" />
          {/* Arrow going up */}
          <path d="M95 25 C105 15, 125 10, 145 5" stroke="#ff8c00" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M135 5 L148 3 L142 15" stroke="#ff8c00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Wheels */}
          <circle cx="50" cy="78" r="14" stroke="#ff8c00" strokeWidth="5" fill="none" />
          <circle cx="50" cy="78" r="4" fill="#ff8c00" />
          <circle cx="160" cy="78" r="14" stroke="#1a1c1c" strokeWidth="5" fill="none" />
          <circle cx="160" cy="78" r="4" fill="#1a1c1c" />
          {/* Ground line */}
          <line x1="10" y1="92" x2="195" y2="92" stroke="#ddc1ae" strokeWidth="2" />
        </svg>
      </div>
      <span className={`font-display font-extrabold tracking-tight ${sizes[size].text}`}>
        <span className="text-on-surface">Logi</span>
        <span className="text-primary-container">Finance</span>
      </span>
    </div>
  );
}
