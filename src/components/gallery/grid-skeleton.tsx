export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-3 sm:gap-8 sm:px-8 lg:grid-cols-4 lg:gap-10"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="bg-surface aspect-[4/3] animate-pulse rounded-none" />
      ))}
    </ul>
  );
}
