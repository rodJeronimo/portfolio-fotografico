import Link from "next/link";

export default function PublicNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
      <p className="text-muted max-w-md text-sm">
        O conteúdo que você procura não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="bg-accent text-accent-foreground rounded-md px-4 py-2 text-sm font-medium"
      >
        Voltar para a Home
      </Link>
    </main>
  );
}
