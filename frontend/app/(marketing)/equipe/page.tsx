const team = [
  {
    name: "Carlos Silva",
    role: "CEO & Fundador",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "15 anos no setor de transportes. Antes do LogiFinance, gerenciou uma frota de 200+ caminhões.",
  },
  {
    name: "Ana Santos",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    bio: "Engenheira de software com foco em sistemas financeiros. Ex-\u200BFAANG.",
  },
  {
    name: "Pedro Costa",
    role: "Head de Produto",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    bio: "Product manager com experiência em SaaS B2B. Apaixonado por UX que simplifica o complexo.",
  },
  {
    name: "Mariana Lima",
    role: "Head de Operações",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    bio: "Ex-gestora de logística. Sabe na prática o que o operador precisa ver na tela.",
  },
];

export default function EquipePage() {
  return (
    <div className="pt-32 pb-24">
      <div className="site-shell">
        <p className="font-mono text-sm uppercase tracking-widest text-[hsl(217,91%,60%)] font-semibold">
          Equipe
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight font-heading">
 Quem faz o LogiFinance
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#aaa] leading-relaxed">
          Uma equipe que entende tanto de transportes quanto de tecnologia.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="group">
              <div className="relative overflow-hidden rounded-2xl border border-[#222]">
                <div
                  className="h-[280px] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                  style={{ backgroundImage: `url(${member.image})` }}
                />
              </div>
              <h3 className="mt-4 text-lg font-bold font-heading">{member.name}</h3>
              <p className="text-sm text-[hsl(217,91%,60%)]">{member.role}</p>
              <p className="mt-2 text-sm text-[#aaa] leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
