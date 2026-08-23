"use server";

import { signOut } from "@/lib/auth";

// Ação de logout usada pelo AdminNav (client component) — mesmo padrão de
// signIn em admin/login/page.tsx, extraída para um módulo "use server"
// separado porque diretivas de servidor inline não são permitidas em
// componentes client.
export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
