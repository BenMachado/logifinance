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
    <header className="relative sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-outline bg-surface px-md md:px-margin">
      <div className="flex items-center gap-sm">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-DEFAULT text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
        </button>
        <h1 className="font-display text-headline-md font-bold text-on-surface">
          {titleFromPath(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-md">
        {/* Período */}
        <label className="hidden items-center gap-xs rounded-DEFAULT border border-outline bg-surface-container-low px-3 py-1.5 font-mono text-label-caps uppercase font-semibold text-on-surface lg:flex hover:bg-surface-container transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">calendar_month</span>
          <select
            className="bg-transparent font-mono text-label-caps uppercase font-semibold text-on-surface outline-none cursor-pointer"
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
          className="relative flex h-9 w-9 items-center justify-center rounded-DEFAULT text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          aria-label="Notificações"
        >
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          {/* Indicador pulsante */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-container animate-pulse-ring" />
        </Link>

        {/* Avatar */}
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "bg-primary-container font-display text-sm font-extrabold text-on-primary-container border border-on-surface shadow-sm",
            "transition-all duration-150 hover:shadow-md cursor-default"
          )}
          title={user?.full_name || "Perfil"}
        >
          {avatarLetter}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 z-30 border-b border-outline bg-surface-bright p-md shadow-card md:hidden">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-md">
              <p className="mb-xs px-3 font-mono text-label-caps uppercase font-semibold text-on-surface-variant">
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
                    className={cn(
                      "flex items-center gap-sm px-3 py-2 rounded-DEFAULT font-mono text-label-caps uppercase font-semibold",
                      active
                        ? "bg-primary-container/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
          <Link
            href="/login"
            className="flex items-center gap-sm px-3 py-2 rounded-DEFAULT font-mono text-label-caps uppercase font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            onClick={() => logout()}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Sair</span>
          </Link>
        </div>
      )}
    </header>
  );
}
