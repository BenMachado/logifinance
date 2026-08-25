import Link from "next/link";

const FOOTER_LINKS = [
  { to: "/sobre", label: "Sobre" },
  { to: "/precos", label: "Preços" },
  { to: "/contato", label: "Contato" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#222] bg-black text-white">
      <div className="site-shell py-12">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
          LogiFinance
        </Link>
        <nav aria-label="Rodapé" className="mt-8 flex flex-col gap-1 sm:flex-row sm:gap-8">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className="flex h-11 items-center text-sm text-white/70 transition-colors hover:text-white sm:h-auto"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-sm text-[#666]">
          © {new Date().getFullYear()} LogiFinance — gestão financeira para transportadoras
        </p>
      </div>
    </footer>
  );
}
