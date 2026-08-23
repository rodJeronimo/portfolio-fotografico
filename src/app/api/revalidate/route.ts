import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";

/**
 * Endpoint interno de revalidação sob demanda — mesmo padrão de um webhook
 * de CMS headless. Usado hoje pela suite e2e (TASK-0012) para invalidar o
 * cache ISR após seedar dados de teste diretamente no banco (bypassando as
 * Server Actions, que já chamam revalidatePath sozinhas em uso real).
 * Protegido com o mesmo AUTH_SECRET do Auth.js (nenhum segredo novo).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.AUTH_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { path?: unknown } | null;
  if (!body || typeof body.path !== "string") {
    return NextResponse.json({ error: "Campo 'path' (string) é obrigatório." }, { status: 400 });
  }

  revalidatePath(body.path);
  return NextResponse.json({ revalidated: true, path: body.path });
}
