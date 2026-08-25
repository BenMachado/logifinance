import { Truck, ReceiptText, Wrench, Route } from "lucide-react";

const modules = [
  {
    icon: Truck,
    title: "Fretes e recebíveis",
    body:
      "Conhecimentos de transporte, tabelas por rota e conciliação do que o embarcador realmente pagou. A diferença de frete aparece antes do fechamento.",
  },
  {
    icon: ReceiptText,
    title: "Notas e faturamento",
    body:
      "Emissão e controle de CT-e e faturas, com ICMS por estado e relatórios no formato que a contabilidade pede no fim do mês.",
  },
  {
    icon: Wrench,
    title: "Manutenção e oficina",
    body:
      "Ordens de serviço com peças, mão de obra e veículo parado. Preventivas por quilometragem e histórico de custo de cada placa.",
  },
  {
    icon: Route,
    title: "Rotas e custo por km",
    body:
      "Diesel, pneus, motorista e depreciação divididos pela quilometragem rodada, com o retorno vazio medido em reais.",
  },
];

export function ModulesSection() {
  return (
    <section className="border-b border-[#222] bg-black text-white">
      <div className="site-shell py-20 md:py-28">
        <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl font-heading">
          Tudo que a transportadora precisa controlar, em um só lugar
        </h2>
        <p className="mt-4 max-w-2xl text-[#aaa] leading-relaxed">
          Cada módulo funciona sozinho e todos conversam entre si: o custo da
          oficina chega ao custo por quilômetro, e o frete faturado chega ao
          fluxo de caixa sem digitação dupla.
        </p>

        <ul className="mt-14 grid grid-cols-1 gap-px bg-[#222] sm:grid-cols-2 lg:grid-cols-4">
          {modules.map(({ icon: Icon, title, body }) => (
            <li key={title} className="bg-black p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[hsl(226,71%,40%)]/15 text-[hsl(217,91%,60%)]">
                <Icon size={24} aria-hidden />
              </span>
              <h3 className="mt-6 text-lg font-bold tracking-tight font-heading">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#aaa]">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
