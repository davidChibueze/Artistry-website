import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "releases_streaming_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "releases_streaming_links" CASCADE;
  ALTER TABLE "releases" ALTER COLUMN "cover_image_id" DROP NOT NULL;
  ALTER TABLE "artist_profile" ADD COLUMN "social_links_stream_url" varchar;
  ALTER TABLE "releases" ADD COLUMN "stream_url" varchar;
  DROP TYPE "public"."enum_releases_streaming_links_platform";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_releases_streaming_links_platform" AS ENUM('Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Tidal', 'Deezer', 'SoundCloud');
  CREATE TABLE "releases_streaming_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_releases_streaming_links_platform",
  	"url" varchar
  );
  
  ALTER TABLE "releases" ALTER COLUMN "cover_image_id" SET NOT NULL;
  ALTER TABLE "releases_streaming_links" ADD CONSTRAINT "releases_streaming_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "releases_streaming_links_order_idx" ON "releases_streaming_links" USING btree ("_order");
  CREATE INDEX "releases_streaming_links_parent_id_idx" ON "releases_streaming_links" USING btree ("_parent_id");
  ALTER TABLE "artist_profile" DROP COLUMN "social_links_stream_url";
  ALTER TABLE "releases" DROP COLUMN "stream_url";`)
}
