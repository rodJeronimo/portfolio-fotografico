// Fonte de verdade do schema. Ver docs/architecture/data-model.md para o modelo relacional completo.

import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  jsonb,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const project = pgTable(
  "project",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    coverPhotoId: uuid("cover_photo_id"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("project_slug_idx").on(table.slug)],
);

export const photo = pgTable(
  "photo",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title"),
    description: text("description"),
    captureDate: date("capture_date"),
    location: text("location"),
    exifJson: jsonb("exif_json"),
    storageKey: text("storage_key").notNull(),
    blurDataUrl: text("blur_data_url"),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("photo_storage_key_idx").on(table.storageKey)],
);

export const projectPhoto = pgTable(
  "project_photo",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photo.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.photoId] }),
    index("project_photo_order_idx").on(table.projectId, table.displayOrder),
  ],
);

export const siteSettings = pgTable(
  "site_settings",
  {
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    locale: text("locale").notNull().default("pt-BR"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.key, table.locale] })],
);
