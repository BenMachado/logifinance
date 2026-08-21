export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "OPERAÇÃO",
    items: [
      { href: "/dashboard", label: "Visão Geral", icon: "dashboard" },
      { href: "/frota/veiculos", label: "Veículos", icon: "local_shipping" },
      { href: "/frota/motoristas", label: "Motoristas", icon: "person" },
      { href: "/viagens", label: "Viagens", icon: "route" },
    ],
  },
  {
    label: "FINANCEIRO",
    items: [
      { href: "/fluxo-caixa", label: "Custos", icon: "account_balance" },
      { href: "/recibos", label: "Recibos", icon: "document_scanner" },
      { href: "/manutencao", label: "Manutenção", icon: "build" },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { href: "/notificacoes", label: "Notificações", icon: "notifications" },
      { href: "/configuracoes", label: "Configurações", icon: "settings" },
    ],
  },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Visão Geral",
  "/frota/veiculos": "Veículos",
  "/frota/motoristas": "Motoristas",
  "/viagens": "Viagens",
  "/recibos": "Recibos",
  "/manutencao": "Manutenção",
  "/fluxo-caixa": "Fluxo de Caixa",
  "/configuracoes": "Configurações",
  "/notificacoes": "Notificações",
};

export function titleFromPath(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES).find((key) => key !== "/dashboard" && pathname.startsWith(key));
  return match ? PAGE_TITLES[match] : "Visão Geral";
}
