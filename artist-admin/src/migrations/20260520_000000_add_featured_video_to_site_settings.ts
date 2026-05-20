import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "featured_video_id" varchar,
      ADD COLUMN IF NOT EXISTS "featured_video_title" varchar;

    UPDATE "site_settings"
    SET
      "featured_video_id"    = 'VBStMoVYZS4',
      "featured_video_title" = 'Poshbugati — Outsiders (Official Video)'
    WHERE "featured_video_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "featured_video_id",
      DROP COLUMN IF EXISTS "featured_video_title";
  `)
}
