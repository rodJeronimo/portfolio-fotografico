"use client";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Algo deu errado</h1>
      <p className="text-muted max-w-md text-sm">
        Não foi possível carregar esta página. Tente novamente em instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-accent text-accent-foreground rounded-md px-4 py-2 text-sm font-medium"
      >
        Tentar novamente
      </button>
    </main>
  );
}
