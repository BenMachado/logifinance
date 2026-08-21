export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-margin">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-level-1 rounded p-md h-32 bg-surfaceContainer-low" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-margin">
        <div className="lg:col-span-8 card-level-1 rounded h-96 bg-surfaceContainer-low" />
        <div className="lg:col-span-4 card-level-1 rounded h-96 bg-surfaceContainer-low" />
      </div>
    </div>
  );
}
