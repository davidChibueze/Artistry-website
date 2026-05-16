import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "hero_release_id" integer;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_hero_release_id_releases_id_fk" FOREIGN KEY ("hero_release_id") REFERENCES "public"."releases"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_hero_release_idx" ON "site_settings" USING btree ("hero_release_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_hero_release_id_releases_id_fk";
  
  DROP INDEX "site_settings_hero_release_idx";
  ALTER TABLE "site_settings" DROP COLUMN "hero_release_id";`)
}
