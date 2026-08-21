export default function ViagensLoading() {
  return (
    <div className="animate-pulse space-y-md">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-surfaceContainer-low rounded" />
        <div className="h-10 w-32 bg-surfaceContainer-low rounded" />
      </div>
      <div className="card-level-1 rounded overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-outline-variant bg-surfaceContainer-low" />
        ))}
      </div>
    </div>
  );
}
