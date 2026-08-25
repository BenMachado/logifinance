export interface Project {
  id: string;
  titleTop: string;
  titleMasked: string;
  image: string;
  year: string;
  location: string;
  description: string;
}

export const imageAt = (url: string, width: number): string => {
  if (url.includes("w=")) {
    return url.replace(/w=\d+/, `w=${width}`);
  }
  return `${url}?w=${width}`;
};

export const maskImage = (url: string): string =>
  `${imageAt(url, 600)}&blur=60&bri=25&sat=30`;

export const projects: Project[] = [
  {
    id: "conciliacao-de-fretes",
    titleTop: "Receita\npor viagem",
    titleMasked: "Conciliação\nde fretes.",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=80",
    year: "Financeiro",
    location: "Contas a receber",
    description:
      "O LogiFinance cruza o conhecimento de transporte com o que foi efetivamente pago pelo embarcador. Diferenças de frete-peso, pedágio e ad valorem aparecem em uma fila de conciliação, com o CT-e ao lado do lançamento bancário, para a transportadora cobrar a diferença antes de ela virar prejuízo.",
  },
  {
    id: "custo-por-quilometro",
    titleTop: "Quanto\ncusta rodar",
    titleMasked: "Custo por\nquilômetro.",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1600&q=80",
    year: "Controladoria",
    location: "Custos",
    description:
      "Combustível, pneus, manutenção, motorista, seguro e depreciação somados por veículo e divididos pela quilometragem rodada. O painel mostra o custo por km de cada placa e o compara com a média da frota, de modo que o caminhão que está saindo do padrão fica visível na primeira tela.",
  },
  {
    id: "contas-a-pagar",
    titleTop: "Fluxo de\ncaixa real",
    titleMasked: "Contas\na pagar.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80",
    year: "Financeiro",
    location: "Tesouraria",
    description:
      "Combustível em posto conveniado, parcelas de financiamento, arla, oficina e taxas de rodovia entram em uma única agenda de pagamentos. O sistema projeta o saldo dia a dia, para a transportadora saber com antecedência em qual semana a folha e a parcela do implemento caem juntas.",
  },
  {
    id: "manutencao-da-frota",
    titleTop: "Preventiva\nna hora",
    titleMasked: "Manutenção\nda frota.",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1600&q=80",
    year: "Operação",
    location: "Oficina",
    description:
      "Ordens de serviço com peças, mão de obra e tempo de veículo parado, ligadas ao custo do ativo. As revisões preventivas são disparadas por quilometragem, e o histórico de cada placa mostra quanto já foi gasto para sustentar aquele caminhão em operação.",
  },
  {
    id: "adiantamento-de-motorista",
    titleTop: "Dinheiro\nna estrada",
    titleMasked: "Adiantamento\nde motorista.",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1600&q=80",
    year: "Operação",
    location: "Viagens",
    description:
      "Adiantamento de despesa de viagem lançado por viagem e prestado por comprovante. O acerto do motorista fecha com o que foi gasto em diesel, refeição e pedágio, e o que sobra volta para o caixa em vez de ficar aberto por semanas.",
  },
  {
    id: "impostos-e-cte",
    titleTop: "Nota fiscal\nsem retrabalho",
    titleMasked: "Impostos\ne CT-e.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80",
    year: "Fiscal",
    location: "Obrigações",
    description:
      "ICMS por estado, PIS, COFINS e o regime tributário da transportadora calculados sobre os documentos de transporte já emitidos. Os relatórios saem no formato que a contabilidade pede, o que reduz a ida e volta de planilha no fechamento do mês.",
  },
  {
    id: "margem-por-cliente",
    titleTop: "Quem dá\nlucro",
    titleMasked: "Margem\npor cliente.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80",
    year: "Gestão",
    location: "Comercial",
    description:
      "Receita de frete menos custo direto da viagem, por embarcador e por rota. Fica claro qual cliente paga bem no papel mas consome tempo de espera para carregar, e qual tabela precisa ser renegociada na próxima revisão de contrato.",
  },
  {
    id: "rotas-e-ociosidade",
    titleTop: "Retorno\nvazio",
    titleMasked: "Rotas e\nociosidade.",
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1600&q=80",
    year: "Operação",
    location: "Planejamento",
    description:
      "O sistema mede quantos quilômetros da frota foram rodados sem carga e quanto isso custou no período. Com o custo por km ao lado, a transportadora consegue justificar um frete de retorno mais baixo em vez de trazer o cavalo vazio.",
  },
  {
    id: "indicadores-do-negocio",
    titleTop: "Uma tela\npara decidir",
    titleMasked: "Indicadores\ndo negócio.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80",
    year: "Gestão",
    location: "Diretoria",
    description:
      "Faturamento, inadimplência, custo por km, ocupação da frota e caixa projetado em um painel só. É a leitura que o dono da transportadora faz de manhã antes de decidir se compra mais um caminhão ou renegocia uma tabela.",
  },
];
