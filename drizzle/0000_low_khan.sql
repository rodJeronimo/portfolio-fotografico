CREATE TABLE "photo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"description" text,
	"capture_date" date,
	"location" text,
	"exif_json" jsonb,
	"storage_key" text NOT NULL,
	"blur_data_url" text,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cover_photo_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_photo" (
	"project_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_photo_project_id_photo_id_pk" PRIMARY KEY("project_id","photo_id")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"locale" text DEFAULT 'pt-BR' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_locale_pk" PRIMARY KEY("key","locale")
);
--> statement-breakpoint
ALTER TABLE "project_photo" ADD CONSTRAINT "project_photo_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_photo" ADD CONSTRAINT "project_photo_photo_id_photo_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "photo_storage_key_idx" ON "photo" USING btree ("storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "project_slug_idx" ON "project" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "project_photo_order_idx" ON "project_photo" USING btree ("project_id","display_order");