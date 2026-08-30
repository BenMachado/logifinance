export default function ViagensLoading() {
  return (
    <div className="animate-pulse space-y-md">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-white/5 rounded-xl border border-white/10" />
        <div className="h-10 w-32 bg-white/5 rounded-xl border border-white/10" />
      </div>
      <div className="card-level-1 rounded-2xl overflow-hidden border border-white/10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-white/10 bg-white/5" />
        ))}
      </div>
    </div>
  );
}
