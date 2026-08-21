export default function ConfiguracoesLoading() {
  return (
    <section className="flex flex-col gap-margin animate-pulse">
      <div className="h-8 w-48 bg-surfaceContainer rounded" />
      <div className="card-level-1 rounded p-md h-48 bg-surfaceContainer-low" />
      <div className="card-level-1 rounded p-md h-32 bg-surfaceContainer-low" />
    </section>
  );
}
