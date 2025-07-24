
-- Migration: Create product_images table
CREATE TABLE IF NOT EXISTS "product_images" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" text NOT NULL,
  "filename" text NOT NULL,
  "original_name" text NOT NULL,
  "url" text NOT NULL,
  "position" integer NOT NULL DEFAULT 1,
  "size" integer NOT NULL,
  "mime_type" text NOT NULL,
  "width" integer NOT NULL DEFAULT 0,
  "height" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" ON "product_images" ("product_id");
CREATE INDEX IF NOT EXISTS "product_images_position_idx" ON "product_images" ("position");

-- Add foreign key constraint
ALTER TABLE "product_images" 
ADD CONSTRAINT "product_images_product_id_fkey" 
FOREIGN KEY ("product_id") REFERENCES "imported_products" ("id") ON DELETE CASCADE;
