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

        <div className="mt-20 rounded-2xl border border-[#222] overflow-hidden">
          <div
            className="h-[300px] md:h-[400px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=80)",
            }}
          />
          <div className="p-8 md:p-12 bg-[#0a0a0a]">
            <p className="text-sm text-[#666] font-mono uppercase tracking-widest">Transportadoras no Brasil</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight font-heading">
              Mais de 1 milhão de empresas operam com frota própria ou terceirizada.
            </h3>
            <p className="mt-4 text-[#aaa] leading-relaxed max-w-2xl">
              O LogiFinance nasceu para atender esse mercado com uma ferramenta
              que entende a realidade do operador: pedágio, diesel, motorista
              autônomo, retorno vazio e prazo de pagamento do embarcador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
