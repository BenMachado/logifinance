"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginRequest } from "@/hooks/useAuth";
import { errorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginRequest(email, password);
      toast.success("Login realizado!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(errorMessage(err, "Falha no login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-md">
      <div className="w-full max-w-md card-level-1 rounded p-lg">
        <div className="flex items-center gap-sm mb-lg">
          <div className="h-10 w-10 bg-primary text-primary-foreground rounded flex items-center justify-center font-display font-bold">
            L
          </div>
          <div>
            <h1 className="font-display text-headline-md font-bold text-tertiary m-0 leading-none">LogiFinance</h1>
            <span className="text-data-mono-sm text-secondary">Gestão Financeira de Frotas</span>
          </div>
        </div>

        <h2 className="font-display text-headline-lg font-bold text-tertiary mb-md">Entrar</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-md text-data-mono-sm text-secondary text-center">
          Ainda não tem conta?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
