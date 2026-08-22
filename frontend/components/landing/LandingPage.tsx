"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#gestao", label: "Gestão" },
  { href: "/login", label: "Dashboard" },
];

const MOBILE_BOTTOM_NAV = [
  { href: "/frota/veiculos", label: "Frota", icon: "local_shipping" },
  { href: "/custos", label: "Finanças", icon: "attach_money" },
  { href: "/viagens", label: "Rotas", icon: "alt_route" },
  { href: "/configuracoes", label: "Config", icon: "settings" },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
];

export function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-md md:px-xl">
          <Link href="#inicio" className="flex items-center gap-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-DEFAULT bg-primary-container text-on-primary-container font-display font-extrabold border border-on-surface shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              L
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-on-surface">LogiFinance</span>
          </Link>

          <nav className="hidden items-center gap-lg md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-label-caps uppercase font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-sm">
            <Link
              href="/login"
              className="hidden font-mono text-label-caps uppercase font-semibold text-on-surface-variant hover:text-on-surface sm:inline-flex px-3 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="hidden rounded-DEFAULT bg-primary-container px-5 py-2 font-mono text-label-caps uppercase font-bold text-on-primary-container border border-on-surface shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all sm:inline-flex"
            >
              Começar Agora
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-DEFAULT border border-outline-variant text-on-surface md:hidden"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-outline-variant bg-surface-bright px-md py-md md:hidden">
            <nav className="flex flex-col gap-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-DEFAULT px-sm py-sm font-mono text-label-caps uppercase font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/register"
                className="mt-sm rounded-DEFAULT bg-primary-container px-md py-sm text-center font-mono text-label-caps uppercase font-bold text-on-primary-container border border-on-surface shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                onClick={() => setOpen(false)}
              >
                Começar Agora
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section id="inicio" className="relative overflow-hidden bg-surface-bright border-b border-outline-variant py-12 md:py-20">
          <div className="relative mx-auto grid max-w-6xl items-center gap-xl px-md md:grid-cols-2 md:px-xl">
            <div>
              <div className="mb-md inline-flex items-center gap-xs rounded-full bg-primary-container/15 px-3 py-1 font-mono text-label-caps uppercase font-bold text-primary border border-primary-container/30">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                Gestão Financeira para Transportadoras
              </div>
              <h1 className="font-display text-headline-lg-mobile md:text-display-lg font-extrabold text-on-surface leading-tight">
                Controle financeiro inteligente para sua frota
              </h1>
              <p className="mt-md max-w-lg text-body-lg text-on-surface-variant">
                Custos, margem por viagem e recibos via WhatsApp em um só painel — sem planilha e sem surpresas no fim do mês.
              </p>
              <div className="mt-lg flex flex-wrap items-center gap-md">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-sm rounded-DEFAULT bg-primary-container px-6 py-3 font-mono text-label-caps uppercase font-bold text-on-primary-container border border-on-surface shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
                >
                  Começar Agora
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <Link
                  href="#gestao"
                  className="inline-flex items-center gap-xs rounded-DEFAULT border border-outline-variant bg-surface-container-low px-5 py-3 font-mono text-label-caps uppercase font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  Ver Demonstração
                </Link>
              </div>

              <div className="mt-xl flex items-center gap-md border-t border-outline-variant pt-md">
                <div className="flex -space-x-2">
                  {AVATARS.map((src, i) => (
                    <Image
                      key={src}
                      src={src}
                      alt="Gestor de frota"
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full border-2 border-surface-bright object-cover"
                    />
                  ))}
                </div>
                <div className="text-mono-data text-xs text-on-surface-variant">
                  <strong className="text-on-surface font-semibold">+1.200</strong> viagens com margem monitorada
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-xl border border-on-surface bg-surface shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <Image
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80"
                  alt="Caminhão em operação na estrada"
                  width={1600}
                  height={1200}
                  priority
                  className="h-[300px] w-full object-cover md:h-[420px]"
                />
              </div>

              {/* Neo-brutalist Floating Metric Card */}
              <div className="absolute -bottom-5 left-4 right-4 max-w-xs rounded-xl border border-on-surface bg-surface-bright p-md shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:left-6">
                <div className="flex items-center gap-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary border border-on-surface">
                    <span className="material-symbols-outlined text-[22px]">trending_up</span>
                  </span>
                  <div>
                    <p className="font-display text-2xl font-extrabold leading-none text-on-surface">+18.4%</p>
                    <p className="mt-0.5 text-mono-data text-xs text-on-surface-variant">margem líquida média por rota</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Section: 3 Cards */}
        <section id="beneficios" className="border-b border-outline-variant bg-surface py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-md md:px-xl">
            <div className="mb-xl text-center max-w-2xl mx-auto">
              <p className="font-mono text-label-caps uppercase font-bold text-primary">Diferenciais</p>
              <h2 className="mt-xs font-display text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
                Feito para o dia a dia da transportadora
              </h2>
              <p className="mt-sm text-body-md text-on-surface-variant">
                Tecnologia robusta com integração WhatsApp para eliminar perdas operacionais e lentidão financeira.
              </p>
            </div>

            <div className="grid gap-lg md:grid-cols-3">
              {[
                {
                  icon: "chat",
                  title: "Recibos via WhatsApp + OCR",
                  body: "O motorista envia a foto do comprovante pelo WhatsApp. O OCR extrai valor, placa e categoria automaticamente para confirmação rápida.",
                },
                {
                  icon: "percent",
                  title: "Margem Real por Viagem",
                  body: "Acompanhe receita vs custos consolidados em tempo real. Viagens com margem abaixo do esperado disparam alertas automáticos imediatos.",
                },
                {
                  icon: "build",
                  title: "Manutenção & Custo de Frota",
                  body: "Controle preventivas, corretivas e histórico de despesas por veículo, mantendo o ticket médio e a disponibilidade sob total domínio.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm hover:border-primary hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary border border-outline">
                    <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                  </span>
                  <h3 className="mt-md font-display text-title-md font-bold text-on-surface">{item.title}</h3>
                  <p className="mt-sm text-body-sm text-on-surface-variant leading-relaxed">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Gestão / Módulos */}
        <section id="gestao" className="border-b border-outline-variant bg-surface-bright py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-md md:px-xl">
            <div className="mb-xl flex flex-col md:flex-row md:items-end md:justify-between gap-md">
              <div>
                <p className="font-mono text-label-caps uppercase font-bold text-primary">Plataforma Completa</p>
                <h2 className="mt-xs font-display text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
                  Tudo que a operação precisa acompanhar
                </h2>
              </div>
              <Link
                href="/login"
                className="font-mono text-label-caps uppercase font-bold text-primary hover:underline inline-flex items-center gap-xs"
              >
                Acessar Sistema
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/frota/veiculos", label: "Frota", icon: "local_shipping", desc: "Veículos, motoristas e status operacional" },
                { href: "/custos", label: "Custos", icon: "receipt_long", desc: "Combustível, pedágio, alimentação e taxas" },
                { href: "/recibos", label: "Recibos", icon: "document_scanner", desc: "OCR automatizado e conciliação ágil" },
                { href: "/manutencao", label: "Manutenção", icon: "build", desc: "Histórico preventivo e ticket médio por placa" },
              ].map((mod) => (
                <Link
                  key={mod.label}
                  href={mod.href}
                  className="group rounded-xl border border-outline-variant bg-surface p-lg transition-all duration-200 hover:border-on-surface hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-DEFAULT bg-surface-container text-on-surface group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    <span className="material-symbols-outlined text-[22px]">{mod.icon}</span>
                  </div>
                  <p className="mt-md font-display text-title-md font-bold text-on-surface">{mod.label}</p>
                  <p className="mt-xs text-body-sm text-on-surface-variant">{mod.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface px-md py-lg md:px-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-md sm:flex-row sm:items-center">
          <div className="flex items-center gap-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-DEFAULT bg-primary-container text-on-primary-container font-display font-bold text-xs border border-on-surface">
              L
            </span>
            <p className="font-mono text-label-caps uppercase text-on-surface-variant">LogiFinance · Gestão Financeira de Frotas</p>
          </div>
          <Link href="/login" className="font-mono text-label-caps uppercase font-semibold text-primary hover:underline">
            Já tem conta? Entrar no sistema →
          </Link>
        </div>
      </footer>

      {/* Mobile Bottom Navigation: Fleet, Finance, Routes, Settings */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline bg-surface-bright px-2 md:hidden">
        {MOBILE_BOTTOM_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="font-mono text-[10px] uppercase font-semibold tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
