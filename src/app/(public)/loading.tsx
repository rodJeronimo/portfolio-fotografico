import { GridSkeleton } from "@/components/gallery/grid-skeleton";

export default function PublicLoading() {
  return (
    <main>
      <div className="px-4 py-16 text-center sm:px-8">
        <div className="bg-surface mx-auto h-9 w-64 animate-pulse rounded-md" />
      </div>
      <GridSkeleton />
    </main>
  );
}
