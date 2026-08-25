import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "R$ 600",
    period: "/mês",
    description: "Para transportadoras com até 15 caminhões",
    features: [
      "Até 15 veículos na frota",
      "Controle completo de custos por veículo",
      "Leitura inteligente de recibos",
      "Dashboard financeiro completo",
      "Alertas automáticos de margem",
      "Exportação de relatórios",
      "Suporte por email",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "R$ 900",
    period: "/mês",
    description: "Para frotas com mais de 15 caminhões",
    features: [
      "Veículos ilimitados na frota",
      "Tudo do plano Starter",
      "Relatórios avançados",
      "Manutenção preventiva integrada",
      "Fluxo de caixa projetado",
      "Suporte prioritário",
      "Acesso a novos recursos",
    ],
    highlighted: true,
  },
];

export default function PrecosPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="site-shell">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-sm uppercase tracking-widest text-[hsl(217,91%,60%)] font-semibold">
            Preços
          </p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight font-heading">
            Planos para cada tamanho de frota
          </h1>
          <p className="mt-4 text-lg text-[#aaa] leading-relaxed">
            Teste grátis por 30 dias. Pagamento via PIX (sem taxas) ou cartão de crédito.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? "border-[hsl(226,71%,40%)] bg-[hsl(226,71%,40%)]/5"
                  : "border-[#222] bg-[#0a0a0a]"
              }`}
            >
              <h3 className="text-lg font-bold font-heading">{plan.name}</h3>
              <p className="mt-1 text-sm text-[#666]">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold font-heading">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-[#666]">{plan.period}</span>
                )}
              </div>
              <ul className="mt-8 flex flex-col gap-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[#aaa]">
                    <span className="mt-0.5 text-[hsl(217,91%,60%)]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 h-12 flex items-center justify-center rounded-lg text-sm font-medium uppercase tracking-widest transition-colors ${
                  plan.highlighted
                    ? "bg-[hsl(226,71%,40%)] text-white hover:bg-[hsl(217,91%,60%)]"
                    : "border border-[#333] text-white hover:bg-white/5"
                }`}
              >
                Começar grátis
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[#666]">
            Pagamento via Stripe. PIX sem taxas. Cartão: 3,99% + R$ 0,39 por transação.
          </p>
        </div>
      </div>
    </div>
  );
}
