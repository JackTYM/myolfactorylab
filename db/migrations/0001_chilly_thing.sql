CREATE INDEX "combos_user_id_idx" ON "combos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notes_user_id_idx" ON "notes" USING btree ("user_id");