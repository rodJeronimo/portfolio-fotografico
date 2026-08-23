/**
 * Pure resolution logic for the Home's featured project (ADR-0007). Deliberately kept
 * free of any db/env import so it can be unit-tested without a database or runtime env
 * vars (same pattern as `src/lib/validations/**`) — the db-aware wiring lives in
 * `src/lib/home/featured-project.ts`.
 */

/** `site_settings.key` used to store the admin-configured Home featured project. */
export const FEATURED_PROJECT_SETTING_KEY = "home.featuredProjectId";

/**
 * Decides which project id should be featured on the Home, given the admin-configured
 * override and the list of projects already available (callers pass the fallback-ordered
 * list — first by `displayOrder` — so `projects[0]` is "the automatic behavior").
 *
 * Never throws. If `configuredProjectId` is set but does not match any project in
 * `projects` (e.g. the project was deleted after being marked as featured), or is
 * absent/null/empty, falls back to `projects[0]`. Returns `null` only when there are no
 * projects at all.
 */
export function resolveFeaturedProjectId(
  configuredProjectId: string | null | undefined,
  projects: readonly { id: string }[],
): string | null {
  if (configuredProjectId && projects.some((p) => p.id === configuredProjectId)) {
    return configuredProjectId;
  }
  return projects[0]?.id ?? null;
}

/** Parses the raw jsonb `value` of the `home.featuredProjectId` site setting. */
export function parseFeaturedProjectSettingValue(value: unknown): string | null {
  if (value && typeof value === "object" && "projectId" in value) {
    const projectId = (value as { projectId: unknown }).projectId;
    return typeof projectId === "string" ? projectId : null;
  }
  return null;
}
