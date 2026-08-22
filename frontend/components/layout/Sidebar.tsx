"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { NAV_GROUPS } from "@/components/layout/nav";

export function Sidebar({ fleetSize = 0 }: { fleetSize?: number }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-bright p-md md:flex">
      {/* Logo */}
      <div className="mb-xl flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-DEFAULT bg-primary-container font-display text-base font-extrabold text-on-primary-container border border-on-surface shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          L
        </div>
        <div>
          <h1 className="m-0 font-display text-[15px] font-bold leading-none text-on-surface">
            LogiFinance
          </h1>
          <span className="mt-0.5 block text-mono-data text-on-surface-variant text-[12px]">
            {fleetSize} caminhões ativos
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex flex-1 flex-col gap-lg overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 font-mono text-label-caps uppercase font-semibold text-on-surface-variant">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-sm px-3 py-2.5 rounded-DEFAULT transition-all duration-150 font-mono text-label-caps uppercase font-semibold",
                      active
                        ? "bg-primary-container/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[20px]",
                        active ? "text-primary" : "text-on-surface-variant"
                      )}
                      style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto flex flex-col gap-0.5 border-t border-outline-variant pt-md">
        <Link
          href="/configuracoes"
          className="flex items-center gap-sm px-3 py-2 rounded-DEFAULT font-mono text-label-caps uppercase font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person_add</span>
          <span>Convidar equipe</span>
        </Link>
        <a
          href="mailto:suporte@logifinance.com.br"
          className="flex items-center gap-sm px-3 py-2 rounded-DEFAULT font-mono text-label-caps uppercase font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">help</span>
          <span>Ajuda</span>
        </a>
        <Link
          href="/login"
          className="flex items-center gap-sm px-3 py-2 rounded-DEFAULT font-mono text-label-caps uppercase font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          onClick={() => logout()}
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">logout</span>
          <span>Sair</span>
        </Link>
        <p className="px-3 pt-sm font-mono text-[11px] text-on-surface-variant/60">v0.1.0</p>
      </div>
    </aside>
  );
}
