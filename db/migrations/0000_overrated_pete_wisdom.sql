CREATE TABLE "combos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT (auth.user_id()) NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"layers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"season" text DEFAULT 'Spring/Summer' NOT NULL,
	"high_heat" boolean DEFAULT false NOT NULL,
	"vibe" text DEFAULT '' NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"rating" integer DEFAULT 0 NOT NULL,
	"longevity" integer DEFAULT 0 NOT NULL,
	"projection" integer DEFAULT 0 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photo_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "combos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "layers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT (auth.user_id()) NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"short_label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "layers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT (auth.user_id()) NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"updated_on" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "scents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT (auth.user_id()) NOT NULL,
	"name" text NOT NULL,
	"layers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vibes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT (auth.user_id()) NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"logic" text DEFAULT '' NOT NULL,
	"weight" text DEFAULT '' NOT NULL,
	"secret_word" text DEFAULT '' NOT NULL,
	"secret_text" text DEFAULT '' NOT NULL,
	"best_for" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vibes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wish_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT (auth.user_id()) NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wish_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text DEFAULT (auth.user_id()) NOT NULL,
	"category" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wishlist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "layers_user_key_uq" ON "layers" USING btree ("user_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "scents_user_name_uq" ON "scents" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "vibes_user_name_uq" ON "vibes" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "wish_categories_user_name_uq" ON "wish_categories" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_user_category_uq" ON "wishlist" USING btree ("user_id","category");--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "combos" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "combos"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "combos" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "combos"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "combos" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "combos"."user_id")) WITH CHECK ((select auth.user_id() = "combos"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "combos" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "combos"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "layers" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "layers"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "layers" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "layers"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "layers" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "layers"."user_id")) WITH CHECK ((select auth.user_id() = "layers"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "layers" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "layers"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "notes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "notes"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "notes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "notes"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "notes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "notes"."user_id")) WITH CHECK ((select auth.user_id() = "notes"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "notes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "notes"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "scents" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "scents"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "scents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "scents"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "scents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "scents"."user_id")) WITH CHECK ((select auth.user_id() = "scents"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "scents" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "scents"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "vibes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "vibes"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "vibes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "vibes"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "vibes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "vibes"."user_id")) WITH CHECK ((select auth.user_id() = "vibes"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "vibes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "vibes"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "wish_categories" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "wish_categories"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "wish_categories" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "wish_categories"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "wish_categories" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "wish_categories"."user_id")) WITH CHECK ((select auth.user_id() = "wish_categories"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "wish_categories" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "wish_categories"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "wishlist" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.user_id() = "wishlist"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "wishlist" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.user_id() = "wishlist"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "wishlist" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.user_id() = "wishlist"."user_id")) WITH CHECK ((select auth.user_id() = "wishlist"."user_id"));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "wishlist" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.user_id() = "wishlist"."user_id"));