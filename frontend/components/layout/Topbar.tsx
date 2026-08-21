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

  const avatarLetter = (user?.full_name || "U").charAt(0).toUpperCase();

  return (
    <header className="relative sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-white/90 backdrop-blur-sm px-md md:px-margin">
      <div className="flex items-center gap-sm">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-secondary hover:bg-surfaceContainer-low hover:text-tertiary transition-colors md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
        </button>
        <h1 className="font-display text-headline-md font-bold text-tertiary">
          {titleFromPath(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-md">
        {/* Período */}
        <label className="hidden items-center gap-xs rounded-xl border border-outline-variant bg-surfaceContainer-low px-3 py-1.5 text-data-mono-sm text-tertiary lg:flex hover:border-outline transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm text-secondary">calendar_month</span>
          <select
            className="bg-transparent font-medium text-tertiary outline-none cursor-pointer"
            defaultValue={periodLabel}
            aria-label="Período"
          >
            <option value={periodLabel}>{periodLabel}</option>
            <option>Últimos 14 dias</option>
            <option>Últimos 30 dias</option>
          </select>
        </label>

        {/* Notificações */}
        <Link
          href="/notificacoes"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-secondary hover:bg-surfaceContainer-low hover:text-tertiary transition-colors"
          aria-label="Notificações"
        >
          <span className="material-symbols-outlined">notifications</span>
          {/* Indicador pulsante */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand animate-pulse-ring" />
        </Link>

        {/* Avatar */}
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "bg-brand font-display text-sm font-bold text-white",
            "ring-2 ring-white shadow-sm",
            "transition-all duration-150 hover:ring-brand/30 cursor-default"
          )}
          title={user?.full_name || "Perfil"}
        >
          {avatarLetter}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 z-30 border-b border-outline-variant bg-white/95 backdrop-blur-sm p-md shadow-card md:hidden">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-md">
              <p className="mb-xs px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary/70">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(active ? "nav-item-active" : "nav-item")}
                  >
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
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
