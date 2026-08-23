import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { photo, projectPhoto, siteSettings } from "@/db/schema";
import {
  FEATURED_PROJECT_SETTING_KEY,
  parseFeaturedProjectSettingValue,
  resolveFeaturedProjectId,
} from "@/lib/home/resolve-featured-project";

export { FEATURED_PROJECT_SETTING_KEY, parseFeaturedProjectSettingValue, resolveFeaturedProjectId };

export interface ProjectCover {
  storageKey: string;
  blurDataUrl: string | null;
  width: number;
  height: number;
}

export interface ProjectWithCover {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover: ProjectCover | null;
}

async function resolveCover(p: { id: string; coverPhotoId: string | null }): Promise<ProjectCover | null> {
  if (p.coverPhotoId) {
    const coverPhoto = await db.query.photo.findFirst({ where: eq(photo.id, p.coverPhotoId) });
    return coverPhoto
      ? {
          storageKey: coverPhoto.storageKey,
          blurDataUrl: coverPhoto.blurDataUrl,
          width: coverPhoto.width,
          height: coverPhoto.height,
        }
      : null;
  }

  const [firstPhoto] = await db
    .select({
      storageKey: photo.storageKey,
      blurDataUrl: photo.blurDataUrl,
      width: photo.width,
      height: photo.height,
    })
    .from(projectPhoto)
    .innerJoin(photo, eq(projectPhoto.photoId, photo.id))
    .where(eq(projectPhoto.projectId, p.id))
    .orderBy(asc(projectPhoto.displayOrder))
    .limit(1);

  return firstPhoto ?? null;
}

/**
 * Lists every project ordered by `displayOrder` (the same fallback order used by the
 * public Home grid), each with its resolved cover photo. Single source of truth for
 * "which cover represents a project" — reused by the Home grid, `getFeaturedProject()`,
 * and the admin preview (TASK-0020) to avoid duplicating the query/fallback logic.
 */
export async function listProjectsWithCover(): Promise<ProjectWithCover[]> {
  const projects = await db.query.project.findMany({
    orderBy: (p, { asc: ascOrder }) => [ascOrder(p.displayOrder), ascOrder(p.createdAt)],
  });

  return Promise.all(
    projects.map(async (p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      cover: await resolveCover(p),
    })),
  );
}

/** Reads the raw admin-configured featured project id from `site_settings`, if any. */
export async function getConfiguredFeaturedProjectId(): Promise<string | null> {
  const setting = await db.query.siteSettings.findFirst({
    where: and(eq(siteSettings.key, FEATURED_PROJECT_SETTING_KEY), eq(siteSettings.locale, "pt-BR")),
  });
  return parseFeaturedProjectSettingValue(setting?.value);
}

/**
 * Resolves the project that should be featured on the Home: the admin-configured
 * override if it still points to an existing project, otherwise the automatic fallback
 * (first project by `displayOrder`). Never throws — returns `null` only when there are
 * no projects at all, which callers should treat as "nothing to feature", not an error.
 */
export async function getFeaturedProject(): Promise<ProjectWithCover | null> {
  const [configuredProjectId, projects] = await Promise.all([
    getConfiguredFeaturedProjectId(),
    listProjectsWithCover(),
  ]);

  const featuredId = resolveFeaturedProjectId(configuredProjectId, projects);
  return projects.find((p) => p.id === featuredId) ?? null;
}
