"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { project } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations/project";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createProject(input: CreateProjectInput): Promise<ActionResult> {
  await requireAdminSession();

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await db.query.project.findFirst({
    where: eq(project.slug, parsed.data.slug),
  });
  if (existing) {
    return { success: false, error: "Já existe um projeto com esse slug." };
  }

  await db.insert(project).values({
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
  });

  revalidatePath("/admin/projects");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.query.project.findFirst({ where: eq(project.id, projectId) });

  await db.delete(project).where(eq(project.id, projectId));

  revalidatePath("/admin/projects");
  revalidatePath("/");
  if (existing) revalidatePath(`/projetos/${existing.slug}`);
  return { success: true };
}
