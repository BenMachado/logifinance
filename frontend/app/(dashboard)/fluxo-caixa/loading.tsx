export default function FluxoCaixaLoading() {
  return (
    <div className="animate-pulse space-y-md">
      <div className="h-9 w-40 bg-white/5 rounded-xl border border-white/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-level-1 rounded-2xl p-md h-24 bg-white/5 border border-white/10" />
        ))}
      </div>
      <div className="card-level-1 rounded-2xl p-md h-64 bg-white/5 border border-white/10" />
    </div>
  );
}
