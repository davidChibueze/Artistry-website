import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_payment_provider" AS ENUM('credo', 'paypal');
  CREATE TYPE "public"."enum_orders_paid_currency" AS ENUM('USD', 'NGN');
  CREATE TYPE "public"."enum_carts_items_type" AS ENUM('Track', 'EP', 'Merch');
  CREATE TYPE "public"."enum_carts_display_currency" AS ENUM('USD', 'NGN');
  CREATE TYPE "public"."enum_email_templates_key" AS ENUM('order.paid', 'order.fulfilled', 'order.shipped', 'order.refunded', 'order.cancelled', 'order.magic-link', 'cart.abandoned', 'welcome.newsletter', 'contact.auto-reply');
  CREATE TYPE "public"."enum_email_logs_status" AS ENUM('queued', 'sent', 'failed');
  ALTER TYPE "public"."enum_releases_distribution_tiers_currency" RENAME TO "enum_orders_display_currency";
  CREATE TABLE "merch_products_option_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "merch_products_variants_option_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "orders_emails_sent" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"template_key" varchar,
  	"sent_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "carts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_carts_items_type",
  	"product_id" varchar NOT NULL,
  	"variant_id" varchar,
  	"name" varchar,
  	"variant_label" varchar,
  	"sku" varchar,
  	"price_u_s_d" numeric NOT NULL,
  	"price_n_g_n" numeric NOT NULL,
  	"quantity" numeric DEFAULT 1,
  	"image_url" varchar
  );
  
  CREATE TABLE "carts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cart_id" varchar NOT NULL,
  	"customer_email" varchar,
  	"customer_token" varchar,
  	"display_currency" "enum_carts_display_currency" DEFAULT 'USD' NOT NULL,
  	"item_count" numeric DEFAULT 0,
  	"last_activity_at" timestamp(3) with time zone,
  	"abandoned_email_sent_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "enum_email_templates_key" NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"subject" varchar NOT NULL,
  	"body" jsonb NOT NULL,
  	"from_name" varchar,
  	"from_email" varchar,
  	"reply_to" varchar,
  	"variable_docs" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"template_key" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"subject" varchar,
  	"status" "enum_email_logs_status" NOT NULL,
  	"resend_id" varchar,
  	"order_id" integer,
  	"error" varchar,
  	"sent_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "merch_products_variants_options" RENAME TO "merch_products_option_types_values";
  ALTER TABLE "merch_products_option_types_values" RENAME COLUMN "option" TO "value";
  ALTER TABLE "merch_products_variants" RENAME COLUMN "name" TO "sku";
  ALTER TABLE "orders_items" RENAME COLUMN "price" TO "product_id";
  ALTER TABLE "orders" RENAME COLUMN "currency" TO "shipping_address_line1";
  ALTER TABLE "merch_products_option_types_values" DROP CONSTRAINT "merch_products_variants_options_parent_id_fk";
  
  ALTER TABLE "orders" ALTER COLUMN "display_currency" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "display_currency" SET DEFAULT 'USD'::text;
  DROP TYPE "public"."enum_orders_display_currency";
  CREATE TYPE "public"."enum_orders_display_currency" AS ENUM('USD', 'NGN');
  ALTER TABLE "orders" ALTER COLUMN "display_currency" SET DEFAULT 'USD'::"public"."enum_orders_display_currency";
  ALTER TABLE "orders" ALTER COLUMN "display_currency" SET DATA TYPE "public"."enum_orders_display_currency" USING "display_currency"::"public"."enum_orders_display_currency";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pending Payment'::text;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('Pending Payment', 'Paid', 'Fulfilled', 'Shipped', 'Refunded', 'Cancelled', 'Expired');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pending Payment'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  DROP INDEX "merch_products_variants_options_order_idx";
  DROP INDEX "merch_products_variants_options_parent_id_idx";
  ALTER TABLE "releases_tracks" ADD COLUMN "price_u_s_d" numeric;
  ALTER TABLE "releases_tracks" ADD COLUMN "price_n_g_n" numeric;
  ALTER TABLE "releases_distribution_tiers" ADD COLUMN "price_u_s_d" numeric NOT NULL;
  ALTER TABLE "releases_distribution_tiers" ADD COLUMN "price_n_g_n" numeric NOT NULL;
  ALTER TABLE "merch_products_variants" ADD COLUMN "price_u_s_d" numeric NOT NULL;
  ALTER TABLE "merch_products_variants" ADD COLUMN "price_n_g_n" numeric NOT NULL;
  ALTER TABLE "merch_products_variants" ADD COLUMN "stock" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "merch_products_variants" ADD COLUMN "image_id" integer;
  ALTER TABLE "merch_products_variants" ADD COLUMN "available" boolean DEFAULT true;
  ALTER TABLE "merch_products" ADD COLUMN "price_u_s_d" numeric NOT NULL;
  ALTER TABLE "merch_products" ADD COLUMN "price_n_g_n" numeric NOT NULL;
  ALTER TABLE "merch_products" ADD COLUMN "compare_at_price_u_s_d" numeric;
  ALTER TABLE "merch_products" ADD COLUMN "compare_at_price_n_g_n" numeric;
  ALTER TABLE "orders_items" ADD COLUMN "variant_id" varchar;
  ALTER TABLE "orders_items" ADD COLUMN "variant_label" varchar;
  ALTER TABLE "orders_items" ADD COLUMN "sku" varchar;
  ALTER TABLE "orders_items" ADD COLUMN "price_u_s_d" numeric NOT NULL;
  ALTER TABLE "orders_items" ADD COLUMN "price_n_g_n" numeric NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_line2" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_city" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_state" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_postal_code" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_country" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_address_phone" varchar;
  ALTER TABLE "orders" ADD COLUMN "subtotal" numeric NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "shipping" numeric DEFAULT 0;
  ALTER TABLE "orders" ADD COLUMN "display_currency" "enum_orders_display_currency" DEFAULT 'USD' NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "payment_provider" "enum_orders_payment_provider";
  ALTER TABLE "orders" ADD COLUMN "paid_currency" "enum_orders_paid_currency";
  ALTER TABLE "orders" ADD COLUMN "paid_amount" numeric;
  ALTER TABLE "orders" ADD COLUMN "paypal_order_id" varchar;
  ALTER TABLE "orders" ADD COLUMN "paypal_capture_id" varchar;
  ALTER TABLE "orders" ADD COLUMN "lookup_token" varchar;
  ALTER TABLE "orders" ADD COLUMN "customer_token" varchar;
  ALTER TABLE "orders" ADD COLUMN "notes" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "carts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_templates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_logs_id" integer;
  ALTER TABLE "merch_products_option_types" ADD CONSTRAINT "merch_products_option_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merch_products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merch_products_variants_option_values" ADD CONSTRAINT "merch_products_variants_option_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merch_products_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_emails_sent" ADD CONSTRAINT "orders_emails_sent_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "merch_products_option_types_order_idx" ON "merch_products_option_types" USING btree ("_order");
  CREATE INDEX "merch_products_option_types_parent_id_idx" ON "merch_products_option_types" USING btree ("_parent_id");
  CREATE INDEX "merch_products_variants_option_values_order_idx" ON "merch_products_variants_option_values" USING btree ("_order");
  CREATE INDEX "merch_products_variants_option_values_parent_id_idx" ON "merch_products_variants_option_values" USING btree ("_parent_id");
  CREATE INDEX "orders_emails_sent_order_idx" ON "orders_emails_sent" USING btree ("_order");
  CREATE INDEX "orders_emails_sent_parent_id_idx" ON "orders_emails_sent" USING btree ("_parent_id");
  CREATE INDEX "carts_items_order_idx" ON "carts_items" USING btree ("_order");
  CREATE INDEX "carts_items_parent_id_idx" ON "carts_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "carts_cart_id_idx" ON "carts" USING btree ("cart_id");
  CREATE INDEX "carts_customer_email_idx" ON "carts" USING btree ("customer_email");
  CREATE INDEX "carts_customer_token_idx" ON "carts" USING btree ("customer_token");
  CREATE INDEX "carts_last_activity_at_idx" ON "carts" USING btree ("last_activity_at");
  CREATE INDEX "carts_updated_at_idx" ON "carts" USING btree ("updated_at");
  CREATE INDEX "carts_created_at_idx" ON "carts" USING btree ("created_at");
  CREATE UNIQUE INDEX "email_templates_key_idx" ON "email_templates" USING btree ("key");
  CREATE INDEX "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at");
  CREATE INDEX "email_templates_created_at_idx" ON "email_templates" USING btree ("created_at");
  CREATE INDEX "email_logs_template_key_idx" ON "email_logs" USING btree ("template_key");
  CREATE INDEX "email_logs_to_idx" ON "email_logs" USING btree ("to");
  CREATE INDEX "email_logs_status_idx" ON "email_logs" USING btree ("status");
  CREATE INDEX "email_logs_order_idx" ON "email_logs" USING btree ("order_id");
  CREATE INDEX "email_logs_updated_at_idx" ON "email_logs" USING btree ("updated_at");
  CREATE INDEX "email_logs_created_at_idx" ON "email_logs" USING btree ("created_at");
  ALTER TABLE "merch_products_option_types_values" ADD CONSTRAINT "merch_products_option_types_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merch_products_option_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merch_products_variants" ADD CONSTRAINT "merch_products_variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carts_fk" FOREIGN KEY ("carts_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_templates_fk" FOREIGN KEY ("email_templates_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_logs_fk" FOREIGN KEY ("email_logs_id") REFERENCES "public"."email_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "merch_products_option_types_values_order_idx" ON "merch_products_option_types_values" USING btree ("_order");
  CREATE INDEX "merch_products_option_types_values_parent_id_idx" ON "merch_products_option_types_values" USING btree ("_parent_id");
  CREATE INDEX "merch_products_variants_image_idx" ON "merch_products_variants" USING btree ("image_id");
  CREATE INDEX "orders_customer_email_idx" ON "orders" USING btree ("customer_email");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX "orders_paypal_order_id_idx" ON "orders" USING btree ("paypal_order_id");
  CREATE INDEX "orders_lookup_token_idx" ON "orders" USING btree ("lookup_token");
  CREATE INDEX "orders_customer_token_idx" ON "orders" USING btree ("customer_token");
  CREATE INDEX "payload_locked_documents_rels_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("carts_id");
  CREATE INDEX "payload_locked_documents_rels_email_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("email_templates_id");
  CREATE INDEX "payload_locked_documents_rels_email_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("email_logs_id");
  ALTER TABLE "releases_distribution_tiers" DROP COLUMN "price";
  ALTER TABLE "releases_distribution_tiers" DROP COLUMN "currency";
  ALTER TABLE "merch_products" DROP COLUMN "price";
  ALTER TABLE "merch_products" DROP COLUMN "compare_at_price";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_releases_distribution_tiers_currency" AS ENUM('USD', 'EUR', 'GBP');
  CREATE TABLE "merch_products_variants_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option" varchar
  );
  
  ALTER TABLE "merch_products_option_types_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merch_products_option_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merch_products_variants_option_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_emails_sent" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "carts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "carts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "merch_products_option_types_values" CASCADE;
  DROP TABLE "merch_products_option_types" CASCADE;
  DROP TABLE "merch_products_variants_option_values" CASCADE;
  DROP TABLE "orders_emails_sent" CASCADE;
  DROP TABLE "carts_items" CASCADE;
  DROP TABLE "carts" CASCADE;
  DROP TABLE "email_templates" CASCADE;
  DROP TABLE "email_logs" CASCADE;
  ALTER TABLE "merch_products_variants" DROP CONSTRAINT "merch_products_variants_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_carts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_templates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_logs_fk";
  
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pending Payment'::text;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('Pending Payment', 'Complete', 'Refunded', 'Expired');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pending Payment'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  DROP INDEX "merch_products_variants_image_idx";
  DROP INDEX "orders_customer_email_idx";
  DROP INDEX "orders_status_idx";
  DROP INDEX "orders_paypal_order_id_idx";
  DROP INDEX "orders_lookup_token_idx";
  DROP INDEX "orders_customer_token_idx";
  DROP INDEX "payload_locked_documents_rels_carts_id_idx";
  DROP INDEX "payload_locked_documents_rels_email_templates_id_idx";
  DROP INDEX "payload_locked_documents_rels_email_logs_id_idx";
  ALTER TABLE "releases_distribution_tiers" ADD COLUMN "price" numeric;
  ALTER TABLE "releases_distribution_tiers" ADD COLUMN "currency" "enum_releases_distribution_tiers_currency" DEFAULT 'USD';
  ALTER TABLE "merch_products_variants" ADD COLUMN "name" varchar;
  ALTER TABLE "merch_products" ADD COLUMN "price" numeric NOT NULL;
  ALTER TABLE "merch_products" ADD COLUMN "compare_at_price" numeric;
  ALTER TABLE "orders_items" ADD COLUMN "price" numeric;
  ALTER TABLE "orders" ADD COLUMN "currency" varchar DEFAULT 'USD';
  ALTER TABLE "merch_products_variants_options" ADD CONSTRAINT "merch_products_variants_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merch_products_variants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "merch_products_variants_options_order_idx" ON "merch_products_variants_options" USING btree ("_order");
  CREATE INDEX "merch_products_variants_options_parent_id_idx" ON "merch_products_variants_options" USING btree ("_parent_id");
  ALTER TABLE "releases_tracks" DROP COLUMN "price_u_s_d";
  ALTER TABLE "releases_tracks" DROP COLUMN "price_n_g_n";
  ALTER TABLE "releases_distribution_tiers" DROP COLUMN "price_u_s_d";
  ALTER TABLE "releases_distribution_tiers" DROP COLUMN "price_n_g_n";
  ALTER TABLE "merch_products_variants" DROP COLUMN "sku";
  ALTER TABLE "merch_products_variants" DROP COLUMN "price_u_s_d";
  ALTER TABLE "merch_products_variants" DROP COLUMN "price_n_g_n";
  ALTER TABLE "merch_products_variants" DROP COLUMN "stock";
  ALTER TABLE "merch_products_variants" DROP COLUMN "image_id";
  ALTER TABLE "merch_products_variants" DROP COLUMN "available";
  ALTER TABLE "merch_products" DROP COLUMN "price_u_s_d";
  ALTER TABLE "merch_products" DROP COLUMN "price_n_g_n";
  ALTER TABLE "merch_products" DROP COLUMN "compare_at_price_u_s_d";
  ALTER TABLE "merch_products" DROP COLUMN "compare_at_price_n_g_n";
  ALTER TABLE "orders_items" DROP COLUMN "product_id";
  ALTER TABLE "orders_items" DROP COLUMN "variant_id";
  ALTER TABLE "orders_items" DROP COLUMN "variant_label";
  ALTER TABLE "orders_items" DROP COLUMN "sku";
  ALTER TABLE "orders_items" DROP COLUMN "price_u_s_d";
  ALTER TABLE "orders_items" DROP COLUMN "price_n_g_n";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_line1";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_line2";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_city";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_state";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_postal_code";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_country";
  ALTER TABLE "orders" DROP COLUMN "shipping_address_phone";
  ALTER TABLE "orders" DROP COLUMN "subtotal";
  ALTER TABLE "orders" DROP COLUMN "shipping";
  ALTER TABLE "orders" DROP COLUMN "display_currency";
  ALTER TABLE "orders" DROP COLUMN "payment_provider";
  ALTER TABLE "orders" DROP COLUMN "paid_currency";
  ALTER TABLE "orders" DROP COLUMN "paid_amount";
  ALTER TABLE "orders" DROP COLUMN "paypal_order_id";
  ALTER TABLE "orders" DROP COLUMN "paypal_capture_id";
  ALTER TABLE "orders" DROP COLUMN "lookup_token";
  ALTER TABLE "orders" DROP COLUMN "customer_token";
  ALTER TABLE "orders" DROP COLUMN "notes";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "carts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_templates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_logs_id";
  DROP TYPE "public"."enum_orders_display_currency";
  DROP TYPE "public"."enum_orders_payment_provider";
  DROP TYPE "public"."enum_orders_paid_currency";
  DROP TYPE "public"."enum_carts_items_type";
  DROP TYPE "public"."enum_carts_display_currency";
  DROP TYPE "public"."enum_email_templates_key";
  DROP TYPE "public"."enum_email_logs_status";`)
}
