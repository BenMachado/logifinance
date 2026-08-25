import Link from "next/link";
import { projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="pt-32 pb-24">
        <div className="site-shell text-center">
          <h1 className="text-4xl font-bold font-heading">Projeto não encontrado</h1>
          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center justify-center border border-[#333] px-8 text-sm font-medium uppercase tracking-widest text-white hover:bg-white/5 transition-colors"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = projects.findIndex((p) => p.id === id);
  const prev = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const next = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div className="pt-32 pb-24">
      <div className="site-shell">
        <nav className="flex items-center gap-2 text-sm text-[#666]">
          <Link href="/" className="hover:text-white transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-white">{project.titleTop.replace("\n", " ")} {project.titleMasked.replace("\n", " ")}</span>
        </nav>

        <div className="mt-8 rounded-2xl overflow-hidden border border-[#222]">
          <div
            className="h-[300px] md:h-[500px] bg-cover bg-center"
            style={{ backgroundImage: `url(${project.image})` }}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <span className="inline-flex items-center rounded-full border border-[#333] px-4 py-1.5 text-xs text-[#aaa] font-mono uppercase tracking-widest">
            {project.year}
          </span>
          <span className="inline-flex items-center rounded-full border border-[#333] px-4 py-1.5 text-xs text-[#aaa] font-mono uppercase tracking-widest">
            {project.location}
          </span>
        </div>

        <div className="mt-8 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">
            {project.titleTop.replace("\n", " ")}{" "}
            <span className="text-[hsl(217,91%,60%)]">
              {project.titleMasked.replace("\n", " ")}
            </span>
          </h1>
          <p className="mt-6 text-lg text-[#aaa] leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {prev && (
            <Link
              href={`/project/${prev.id}`}
              className="rounded-2xl border border-[#222] p-6 hover:border-[#444] transition-colors"
            >
              <p className="text-xs text-[#666] font-mono uppercase tracking-widest">Anterior</p>
              <p className="mt-2 font-bold font-heading">
                {prev.titleTop.replace("\n", " ")} {prev.titleMasked.replace("\n", " ")}
              </p>
            </Link>
          )}
          {next && (
            <Link
              href={`/project/${next.id}`}
              className="rounded-2xl border border-[#222] p-6 hover:border-[#444] transition-colors md:text-right"
            >
              <p className="text-xs text-[#666] font-mono uppercase tracking-widest">Próximo</p>
              <p className="mt-2 font-bold font-heading">
                {next.titleTop.replace("\n", " ")} {next.titleMasked.replace("\n", " ")}
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
