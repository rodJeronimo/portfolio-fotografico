export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-8 lg:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="bg-surface border-border aspect-[4/3] animate-pulse rounded-md border" />
      ))}
    </ul>
  );
}
