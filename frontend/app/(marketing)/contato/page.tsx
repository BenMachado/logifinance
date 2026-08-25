"use client";

import { useState } from "react";

export default function ContatoPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="pt-32 pb-24">
      <div className="site-shell">
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <p className="font-mono text-sm uppercase tracking-widest text-[hsl(217,91%,60%)] font-semibold">
              Contato
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight font-heading">
              Fale conosco
            </h1>
            <p className="mt-4 text-lg text-[#aaa] leading-relaxed">
              Quer saber como o LogiFinance pode ajudar sua transportadora?
              Preencha o formulário ou entre em contato diretamente.
            </p>

            <div className="mt-12 space-y-6">
              <div>
                <p className="text-sm text-[#666] font-mono uppercase tracking-widest">Email</p>
                <p className="mt-1 text-white">contato@logifinance.com.br</p>
              </div>
              <div>
                <p className="text-sm text-[#666] font-mono uppercase tracking-widest">WhatsApp</p>
                <p className="mt-1 text-white">(11) 99999-0000</p>
              </div>
              <div>
                <p className="text-sm text-[#666] font-mono uppercase tracking-widest">Endereço</p>
                <p className="mt-1 text-white">São Paulo, SP — Brasil</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#222] bg-[#0a0a0a] p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-[hsl(226,71%,40%)]/20 flex items-center justify-center mb-6">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-bold font-heading">Mensagem enviada!</h3>
                <p className="mt-2 text-[#aaa]">Retornaremos em breve.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-[#aaa]">Nome</label>
                  <input
                    type="text"
                    required
                    className="h-12 rounded-lg border border-[#333] bg-black px-4 text-white outline-none focus:border-[hsl(217,91%,60%)] transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-[#aaa]">Email</label>
                  <input
                    type="email"
                    required
                    className="h-12 rounded-lg border border-[#333] bg-black px-4 text-white outline-none focus:border-[hsl(217,91%,60%)] transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-[#aaa]">Empresa</label>
                  <input
                    type="text"
                    className="h-12 rounded-lg border border-[#333] bg-black px-4 text-white outline-none focus:border-[hsl(217,91%,60%)] transition-colors"
                    placeholder="Nome da transportadora"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-[#aaa]">Mensagem</label>
                  <textarea
                    rows={4}
                    className="rounded-lg border border-[#333] bg-black px-4 py-3 text-white outline-none focus:border-[hsl(217,91%,60%)] transition-colors resize-none"
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 rounded-lg bg-[hsl(226,71%,40%)] text-white font-medium uppercase tracking-widest text-sm hover:bg-[hsl(217,91%,60%)] transition-colors"
                >
                  Enviar mensagem
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
