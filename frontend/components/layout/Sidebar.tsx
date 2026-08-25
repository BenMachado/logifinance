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
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-[#222] bg-black p-md md:flex">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(226,71%,40%)] text-white font-display text-base font-extrabold">
          L
        </div>
        <div>
          <h1 className="m-0 font-display text-[15px] font-bold leading-none text-white">
            LogiFinance
          </h1>
          <span className="mt-0.5 block text-[12px] text-[#aaa]">
            {fleetSize} caminhoes ativos
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex flex-1 flex-col gap-lg overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.08em] font-bold text-[#666]">
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150",
                      active
                        ? "bg-[hsl(226,71%,40%)]/15 text-[hsl(217,91%,60%)] font-semibold"
                        : "text-[#aaa] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[20px]",
                        active ? "text-[hsl(217,91%,60%)]" : "text-[#666]"
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
      <div className="mt-auto flex flex-col gap-0.5 border-t border-[#222] pt-4">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium text-[#aaa] hover:bg-white/5 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-[#666]">person_add</span>
          <span>Convidar equipe</span>
        </Link>
        <a
          href="mailto:suporte@logifinance.com.br"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium text-[#aaa] hover:bg-white/5 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-[#666]">help</span>
          <span>Ajuda</span>
        </a>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium text-[#aaa] hover:bg-white/5 hover:text-white transition-colors"
          onClick={() => logout()}
        >
          <span className="material-symbols-outlined text-[20px] text-[#666]">logout</span>
          <span>Sair</span>
        </Link>
        <p className="px-3 pt-2 text-[11px] text-[#444]">v0.1.0</p>
      </div>
    </aside>
  );
}
