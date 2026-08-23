"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/components/admin/actions";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projetos" },
  { href: "/admin/settings", label: "Configurações" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClassName(active: boolean): string {
  const base = "flex min-h-11 items-center px-1 text-sm";
  if (active) {
    return `${base} text-accent border-b-2 border-accent font-medium`;
  }
  return `${base} text-foreground hover:text-accent`;
}

export function AdminNav() {
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

  // /admin/login vive sob o mesmo layout compartilhado (sem route group
  // separado, ver ADR-0006), mas não deve exibir a nav autenticada.
  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <header className="border-border bg-background border-b">
      <div className="flex h-14 items-center px-4 md:h-16 md:px-8">
        <span className="text-sm font-medium">Admin</span>

        <nav
          aria-label="Navegação administrativa"
          className="ml-6 hidden items-center gap-6 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={navItemClassName(active)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls={menuId}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="focus-visible:ring-accent ml-auto flex h-11 w-11 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 md:hidden"
        >
          <span className="sr-only">
            {mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          </span>
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

        <form action={signOutAction} className="border-border ml-4 hidden border-l pl-4 md:block">
          <SignOutButton />
        </form>
      </div>

      {mobileMenuOpen && (
        <nav
          id={menuId}
          aria-label="Navegação administrativa"
          className="border-border flex flex-col border-t px-4 pb-2 md:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center py-3 text-sm ${
                  active ? "text-accent font-medium" : "text-foreground"
                }`}
              >
                {item.label}
                {active && <span className="sr-only"> (página atual)</span>}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="border-border block border-t px-4 py-2 md:hidden">
        <form action={signOutAction}>
          <SignOutButton />
        </form>
      </div>
    </header>
  );
}

function SignOutButton() {
  return (
    <button
      type="submit"
      className="focus-visible:ring-accent text-foreground hover:text-accent flex min-h-11 items-center rounded-md text-sm focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      Sair
    </button>
  );
}
