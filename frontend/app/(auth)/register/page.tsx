"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { registerRequest, loginRequest } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { errorMessage } from "@/lib/api";

const SUPPORT_PHONE = "(47) 99647-2811";

// --- Máscaras ------------------------------------------------------------

function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

// --- Benefícios (lado esquerdo) -----------------------------------------

const BENEFITS = [
  {
    icon: "local_shipping",
    title: "Gestão de frota completa",
    description: "Cadastre veículos, motoristas e viagens em poucos cliques.",
  },
  {
    icon: "receipt_long",
    title: "Controle financeiro",
    description: "Registre custos, recibos e veja a margem em tempo real.",
  },
  {
    icon: "auto_awesome",
    title: "Leitura inteligente",
    description: "OCR automático de recibos — basta fotografar ou enviar PDF.",
  },
  {
    icon: "insights",
    title: "Dashboards e relatórios",
    description: "KPIs, gráficos e exportação CSV para sua contabilidade.",
  },
  {
    icon: "shield",
    title: "Seguro e confiável",
    description: "Multi-tenant, dados criptografados e backup diário.",
  },
  {
    icon: "support_agent",
    title: "Suporte humano",
    description: "Time brasileiro pronto para te atender quando precisar.",
  },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: "",
    full_name: "",
    username: "",
    cpf: "",
    phone: SUPPORT_PHONE,
    email: "",
    password: "",
    accept_terms: false,
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.accept_terms) {
      toast.error("Você precisa aceitar os termos de uso para continuar");
      return;
    }
    if (form.password.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres");
      return;
    }
    if (form.cpf && form.cpf.replace(/\D/g, "").length !== 11) {
      toast.error("CPF incompleto");
      return;
    }

    setLoading(true);
    try {
      const registerData = await registerRequest({
        company_name: form.company_name,
        full_name: form.full_name,
        username: form.username || undefined,
        cpf: form.cpf || undefined,
        phone: form.phone,
        email: form.email,
        password: form.password,
        accept_terms: form.accept_terms,
      });
      await loginRequest(form.email, form.password);
      useAuthStore.getState().setUser({
        id: registerData.user.id,
        email: registerData.user.email,
        full_name: registerData.user.full_name,
        is_admin: registerData.user.is_admin,
        company_id: registerData.company_id,
        company_name: registerData.company_name,
      });
      toast.success("Conta criada! Bem-vindo ao LogiFinance.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(errorMessage(err, "Falha no cadastro"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex">
      {/* ----- Lado esquerdo: informações do produto ----- */}
      <aside className="hidden lg:flex flex-col justify-between w-1/2 xl:w-[55%] bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#0d0d0d] border-r border-[#1a1a1a] p-xl">
        <header className="flex items-center gap-sm">
          <div className="h-10 w-10 bg-[hsl(226,71%,40%)] text-white rounded-lg flex items-center justify-center font-display font-bold shadow-[0_0_0_2px_#000,0_0_0_3px_hsl(226,71%,40%)]">
            L
          </div>
          <div>
            <h1 className="font-display text-headline-md font-bold text-white m-0 leading-none">LogiFinance</h1>
            <span className="text-data-mono-sm text-[#aaa]">Plataforma para transportadoras</span>
          </div>
        </header>

        <div className="flex flex-col gap-lg max-w-[560px]">
          <div>
            <Badge variant="profit">+1.200 transportadoras</Badge>
            <h2 className="mt-sm font-display text-headline-lg font-bold text-white leading-tight">
              A gestão da sua frota, <span className="text-[hsl(217,91%,60%)]">simples como deve ser.</span>
            </h2>
            <p className="mt-xs text-body-md text-[#aaa]">
              Tudo o que você precisa para controlar custos, viagens e motoristas em uma
              única plataforma pensada para o seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="border border-[#1a1a1a] bg-[#0a0a0a] rounded-xl p-md hover:border-[hsl(226,71%,40%)] transition-colors"
              >
                <span className="material-symbols-outlined text-[28px] text-[hsl(217,91%,60%)]">
                  {b.icon}
                </span>
                <p className="mt-xs font-display font-bold text-white m-0">{b.title}</p>
                <p className="text-data-mono-sm text-[#aaa] m-0">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="flex items-center gap-md text-data-mono-sm text-[#777]">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>Plataforma em conformidade com a LGPD</span>
          <span className="text-[#333]">|</span>
          <span>Pagamentos processados pela Stripe</span>
        </footer>
      </aside>

      {/* ----- Lado direito: formulário ----- */}
      <main className="flex-1 flex flex-col p-md sm:p-lg xl:p-xl overflow-y-auto">
        <div className="flex justify-end mb-md">
          <Link
            href="/login"
            className="text-data-mono-sm text-[#aaa] hover:text-white"
          >
            Já tem conta? <span className="text-[hsl(217,91%,60%)] font-bold">Entrar</span>
          </Link>
        </div>

        <div className="w-full max-w-[520px] mx-auto my-auto">
          <div className="flex items-center gap-sm mb-md lg:hidden">
            <div className="h-9 w-9 bg-[hsl(226,71%,40%)] text-white rounded-lg flex items-center justify-center font-display font-bold">
              L
            </div>
            <h1 className="font-display text-headline-sm font-bold text-white m-0">LogiFinance</h1>
          </div>

          <h2 className="font-display text-headline-lg font-bold text-white mb-xs">
            Criar conta gratuita
          </h2>
          <p className="text-data-mono-sm text-[#aaa] mb-md">
            14 dias de teste, sem cartão de crédito.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs sm:col-span-2">
                <Label className="text-[#aaa]" htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  required
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="Seu nome"
                  className="bg-black border-[#222] text-white focus:border-[hsl(217,91%,60%)]"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <Label className="text-[#aaa]" htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  required
                  minLength={3}
                  value={form.username}
                  onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                  placeholder="seu.login"
                  className="bg-black border-[#222] text-white focus:border-[hsl(217,91%,60%)]"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <Label className="text-[#aaa]" htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  inputMode="numeric"
                  value={form.cpf}
                  onChange={(e) => update("cpf", maskCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="bg-black border-[#222] text-white focus:border-[hsl(217,91%,60%)] font-mono"
                />
              </div>

              <div className="flex flex-col gap-xs sm:col-span-2">
                <Label className="text-[#aaa]" htmlFor="company_name">Nome da transportadora</Label>
                <Input
                  id="company_name"
                  required
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  placeholder="Ex: Transportadora Rápido Ltda."
                  className="bg-black border-[#222] text-white focus:border-[hsl(217,91%,60%)]"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <Label className="text-[#aaa]" htmlFor="phone">Telefone de contato</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => update("phone", maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  disabled
                  className="bg-[#050505] border-[#1a1a1a] text-[#888] cursor-not-allowed font-mono"
                />
                <span className="text-data-mono-sm text-[#666]">
                  Telefone principal da sua empresa
                </span>
              </div>

              <div className="flex flex-col gap-xs sm:col-span-2">
                <Label className="text-[#aaa]" htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="voce@empresa.com.br"
                  className="bg-black border-[#222] text-white focus:border-[hsl(217,91%,60%)]"
                />
              </div>

              <div className="flex flex-col gap-xs sm:col-span-2">
                <Label className="text-[#aaa]" htmlFor="password">Senha (mín. 8 caracteres)</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  className="bg-black border-[#222] text-white focus:border-[hsl(217,91%,60%)]"
                />
              </div>
            </div>

            <label className="flex items-start gap-sm cursor-pointer select-none py-xs">
              <input
                type="checkbox"
                checked={form.accept_terms}
                onChange={(e) => update("accept_terms", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#333] bg-black accent-[hsl(217,91%,60%)]"
              />
              <span className="text-data-mono-sm text-[#aaa]">
                Li e concordo com os{" "}
                <a href="#" className="text-[hsl(217,91%,60%)] hover:underline">termos de uso</a>
                {" "}e{" "}
                <a href="#" className="text-[hsl(217,91%,60%)] hover:underline">política de privacidade</a>.
              </span>
            </label>

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "Criando conta..." : "Criar conta gratuita"}
            </Button>

            <p className="text-data-mono-sm text-[#666] text-center mt-xs">
              Ao criar a conta você terá acesso imediato ao dashboard. Para cadastrar veículos,
              viagens e custos é necessário assinar um plano.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}