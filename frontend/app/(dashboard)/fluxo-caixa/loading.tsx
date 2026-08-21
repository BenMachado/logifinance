export default function FluxoCaixaLoading() {
  return (
    <section className="flex flex-col gap-margin animate-pulse">
      <div className="h-8 w-48 bg-surfaceContainer rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-level-1 rounded p-md h-24 bg-surfaceContainer-low" />
        ))}
      </div>
      <div className="card-level-1 rounded p-md h-64 bg-surfaceContainer-low" />
    </section>
  );
}
