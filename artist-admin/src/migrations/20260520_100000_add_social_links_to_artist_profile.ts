import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "artist_profile"
      ADD COLUMN IF NOT EXISTS "social_links_apple_music" varchar,
      ADD COLUMN IF NOT EXISTS "social_links_twitter"     varchar,
      ADD COLUMN IF NOT EXISTS "social_links_spotify"     varchar;

    UPDATE "artist_profile"
    SET
      "social_links_apple_music" = 'https://music.apple.com/us/artist/poshbugati/1584769972',
      "social_links_twitter"     = 'https://twitter.com/poshbugati',
      "social_links_spotify"     = 'https://open.spotify.com/artist/4pXLT4UxQjOnIF2i9ShM3J'
    WHERE "social_links_apple_music" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "artist_profile"
      DROP COLUMN IF EXISTS "social_links_apple_music",
      DROP COLUMN IF EXISTS "social_links_twitter",
      DROP COLUMN IF EXISTS "social_links_spotify";
  `)
}
