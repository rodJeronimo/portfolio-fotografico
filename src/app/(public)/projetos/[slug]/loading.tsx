import { GridSkeleton } from "@/components/gallery/grid-skeleton";

export default function ProjectLoading() {
  return (
    <main>
      <div className="px-4 pt-6 sm:px-8">
        <div className="bg-surface h-4 w-32 animate-pulse rounded" />
      </div>
      <div className="px-4 pt-4 sm:px-8">
        <div className="bg-surface h-8 w-56 animate-pulse rounded-md" />
      </div>
      <GridSkeleton />
    </main>
  );
}
