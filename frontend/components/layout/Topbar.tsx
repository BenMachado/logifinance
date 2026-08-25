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
    <header className="relative sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-[#222] bg-black px-md md:px-margin">
      <div className="flex items-center gap-sm">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-DEFAULT text-[#aaa] hover:bg-white/5 hover:text-white transition-colors md:hidden"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
        </button>
        <h1 className="font-display text-headline-md font-bold text-white">
          {titleFromPath(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-md">
        {/* Período */}
        <label className="hidden items-center gap-2 rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-1.5 text-[13px] text-white lg:flex hover:bg-white/5 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[16px] text-[#666]">calendar_month</span>
          <select
            className="bg-transparent text-[13px] font-medium text-white outline-none cursor-pointer"
            defaultValue={periodLabel}
            aria-label="Periodo"
          >
            <option value={periodLabel}>{periodLabel}</option>
            <option>Últimos 14 dias</option>
            <option>Últimos 30 dias</option>
          </select>
        </label>

        {/* Notificações */}
        <Link
          href="/notificacoes"
          className="relative flex h-9 w-9 items-center justify-center rounded-DEFAULT text-[#aaa] hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Notificações"
        >
          <span className="material-symbols-outlined text-[#aaa]">notifications</span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[hsl(217,91%,60%)] animate-pulse-ring" />
        </Link>

        {/* Avatar */}
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "bg-[hsl(226,71%,40%)] font-display text-sm font-extrabold text-white border border-[#333] shadow-sm",
            "transition-all duration-150 hover:shadow-md cursor-default"
          )}
          title={user?.full_name || "Perfil"}
        >
          {avatarLetter}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-16 z-30 border-b border-[#222] bg-black p-md shadow-card md:hidden">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-md">
              <p className="mb-xs px-3 font-mono text-label-caps uppercase font-semibold text-[#666]">
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
                        ? "bg-[hsl(226,71%,40%)]/15 text-[hsl(217,91%,60%)]"
                        : "text-[#aaa] hover:bg-white/5 hover:text-white"
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
            className="flex items-center gap-sm px-3 py-2 rounded-DEFAULT font-mono text-label-caps uppercase font-semibold text-[#aaa] hover:bg-white/5 hover:text-white"
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
