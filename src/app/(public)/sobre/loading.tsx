export default function AboutLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <div className="bg-surface h-8 w-40 animate-pulse rounded-md" />
      <div className="mt-6 flex flex-col gap-2">
        <div className="bg-surface h-4 w-full animate-pulse rounded" />
        <div className="bg-surface h-4 w-full animate-pulse rounded" />
        <div className="bg-surface h-4 w-2/3 animate-pulse rounded" />
      </div>
    </main>
  );
}
