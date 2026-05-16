import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "artist_profile" ADD COLUMN "about_background_image_id" integer;
  ALTER TABLE "artist_profile" ADD CONSTRAINT "artist_profile_about_background_image_id_media_id_fk" FOREIGN KEY ("about_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "artist_profile_about_background_image_idx" ON "artist_profile" USING btree ("about_background_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "artist_profile" DROP CONSTRAINT "artist_profile_about_background_image_id_media_id_fk";
  
  DROP INDEX "artist_profile_about_background_image_idx";
  ALTER TABLE "artist_profile" DROP COLUMN "about_background_image_id";`)
}
