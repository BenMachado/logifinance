export default function Loading() {
  return (
    <section className="flex flex-col gap-margin">
      <div className="h-9 w-40 bg-surfaceContainer-low rounded animate-pulse" />
      <div className="card-level-1 rounded h-72 animate-pulse" />
    </section>
  );
}