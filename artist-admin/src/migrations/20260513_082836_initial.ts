import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_releases_streaming_links_platform" AS ENUM('Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Tidal', 'Deezer', 'SoundCloud');
  CREATE TYPE "public"."enum_releases_distribution_tiers_currency" AS ENUM('USD', 'EUR', 'GBP');
  CREATE TYPE "public"."enum_releases_type" AS ENUM('EP', 'Album', 'Single');
  CREATE TYPE "public"."enum_tour_shows_type" AS ENUM('Headline', 'Festival', 'Support', 'Private');
  CREATE TYPE "public"."enum_blog_posts_category" AS ENUM('Tour', 'Studio', 'Personal', 'News', 'Behind The Scenes', 'Other');
  CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_posts_v_version_category" AS ENUM('Tour', 'Studio', 'Personal', 'News', 'Behind The Scenes', 'Other');
  CREATE TYPE "public"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_merch_products_category" AS ENUM('Apparel', 'Music', 'Digital', 'Bundle', 'Accessory');
  CREATE TYPE "public"."enum_media_gallery_type" AS ENUM('Photo', 'Video', 'Press Quote', 'EPK Download');
  CREATE TYPE "public"."enum_subscriptions_type" AS ENUM('Fan Club', 'Newsletter', 'Tour Notifications');
  CREATE TYPE "public"."enum_contact_submissions_inquiry_type" AS ENUM('Booking', 'Press', 'Collaboration', 'Other');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('New', 'Read', 'Replied', 'Archived');
  CREATE TYPE "public"."enum_orders_items_type" AS ENUM('Track', 'EP', 'Merch');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('Pending Payment', 'Complete', 'Refunded', 'Expired');
  CREATE TYPE "public"."enum_media_category" AS ENUM('Release Cover', 'Press Photo', 'Merch', 'Blog', 'Artist', 'Other');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'viewer');
  CREATE TABLE "artist_profile_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "artist_profile_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"title" varchar,
  	"description" jsonb
  );
  
  CREATE TABLE "artist_profile_press_quotes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"publication" varchar
  );
  
  CREATE TABLE "artist_profile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"tagline" varchar,
  	"bio" jsonb,
  	"hero_image_id" integer,
  	"portrait_image_id" integer,
  	"social_links_instagram" varchar,
  	"social_links_tiktok" varchar,
  	"social_links_youtube" varchar,
  	"social_links_soundcloud" varchar,
  	"contact_emails_general" varchar,
  	"contact_emails_booking" varchar,
  	"contact_emails_press" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "releases_tracks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" numeric,
  	"title" varchar,
  	"subtitle" varchar,
  	"duration" varchar,
  	"badge" varchar,
  	"preview_url" varchar,
  	"audio_file_id" integer
  );
  
  CREATE TABLE "releases_streaming_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_releases_streaming_links_platform",
  	"url" varchar
  );
  
  CREATE TABLE "releases_distribution_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"price" numeric,
  	"currency" "enum_releases_distribution_tiers_currency" DEFAULT 'USD'
  );
  
  CREATE TABLE "releases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_releases_type",
  	"cover_image_id" integer NOT NULL,
  	"release_date" timestamp(3) with time zone,
  	"description" varchar,
  	"featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tour_shows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"venue" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"country" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"time" varchar,
  	"type" "enum_tour_shows_type",
  	"sold_out" boolean,
  	"ticket_url" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"cover_image_id" integer,
  	"category" "enum_blog_posts_category",
  	"excerpt" varchar,
  	"content" jsonb,
  	"published_date" timestamp(3) with time zone,
  	"featured" boolean,
  	"read_time" numeric,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blog_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_blog_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_cover_image_id" integer,
  	"version_category" "enum__blog_posts_v_version_category",
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_published_date" timestamp(3) with time zone,
  	"version_featured" boolean,
  	"version_read_time" numeric,
  	"version_published" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blog_posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "podcast_episodes_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "podcast_episodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"episode_number" numeric NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"publish_date" timestamp(3) with time zone,
  	"duration" varchar,
  	"audio_url" varchar,
  	"guest_name" varchar,
  	"guest_bio" varchar,
  	"featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "podcast_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"total_episodes" numeric,
  	"total_listeners" numeric,
  	"average_rating" numeric,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "merch_products_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "merch_products_variants_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option" varchar
  );
  
  CREATE TABLE "merch_products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "merch_products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" "enum_merch_products_category",
  	"price" numeric NOT NULL,
  	"compare_at_price" numeric,
  	"description" jsonb,
  	"in_stock" boolean DEFAULT true,
  	"badge" varchar,
  	"featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_media_gallery_type",
  	"title" varchar,
  	"file_id" integer,
  	"thumbnail_id" integer,
  	"video_url" varchar,
  	"quote" jsonb,
  	"publication" varchar,
  	"author" varchar,
  	"file_size" varchar,
  	"file_type" varchar,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"type" "enum_subscriptions_type",
  	"subscribed_at" timestamp(3) with time zone,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"organization" varchar,
  	"inquiry_type" "enum_contact_submissions_inquiry_type",
  	"event_date" timestamp(3) with time zone,
  	"budget" varchar,
  	"message" varchar NOT NULL,
  	"submitted_at" timestamp(3) with time zone,
  	"status" "enum_contact_submissions_status" DEFAULT 'New',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_orders_items_type",
  	"name" varchar,
  	"price" numeric,
  	"quantity" numeric DEFAULT 1
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar,
  	"customer_email" varchar NOT NULL,
  	"customer_name" varchar,
  	"total" numeric NOT NULL,
  	"currency" varchar DEFAULT 'USD',
  	"status" "enum_orders_status" DEFAULT 'Pending Payment',
  	"credo_reference" varchar,
  	"credo_authorization_url" varchar,
  	"download_token" varchar,
  	"download_expires_at" timestamp(3) with time zone,
  	"download_count" numeric DEFAULT 0,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" varchar,
  	"category" "enum_media_category",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'viewer' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"artist_profile_id" integer,
  	"releases_id" integer,
  	"tour_shows_id" integer,
  	"blog_posts_id" integer,
  	"podcast_episodes_id" integer,
  	"podcast_stats_id" integer,
  	"merch_products_id" integer,
  	"media_gallery_id" integer,
  	"subscriptions_id" integer,
  	"contact_submissions_id" integer,
  	"orders_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_title" varchar,
  	"site_description" varchar,
  	"og_image_id" integer,
  	"announcement_bar_enabled" boolean,
  	"announcement_bar_text" varchar,
  	"announcement_bar_link_text" varchar,
  	"announcement_bar_link_url" varchar,
  	"announcement_bar_start_date" timestamp(3) with time zone,
  	"announcement_bar_end_date" timestamp(3) with time zone,
  	"ep_release_date" timestamp(3) with time zone,
  	"cdn_url" varchar,
  	"footer_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"external" boolean,
  	"cta" boolean
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "artist_profile_principles" ADD CONSTRAINT "artist_profile_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artist_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artist_profile_timeline" ADD CONSTRAINT "artist_profile_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artist_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artist_profile_press_quotes" ADD CONSTRAINT "artist_profile_press_quotes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artist_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artist_profile" ADD CONSTRAINT "artist_profile_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artist_profile" ADD CONSTRAINT "artist_profile_portrait_image_id_media_id_fk" FOREIGN KEY ("portrait_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "releases_tracks" ADD CONSTRAINT "releases_tracks_audio_file_id_media_id_fk" FOREIGN KEY ("audio_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "releases_tracks" ADD CONSTRAINT "releases_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "releases_streaming_links" ADD CONSTRAINT "releases_streaming_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "releases_distribution_tiers" ADD CONSTRAINT "releases_distribution_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "releases" ADD CONSTRAINT "releases_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "podcast_episodes_tags" ADD CONSTRAINT "podcast_episodes_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."podcast_episodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merch_products_images" ADD CONSTRAINT "merch_products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merch_products_images" ADD CONSTRAINT "merch_products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merch_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merch_products_variants_options" ADD CONSTRAINT "merch_products_variants_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merch_products_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merch_products_variants" ADD CONSTRAINT "merch_products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merch_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_gallery" ADD CONSTRAINT "media_gallery_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_gallery" ADD CONSTRAINT "media_gallery_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artist_profile_fk" FOREIGN KEY ("artist_profile_id") REFERENCES "public"."artist_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_releases_fk" FOREIGN KEY ("releases_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tour_shows_fk" FOREIGN KEY ("tour_shows_id") REFERENCES "public"."tour_shows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_podcast_episodes_fk" FOREIGN KEY ("podcast_episodes_id") REFERENCES "public"."podcast_episodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_podcast_stats_fk" FOREIGN KEY ("podcast_stats_id") REFERENCES "public"."podcast_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_merch_products_fk" FOREIGN KEY ("merch_products_id") REFERENCES "public"."merch_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_gallery_fk" FOREIGN KEY ("media_gallery_id") REFERENCES "public"."media_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscriptions_fk" FOREIGN KEY ("subscriptions_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_nav_items" ADD CONSTRAINT "navigation_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "artist_profile_principles_order_idx" ON "artist_profile_principles" USING btree ("_order");
  CREATE INDEX "artist_profile_principles_parent_id_idx" ON "artist_profile_principles" USING btree ("_parent_id");
  CREATE INDEX "artist_profile_timeline_order_idx" ON "artist_profile_timeline" USING btree ("_order");
  CREATE INDEX "artist_profile_timeline_parent_id_idx" ON "artist_profile_timeline" USING btree ("_parent_id");
  CREATE INDEX "artist_profile_press_quotes_order_idx" ON "artist_profile_press_quotes" USING btree ("_order");
  CREATE INDEX "artist_profile_press_quotes_parent_id_idx" ON "artist_profile_press_quotes" USING btree ("_parent_id");
  CREATE INDEX "artist_profile_hero_image_idx" ON "artist_profile" USING btree ("hero_image_id");
  CREATE INDEX "artist_profile_portrait_image_idx" ON "artist_profile" USING btree ("portrait_image_id");
  CREATE INDEX "artist_profile_updated_at_idx" ON "artist_profile" USING btree ("updated_at");
  CREATE INDEX "artist_profile_created_at_idx" ON "artist_profile" USING btree ("created_at");
  CREATE INDEX "releases_tracks_order_idx" ON "releases_tracks" USING btree ("_order");
  CREATE INDEX "releases_tracks_parent_id_idx" ON "releases_tracks" USING btree ("_parent_id");
  CREATE INDEX "releases_tracks_audio_file_idx" ON "releases_tracks" USING btree ("audio_file_id");
  CREATE INDEX "releases_streaming_links_order_idx" ON "releases_streaming_links" USING btree ("_order");
  CREATE INDEX "releases_streaming_links_parent_id_idx" ON "releases_streaming_links" USING btree ("_parent_id");
  CREATE INDEX "releases_distribution_tiers_order_idx" ON "releases_distribution_tiers" USING btree ("_order");
  CREATE INDEX "releases_distribution_tiers_parent_id_idx" ON "releases_distribution_tiers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "releases_slug_idx" ON "releases" USING btree ("slug");
  CREATE INDEX "releases_cover_image_idx" ON "releases" USING btree ("cover_image_id");
  CREATE INDEX "releases_updated_at_idx" ON "releases" USING btree ("updated_at");
  CREATE INDEX "releases_created_at_idx" ON "releases" USING btree ("created_at");
  CREATE INDEX "tour_shows_updated_at_idx" ON "tour_shows" USING btree ("updated_at");
  CREATE INDEX "tour_shows_created_at_idx" ON "tour_shows" USING btree ("created_at");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX "blog_posts_cover_image_idx" ON "blog_posts" USING btree ("cover_image_id");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE INDEX "blog_posts__status_idx" ON "blog_posts" USING btree ("_status");
  CREATE INDEX "_blog_posts_v_parent_idx" ON "_blog_posts_v" USING btree ("parent_id");
  CREATE INDEX "_blog_posts_v_version_version_slug_idx" ON "_blog_posts_v" USING btree ("version_slug");
  CREATE INDEX "_blog_posts_v_version_version_cover_image_idx" ON "_blog_posts_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_blog_posts_v_version_version_updated_at_idx" ON "_blog_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_blog_posts_v_version_version_created_at_idx" ON "_blog_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_blog_posts_v_version_version__status_idx" ON "_blog_posts_v" USING btree ("version__status");
  CREATE INDEX "_blog_posts_v_created_at_idx" ON "_blog_posts_v" USING btree ("created_at");
  CREATE INDEX "_blog_posts_v_updated_at_idx" ON "_blog_posts_v" USING btree ("updated_at");
  CREATE INDEX "_blog_posts_v_latest_idx" ON "_blog_posts_v" USING btree ("latest");
  CREATE INDEX "podcast_episodes_tags_order_idx" ON "podcast_episodes_tags" USING btree ("_order");
  CREATE INDEX "podcast_episodes_tags_parent_id_idx" ON "podcast_episodes_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "podcast_episodes_episode_number_idx" ON "podcast_episodes" USING btree ("episode_number");
  CREATE INDEX "podcast_episodes_updated_at_idx" ON "podcast_episodes" USING btree ("updated_at");
  CREATE INDEX "podcast_episodes_created_at_idx" ON "podcast_episodes" USING btree ("created_at");
  CREATE INDEX "podcast_stats_updated_at_idx" ON "podcast_stats" USING btree ("updated_at");
  CREATE INDEX "podcast_stats_created_at_idx" ON "podcast_stats" USING btree ("created_at");
  CREATE INDEX "merch_products_images_order_idx" ON "merch_products_images" USING btree ("_order");
  CREATE INDEX "merch_products_images_parent_id_idx" ON "merch_products_images" USING btree ("_parent_id");
  CREATE INDEX "merch_products_images_image_idx" ON "merch_products_images" USING btree ("image_id");
  CREATE INDEX "merch_products_variants_options_order_idx" ON "merch_products_variants_options" USING btree ("_order");
  CREATE INDEX "merch_products_variants_options_parent_id_idx" ON "merch_products_variants_options" USING btree ("_parent_id");
  CREATE INDEX "merch_products_variants_order_idx" ON "merch_products_variants" USING btree ("_order");
  CREATE INDEX "merch_products_variants_parent_id_idx" ON "merch_products_variants" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "merch_products_slug_idx" ON "merch_products" USING btree ("slug");
  CREATE INDEX "merch_products_updated_at_idx" ON "merch_products" USING btree ("updated_at");
  CREATE INDEX "merch_products_created_at_idx" ON "merch_products" USING btree ("created_at");
  CREATE INDEX "media_gallery_file_idx" ON "media_gallery" USING btree ("file_id");
  CREATE INDEX "media_gallery_thumbnail_idx" ON "media_gallery" USING btree ("thumbnail_id");
  CREATE INDEX "media_gallery_updated_at_idx" ON "media_gallery" USING btree ("updated_at");
  CREATE INDEX "media_gallery_created_at_idx" ON "media_gallery" USING btree ("created_at");
  CREATE UNIQUE INDEX "subscriptions_email_idx" ON "subscriptions" USING btree ("email");
  CREATE INDEX "subscriptions_updated_at_idx" ON "subscriptions" USING btree ("updated_at");
  CREATE INDEX "subscriptions_created_at_idx" ON "subscriptions" USING btree ("created_at");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_artist_profile_id_idx" ON "payload_locked_documents_rels" USING btree ("artist_profile_id");
  CREATE INDEX "payload_locked_documents_rels_releases_id_idx" ON "payload_locked_documents_rels" USING btree ("releases_id");
  CREATE INDEX "payload_locked_documents_rels_tour_shows_id_idx" ON "payload_locked_documents_rels" USING btree ("tour_shows_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_podcast_episodes_id_idx" ON "payload_locked_documents_rels" USING btree ("podcast_episodes_id");
  CREATE INDEX "payload_locked_documents_rels_podcast_stats_id_idx" ON "payload_locked_documents_rels" USING btree ("podcast_stats_id");
  CREATE INDEX "payload_locked_documents_rels_merch_products_id_idx" ON "payload_locked_documents_rels" USING btree ("merch_products_id");
  CREATE INDEX "payload_locked_documents_rels_media_gallery_id_idx" ON "payload_locked_documents_rels" USING btree ("media_gallery_id");
  CREATE INDEX "payload_locked_documents_rels_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("subscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");
  CREATE INDEX "navigation_nav_items_order_idx" ON "navigation_nav_items" USING btree ("_order");
  CREATE INDEX "navigation_nav_items_parent_id_idx" ON "navigation_nav_items" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "artist_profile_principles" CASCADE;
  DROP TABLE "artist_profile_timeline" CASCADE;
  DROP TABLE "artist_profile_press_quotes" CASCADE;
  DROP TABLE "artist_profile" CASCADE;
  DROP TABLE "releases_tracks" CASCADE;
  DROP TABLE "releases_streaming_links" CASCADE;
  DROP TABLE "releases_distribution_tiers" CASCADE;
  DROP TABLE "releases" CASCADE;
  DROP TABLE "tour_shows" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "_blog_posts_v" CASCADE;
  DROP TABLE "podcast_episodes_tags" CASCADE;
  DROP TABLE "podcast_episodes" CASCADE;
  DROP TABLE "podcast_stats" CASCADE;
  DROP TABLE "merch_products_images" CASCADE;
  DROP TABLE "merch_products_variants_options" CASCADE;
  DROP TABLE "merch_products_variants" CASCADE;
  DROP TABLE "merch_products" CASCADE;
  DROP TABLE "media_gallery" CASCADE;
  DROP TABLE "subscriptions" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "navigation_nav_items" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TYPE "public"."enum_releases_streaming_links_platform";
  DROP TYPE "public"."enum_releases_distribution_tiers_currency";
  DROP TYPE "public"."enum_releases_type";
  DROP TYPE "public"."enum_tour_shows_type";
  DROP TYPE "public"."enum_blog_posts_category";
  DROP TYPE "public"."enum_blog_posts_status";
  DROP TYPE "public"."enum__blog_posts_v_version_category";
  DROP TYPE "public"."enum__blog_posts_v_version_status";
  DROP TYPE "public"."enum_merch_products_category";
  DROP TYPE "public"."enum_media_gallery_type";
  DROP TYPE "public"."enum_subscriptions_type";
  DROP TYPE "public"."enum_contact_submissions_inquiry_type";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_orders_items_type";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_media_category";
  DROP TYPE "public"."enum_users_role";`)
}
