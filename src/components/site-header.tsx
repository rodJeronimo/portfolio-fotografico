import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Portfólio Fotográfico
        </Link>
        <nav aria-label="Navegação principal" className="flex gap-4 text-sm">
          <Link href="/sobre" className="hover:text-accent">
            Sobre
          </Link>
          <Link href="/contato" className="hover:text-accent">
            Contato
          </Link>
        </nav>
      </div>
    </header>
  );
}
