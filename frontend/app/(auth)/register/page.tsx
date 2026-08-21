"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerRequest, loginRequest } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { errorMessage } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: "",
    cnpj: "",
    phone: "",
    full_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const registerData = await registerRequest(form);
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
    <div className="min-h-screen flex items-center justify-center bg-background p-md">
      <div className="w-full max-w-lg card-level-1 rounded p-lg">
        <div className="flex items-center gap-sm mb-lg">
          <div className="h-10 w-10 bg-primary text-primary-foreground rounded flex items-center justify-center font-display font-bold">
            L
          </div>
          <div>
            <h1 className="font-display text-headline-md font-bold text-tertiary m-0 leading-none">LogiFinance</h1>
            <span className="text-data-mono-sm text-secondary">Criar conta de transportadora</span>
          </div>
        </div>

        <h2 className="font-display text-headline-lg font-bold text-tertiary mb-md">Cadastrar Empresa</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input id="company_name" required value={form.company_name} onChange={(e) => update("company_name", e.target.value)} />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="cnpj">CNPJ (opcional)</Label>
              <Input id="cnpj" value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+55 11 9..." />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="full_name">Seu Nome</Label>
              <Input id="full_name" required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div className="flex flex-col gap-xs sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="flex flex-col gap-xs sm:col-span-2">
              <Label htmlFor="password">Senha (mín. 8 caracteres)</Label>
              <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-md text-data-mono-sm text-secondary text-center">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
