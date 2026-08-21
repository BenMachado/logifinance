"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, titleFromPath } from "@/components/layout/nav";

export function Topbar({ periodLabel }: { periodLabel: string }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-white px-md md:px-margin">
      <div className="flex items-center gap-sm">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-tertiary md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
        </button>
        <h1 className="font-display text-headline-md font-bold text-tertiary">{titleFromPath(pathname)}</h1>
      </div>

      <div className="flex items-center gap-sm md:gap-md">
        <label className="hidden items-center gap-xs rounded-lg border border-outline-variant bg-surfaceContainer-low px-sm py-xs text-data-mono-sm text-tertiary lg:flex">
          <span className="material-symbols-outlined text-sm text-secondary">calendar_month</span>
          <select
            className="bg-transparent font-medium text-tertiary outline-none"
            defaultValue={periodLabel}
            aria-label="Período"
          >
            <option value={periodLabel}>{periodLabel}</option>
            <option>Últimos 14 dias</option>
            <option>Últimos 30 dias</option>
          </select>
        </label>
        <Link href="/notificacoes" className="relative text-secondary hover:text-tertiary" aria-label="Notificações">
          <span className="material-symbols-outlined">notifications</span>
        </Link>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 font-display text-data-mono-sm font-bold text-brand"
          title={user?.full_name || "Perfil"}
        >
          {(user?.full_name || "U").charAt(0).toUpperCase()}
        </div>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 z-30 border-b border-outline-variant bg-white p-md shadow-card md:hidden">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-md">
              <p className="mb-xs px-sm text-label-caps uppercase text-secondary">{group.label}</p>
              {group.items.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(active ? "nav-item-active" : "nav-item")}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
          <Link href="/login" className="nav-item" onClick={() => logout()}>
            <span className="material-symbols-outlined">logout</span>
            Sair
          </Link>
        </div>
      )}
    </header>
  );
}
