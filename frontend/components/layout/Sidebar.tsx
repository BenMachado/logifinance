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
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-white p-md md:flex">
      <div className="mb-lg flex items-center gap-sm px-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand font-display text-sm font-extrabold text-brand-foreground">
          L
        </div>
        <div>
          <h1 className="m-0 font-display text-headline-sm font-bold leading-none text-tertiary">LogiFinance</h1>
          <span className="text-data-mono-sm text-secondary">{fleetSize} caminhões ativos</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-lg overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-sm px-sm text-label-caps uppercase text-secondary">{group.label}</p>
            <div className="flex flex-col gap-xs">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} className={cn(active ? "nav-item-active" : "nav-item")}>
                    <span
                      className={cn("material-symbols-outlined", active && "text-brand")}
                      style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-xs border-t border-outline-variant pt-md">
        <Link href="/configuracoes" className="nav-item">
          <span className="material-symbols-outlined">person_add</span>
          <span className="text-sm">Convidar equipe</span>
        </Link>
        <a href="mailto:suporte@logifinance.com.br" className="nav-item">
          <span className="material-symbols-outlined">help</span>
          <span className="text-sm">Ajuda</span>
        </a>
        <Link href="/login" className="nav-item" onClick={() => logout()}>
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm">Sair</span>
        </Link>
        <p className="px-sm pt-sm text-data-mono-sm text-secondary">v0.1.0</p>
      </div>
    </aside>
  );
}
