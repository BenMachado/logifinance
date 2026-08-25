"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/equipe", label: "Equipe" },
  { to: "/contato", label: "Contato" },
];

export const NAV_LINKS = links;

const SOLID_AFTER = 40;

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number | null>(null);

  const update = useCallback(() => {
    setScrolled(window.scrollY > SOLID_AFTER);
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      update();
    });
  }, [update]);

  useEffect(() => {
    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, update]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-[#222]" : ""
      }`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 transition-[background-color,backdrop-filter] duration-300 ${
          scrolled ? "bg-black/95 backdrop-blur-sm" : ""
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/35 to-transparent transition-opacity duration-300 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      />

      <div className="site-shell relative py-5 flex items-center justify-between">
        <Link
          href="/"
          className="min-w-0 flex-1 truncate font-heading text-white text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          LogiFinance
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              aria-current={pathname === link.to ? "page" : undefined}
              className={`text-sm transition-colors ${
                pathname === link.to
                  ? "text-white border-b border-white pb-0.5"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <MobileMenu pathname={pathname} />
      </div>
    </nav>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
        className="relative -mr-2 flex h-11 w-11 items-center justify-center text-white"
      >
        <Menu size={24} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/50 animate-in fade-in-0"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[55] w-[calc(100%-64px)] flex flex-col border-l border-[#222] bg-black text-white animate-in slide-in-from-right duration-300">
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="fixed right-2 top-0 flex h-11 w-11 items-center justify-center text-white outline-none"
            >
              <X size={24} />
            </button>

            <div className="h-28 shrink-0" />

            <div className="flex flex-col space-y-[-3px]">
              {links.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.to ? "page" : undefined}
                  className={`flex h-[54px] w-full items-center justify-end px-12 text-[28px] font-semibold leading-8 tracking-tight ${
                    pathname === link.to ? "text-white" : "text-white/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
