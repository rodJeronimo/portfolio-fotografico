import { auth } from "@/lib/auth";

/**
 * Defesa em profundidade: Server Actions podem ser invocadas diretamente
 * (não só via UI protegida pelo middleware), então cada uma revalida a
 * sessão por conta própria antes de qualquer efeito colateral.
 */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Não autenticado.");
  }
  return session;
}
