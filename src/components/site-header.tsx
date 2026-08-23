import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex max-w-5xl items-center px-4 py-4 sm:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Portfólio Fotográfico
        </Link>
      </div>
    </header>
  );
}
