"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV = [
  { href: "#inicio", label: "Home" },
  { href: "#sobre", label: "Sobre" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#gestao", label: "Gestão" },
  { href: "/login", label: "Dashboard" },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
];

export function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-white font-body">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-md md:px-xl">
          <Link href="#inicio" className="flex items-center gap-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground font-display font-extrabold">
              L
            </span>
            <span className="font-display text-lg font-bold tracking-tight">LogiFinance</span>
          </Link>

          <nav className="hidden items-center gap-lg md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-sm">
            <Link
              href="/register"
              className="hidden rounded-full bg-brand px-md py-sm text-sm font-bold text-brand-foreground hover:bg-brand-muted sm:inline-flex"
            >
              Começar agora
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white md:hidden"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-white/10 px-md py-md md:hidden">
            <nav className="flex flex-col gap-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-sm py-sm text-white/80"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/register"
                className="mt-sm rounded-full bg-brand px-md py-sm text-center text-sm font-bold text-brand-foreground"
                onClick={() => setOpen(false)}
              >
                Começar agora
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section id="inicio" className="landing-route-bg relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] md:block" aria-hidden>
            <RouteMapBackdrop />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-xl px-md py-xl md:grid-cols-2 md:px-xl md:py-16 lg:py-20">
            <div>
              <p className="mb-md text-label-caps uppercase text-brand">Gestão financeira para transportadoras</p>
              <h1 className="font-display text-display-hero text-white">
                Controle financeiro
                <br />
                inteligente para sua frota
              </h1>
              <p className="mt-md max-w-md text-body-lg text-white/65">
                Custos, margem por viagem e recibos via WhatsApp em um só painel — sem planilha e sem surpresa no fim do mês.
              </p>
              <div className="mt-lg flex flex-wrap items-center gap-md">
                <Link
                  href="/register"
                  className="rounded-full bg-brand px-lg py-sm text-sm font-bold text-brand-foreground hover:bg-brand-muted"
                >
                  Começar agora
                </Link>
                <Link href="#gestao" className="text-sm font-semibold text-white/80 hover:text-white">
                  Ver demonstração →
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <Image
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80"
                  alt="Caminhão em operação na estrada"
                  width={1600}
                  height={1200}
                  priority
                  className="h-[320px] w-full object-cover md:h-[460px]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-transparent md:from-ink/80" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
              </div>

              <div className="absolute bottom-6 left-4 right-4 max-w-xs rounded-2xl border border-white/10 bg-ink-card/90 p-md shadow-float backdrop-blur sm:left-6">
                <div className="flex items-start gap-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
                    <span className="material-symbols-outlined">trending_down</span>
                  </span>
                  <div>
                    <p className="font-display text-2xl font-extrabold leading-none text-white">40%</p>
                    <p className="mt-xs text-body-sm text-white/70">menos custo com manutenção não planejada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2">
          <div className="bg-ink-warm px-md py-xl md:px-xl">
            <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-ink-elevated p-lg">
              <div className="mb-md flex items-center justify-between">
                <h2 className="font-display text-headline-md text-white">OCR de recibos</h2>
                <span className="inline-flex items-center gap-xs rounded-full bg-white/5 px-sm py-xs text-data-mono-sm text-white/80">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Ativo
                </span>
              </div>
              <p className="text-body-md text-white/60">
                O motorista manda a foto no WhatsApp. O LogiFinance lê valor, placa e categoria e lança o custo na viagem certa.
              </p>
              <div className="mt-lg overflow-hidden rounded-xl border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=900&q=80"
                  alt="Operação de entrega e conferência de carga"
                  width={900}
                  height={540}
                  className="h-40 w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div id="sobre" className="bg-ink px-md py-xl md:px-xl">
            <p className="text-label-caps uppercase text-white/40">Impacto na operação</p>
            <p className="mt-sm font-display text-display font-extrabold text-brand">1.2k</p>
            <p className="text-headline-md text-white">viagens com margem rastreadas</p>
            <div className="mt-md flex items-center">
              {AVATARS.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-ink object-cover"
                  style={{ marginLeft: i === 0 ? 0 : -10 }}
                />
              ))}
              <span className="ml-sm text-data-mono-sm text-white/50">Times de frota já no painel</span>
            </div>
            <p className="mt-md max-w-md text-body-md text-white/60">
              Cada rota mostra receita, custo real e se a margem ficou abaixo do que a empresa espera. Alerta na hora, não no fechamento.
            </p>
            <Link href="#beneficios" className="mt-lg inline-flex items-center gap-xs text-sm font-semibold text-brand">
              Saiba mais
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section id="beneficios" className="border-t border-white/10 bg-ink px-md py-xl md:px-xl">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-headline-lg text-white">Feito para o dia a dia da transportadora</h2>
            <div className="mt-lg grid gap-md md:grid-cols-3">
              {[
                {
                  icon: "chat",
                  title: "Recibos pelo WhatsApp",
                  body: "Combustível, pedágio e diária entram automaticamente. Você só confirma o que o OCR não tiver certeza.",
                },
                {
                  icon: "percent",
                  title: "Margem por viagem",
                  body: "Compare o lucro real com a meta da empresa. Viagem no vermelho gera alerta, não relatório atrasado.",
                },
                {
                  icon: "build",
                  title: "Manutenção sob controle",
                  body: "Preventiva, corretiva e inspeção viram custo da placa certa — e param de sumir no caixa.",
                },
              ].map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-ink-card p-lg">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </span>
                  <h3 className="mt-md font-display text-headline-md text-white">{item.title}</h3>
                  <p className="mt-sm text-body-md text-white/60">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="gestao" className="bg-ink-warm px-md py-xl md:px-xl">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-headline-lg text-white">Tudo que a operação precisa acompanhar</h2>
            <div className="mt-lg grid gap-sm sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/login", label: "Frota", desc: "Veículos, motoristas e status" },
                { href: "/login", label: "Custos", desc: "Combustível, pedágio e demais" },
                { href: "/login", label: "Recibos", desc: "OCR e conferência" },
                { href: "/login", label: "Manutenção", desc: "Agenda e ticket médio" },
              ].map((mod) => (
                <Link
                  key={mod.label}
                  href={mod.href}
                  className="rounded-2xl border border-white/10 bg-ink p-lg transition-colors hover:border-brand/40"
                >
                  <p className="font-display font-bold text-white">{mod.label}</p>
                  <p className="mt-xs text-body-sm text-white/55">{mod.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-md py-lg md:px-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-md sm:flex-row sm:items-center">
          <p className="text-data-mono-sm text-white/40">LogiFinance · gestão financeira de frotas</p>
          <Link href="/login" className="text-sm font-semibold text-white/70 hover:text-white">
            Já tem conta? Entrar
          </Link>
        </div>
      </footer>
    </div>
  );
}

function RouteMapBackdrop() {
  return (
    <svg viewBox="0 0 640 640" className="h-full w-full opacity-70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M80 520 C180 480, 200 360, 280 340 C360 320, 380 420, 460 400 C540 380, 560 240, 620 180" stroke="#F97316" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <path d="M40 280 C140 300, 180 220, 260 200 C360 172, 400 280, 500 250 C560 230, 600 140, 640 120" stroke="#F97316" strokeWidth="1.5" opacity="0.25" />
      <circle cx="280" cy="340" r="7" fill="#F97316" />
      <circle cx="460" cy="400" r="5" fill="#FB923C" />
      <circle cx="500" cy="250" r="4" fill="#F97316" opacity="0.8" />
      <g opacity="0.2">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={80 + i * 70} y1="40" x2={40 + i * 70} y2="600" stroke="#F97316" strokeWidth="0.6" />
        ))}
      </g>
    </svg>
  );
}
