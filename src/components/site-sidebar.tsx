"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

// "Início" também fica ativo em /projetos/*, já que projeto é
// hierarquicamente parte do índice da Home (docs/design/public-site-redesign.md §4.3).
function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/projetos");
  }
  return pathname === href;
}

function desktopNavItemClassName(active: boolean): string {
  const base = "block py-2 text-xs font-medium uppercase tracking-[0.14em]";
  if (active) {
    return `${base} text-accent underline underline-offset-4`;
  }
  return `${base} text-foreground hover:text-accent`;
}

function mobileNavItemClassName(active: boolean): string {
  const base = "flex min-h-11 items-center py-3 text-xs font-medium uppercase tracking-[0.14em]";
  if (active) {
    return `${base} text-accent underline underline-offset-4`;
  }
  return `${base} text-foreground hover:text-accent`;
}

export function SiteSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuId = useId();

  // Fecha o menu mobile ao navegar (troca de pathname).
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fecha o menu mobile ao pressionar Esc.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="border-border bg-background border-b lg:h-dvh lg:w-[17rem] lg:shrink-0 lg:border-r lg:border-b-0 lg:sticky lg:top-0">
      {/* Barra superior — apenas < lg (docs/design/public-site-redesign.md §4.4). */}
      <div className="flex h-14 items-center justify-between px-4 md:h-16 lg:hidden">
        <Link href="/" className="flex h-11 items-center text-base text-foreground">
          <span className="font-bold tracking-tight">Rodrigo</span>{" "}
          <span className="font-normal text-muted">Jerônimo</span>
        </Link>

        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls={menuId}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="focus-visible:ring-accent flex h-11 w-11 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <span className="sr-only">{mobileMenuOpen ? "Fechar menu" : "Abrir menu"}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileMenuOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Menu mobile — empurra o conteúdo abaixo, não é overlay; sem focus trap. */}
      {mobileMenuOpen && (
        <nav
          id={menuId}
          aria-label="Navegação principal"
          className="border-border flex flex-col border-t px-4 pb-2 lg:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={mobileNavItemClassName(active)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Sidebar fixa — apenas >= lg (docs/design/public-site-redesign.md §4.1). */}
      <div className="hidden h-full flex-col p-6 lg:flex lg:p-8">
        <Link href="/" className="block">
          <span className="block text-2xl font-bold tracking-tight text-foreground">
            Rodrigo
          </span>
          <span className="text-muted mt-0.5 block text-lg font-normal">
            Jerônimo · Fotógrafo
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="mt-8 flex flex-col gap-1 lg:mt-10">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={desktopNavItemClassName(active)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
