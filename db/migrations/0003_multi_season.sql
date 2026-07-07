ALTER TABLE "combos" ALTER COLUMN "season" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "combos" ALTER COLUMN "season" SET DATA TYPE jsonb USING (
  CASE "season"
    WHEN 'Spring/Summer' THEN '["Spring","Summer"]'
    WHEN 'Fall/Winter'   THEN '["Fall","Winter"]'
    WHEN 'Year-Round'    THEN '["Year-Round"]'
    ELSE '[]'
  END::jsonb
);--> statement-breakpoint
ALTER TABLE "combos" ALTER COLUMN "season" SET DEFAULT '[]'::jsonb;
