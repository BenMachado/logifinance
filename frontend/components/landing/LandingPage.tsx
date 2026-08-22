"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogiFinanceLogo } from "@/components/ui/LogiFinanceLogo";

const NAV = [
  { href: "#inicio", label: "Inicio" },
  { href: "#sobre", label: "Sobre" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#gestao", label: "Gestao" },
];

export function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-16">
          <Link href="/" className="flex items-center">
            <LogiFinanceLogo size="md" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-[12px] uppercase tracking-[0.05em] font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden font-mono text-[12px] uppercase tracking-[0.05em] font-semibold text-on-surface-variant hover:text-on-surface sm:inline-flex px-3 py-2 rounded-lg transition-colors hover:bg-surface-container-high"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary-container px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.05em] font-bold text-on-primary-container border border-outline hover:bg-primary hover:text-on-primary transition-all duration-200"
            >
              Comecar Agora
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-outline-variant bg-surface px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.05em] font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/register"
                className="mt-2 rounded-xl bg-primary-container px-4 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.05em] font-bold text-on-primary-container border border-outline hover:bg-primary hover:text-on-primary transition-all"
                onClick={() => setOpen(false)}
              >
                Comecar Agora
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section id="inicio" className="relative overflow-hidden bg-surface-bright border-b border-outline-variant py-12 md:py-24">
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-16">
            <div>
              <h1 className="font-display text-[24px] leading-[32px] md:text-[48px] md:leading-[56px] font-extrabold tracking-tight text-on-surface">
                Controle financeiro inteligente para sua frota
              </h1>
              <p className="mt-4 max-w-lg text-[16px] leading-[24px] text-on-surface-variant">
                Custos, margem por viagem e recibos via WhatsApp em um so painel — sem planilha e sem surpresas no fim do mes.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-6 py-3 font-mono text-[11px] uppercase tracking-[0.05em] font-bold text-on-primary-container border border-outline hover:bg-primary hover:text-on-primary transition-all duration-200"
                >
                  Comecar Agora
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link
                  href="#gestao"
                  className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-5 py-3 font-mono text-[11px] uppercase tracking-[0.05em] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Ver Demonstracao
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface">
                <Image
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80"
                  alt="Caminhao em operacao na estrada"
                  width={1600}
                  height={1200}
                  priority
                  className="h-[280px] w-full object-cover md:h-[400px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="border-b border-outline-variant bg-surface py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-16">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] font-bold text-primary">Sobre</p>
              <h2 className="mt-2 font-display text-[24px] leading-[32px] md:text-[32px] md:leading-[40px] font-bold text-on-surface">
                Logistica inteligente, financas sob controle
              </h2>
              <p className="mt-4 text-[16px] leading-[24px] text-on-surface-variant">
                Cada rota mostra receita, custo real e se a margem ficou abaixo do que a empresa espera.
                Alerta na hora, nao no fechamento.
              </p>
            </div>
          </div>
        </section>

        <section id="beneficios" className="border-b border-outline-variant bg-surface-bright py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-16">
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] font-bold text-primary">Diferenciais</p>
              <h2 className="mt-2 font-display text-[24px] leading-[32px] md:text-[32px] md:leading-[40px] font-bold text-on-surface">
                Feito para o dia a dia da transportadora
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: "chat",
                  title: "Recibos via WhatsApp + OCR",
                  body: "O motorista envia a foto do comprovante pelo WhatsApp. O OCR extrai valor, placa e categoria automaticamente.",
                },
                {
                  icon: "percent",
                  title: "Margem Real por Viagem",
                  body: "Acompanhe receita vs custos em tempo real. Viagens com margem abaixo do esperado disparam alertas automaticos.",
                },
                {
                  icon: "build",
                  title: "Manutencao & Custo de Frota",
                  body: "Controle preventivas, corretivas e historico de despesas por veiculo com ticket medio sob controle.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl border border-outline-variant bg-surface p-6 hover:border-primary transition-colors duration-200"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-fixed text-primary border border-outline">
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </span>
                  <h3 className="mt-4 font-display text-[18px] leading-[24px] font-bold text-on-surface">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-[20px] text-on-surface-variant">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="gestao" className="border-b border-outline-variant bg-surface py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-16">
            <div className="mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.05em] font-bold text-primary">Plataforma Completa</p>
              <h2 className="mt-2 font-display text-[24px] leading-[32px] md:text-[32px] md:leading-[40px] font-bold text-on-surface">
                Tudo que a operacao precisa acompanhar
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/frota/veiculos", label: "Frota", icon: "local_shipping", desc: "Veiculos, motoristas e status" },
                { href: "/custos", label: "Custos", icon: "receipt_long", desc: "Combustivel, pedagio e taxas" },
                { href: "/recibos", label: "Recibos", icon: "document_scanner", desc: "OCR automatizado" },
                { href: "/manutencao", label: "Manutencao", icon: "build", desc: "Historico e ticket medio" },
              ].map((mod) => (
                <Link
                  key={mod.label}
                  href={mod.href}
                  className="group rounded-xl border border-outline-variant bg-surface-bright p-5 transition-all duration-200 hover:border-on-surface hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-on-surface group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{mod.icon}</span>
                  </div>
                  <p className="mt-3 font-display text-[16px] leading-[24px] font-bold text-on-surface">{mod.label}</p>
                  <p className="mt-1 text-[13px] leading-[20px] text-on-surface-variant">{mod.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-bright border-b border-outline-variant py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-16 text-center">
            <h2 className="font-display text-[24px] leading-[32px] md:text-[32px] md:leading-[40px] font-bold text-on-surface">
              Comece a controlar sua operacao hoje
            </h2>
            <p className="mt-3 text-[16px] text-on-surface-variant max-w-xl mx-auto">
              Cadastro gratuito. Sem cartao de credito. Configure em menos de 5 minutos.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.05em] font-bold text-on-primary-container border border-outline hover:bg-primary hover:text-on-primary transition-all duration-200"
              >
                Criar Conta Gratuita
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant bg-surface px-4 py-6 md:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <LogiFinanceLogo size="sm" />
          <Link href="/login" className="font-mono text-[11px] uppercase tracking-[0.05em] font-semibold text-primary hover:underline">
            Ja tem conta? Entrar
          </Link>
        </div>
      </footer>
    </div>
  );
}
