export default function SobrePage() {
  return (
    <div className="pt-32 pb-24">
      <div className="site-shell">
        <p className="font-mono text-sm uppercase tracking-widest text-[hsl(217,91%,60%)] font-semibold">
          Sobre
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight font-heading">
          LogiFinance
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#aaa] leading-relaxed">
          Gestão financeira e operacional feita para transportadoras brasileiras.
          Controle fretes, custo por quilômetro, manutenção da frota e fluxo de
          caixa em um só sistema.
        </p>

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-heading">Nossa missão</h2>
            <p className="mt-4 text-[#aaa] leading-relaxed">
              Cada rota mostra receita, custo real e se a margem ficou abaixo do
              que a empresa espera. Alerta na hora, não no fechamento. O
              LogiFinance foi pensado para o dono de transportadora que quer ver
              os números sem depender de planilha.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-heading">Por que existe</h2>
            <p className="mt-4 text-[#aaa] leading-relaxed">
              A maioria das transportadoras ainda gerencia finanças em planilhas
              espalhadas ou sistemas genéricos que não entendem a operação de
              frete. O LogiFinance resolve isso com módulos que conversam entre
              si: o custo da oficina chega ao custo por quilômetro, e o frete
              faturado chega ao fluxo de caixa sem digitação dupla.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
