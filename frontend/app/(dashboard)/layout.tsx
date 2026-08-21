"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatPercent } from "@/lib/utils";

const monthLabel = (() => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const d = new Date();
  return `${months[d.getMonth()]}, ${d.getFullYear()}`;
})();

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
    }
  }, [accessToken, router]);

  const { data: kpis } = useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: async () => (await api.get("/dashboard/kpis")).data,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-md animate-fade-in">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand" />
            <span className="font-display text-sm font-extrabold text-brand">L</span>
          </div>
          <div className="flex flex-col items-center gap-xs">
            <p className="font-display text-[15px] font-bold text-tertiary">LogiFinance</p>
            <p className="text-data-mono-sm text-secondary animate-pulse">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar fleetSize={kpis?.fleet_size ?? 0} />
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
        <Topbar periodLabel={kpis?.period_label || monthLabel} />
        <main className="flex-1 overflow-y-auto p-gutter md:p-margin">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-margin">{children}</div>
        </main>
      </div>
    </div>
  );
}
