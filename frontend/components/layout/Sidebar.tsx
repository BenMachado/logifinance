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
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-outline-variant bg-white p-md md:flex">
      {/* Logo */}
      <div className="mb-xl flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand shadow-float-brand font-display text-base font-extrabold text-brand-foreground">
          L
        </div>
        <div>
          <h1 className="m-0 font-display text-[15px] font-bold leading-none text-tertiary">
            LogiFinance
          </h1>
          <span className="mt-0.5 block text-data-mono-sm text-secondary">
            {fleetSize} caminhões ativos
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex flex-1 flex-col gap-lg overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary/70">
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
                    className={cn(active ? "nav-item-active" : "nav-item")}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[22px]",
                        active ? "text-brand" : "text-secondary"
                      )}
                      style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[14px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto flex flex-col gap-0.5 border-t border-outline-variant pt-md">
        <Link href="/configuracoes" className="nav-item">
          <span className="material-symbols-outlined text-[22px] text-secondary">person_add</span>
          <span className="text-[14px] font-medium">Convidar equipe</span>
        </Link>
        <a href="mailto:suporte@logifinance.com.br" className="nav-item">
          <span className="material-symbols-outlined text-[22px] text-secondary">help</span>
          <span className="text-[14px] font-medium">Ajuda</span>
        </a>
        <Link href="/login" className="nav-item" onClick={() => logout()}>
          <span className="material-symbols-outlined text-[22px] text-secondary">logout</span>
          <span className="text-[14px] font-medium">Sair</span>
        </Link>
        <p className="px-3 pt-sm text-data-mono-sm text-secondary/50">v0.1.0</p>
      </div>
    </aside>
  );
}
