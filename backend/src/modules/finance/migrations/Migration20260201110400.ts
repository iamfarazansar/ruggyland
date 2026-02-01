import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201110400 extends Migration {
  override async up(): Promise<void> {
    // Add missing columns to expense table if they don't exist
    this.addSql(`
      DO $$ 
      BEGIN
        -- Add expense_date column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'expense_date') THEN
          ALTER TABLE "expense" ADD COLUMN "expense_date" timestamptz NOT NULL DEFAULT now();
        END IF;
        
        -- Add paid_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'paid_at') THEN
          ALTER TABLE "expense" ADD COLUMN "paid_at" timestamptz NULL;
        END IF;
        
        -- Add paid_status column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'paid_status') THEN
          ALTER TABLE "expense" ADD COLUMN "paid_status" text NOT NULL DEFAULT 'unpaid';
        END IF;
        
        -- Add work_order_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'work_order_id') THEN
          ALTER TABLE "expense" ADD COLUMN "work_order_id" text NULL;
        END IF;
        
        -- Add purchase_order_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'purchase_order_id') THEN
          ALTER TABLE "expense" ADD COLUMN "purchase_order_id" text NULL;
        END IF;
        
        -- Add artisan_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'artisan_id') THEN
          ALTER TABLE "expense" ADD COLUMN "artisan_id" text NULL;
        END IF;
        
        -- Add vendor column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'vendor') THEN
          ALTER TABLE "expense" ADD COLUMN "vendor" text NULL;
        END IF;
        
        -- Add reference_number column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'reference_number') THEN
          ALTER TABLE "expense" ADD COLUMN "reference_number" text NULL;
        END IF;
        
        -- Add created_by column if it doesn't exist  
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense' AND column_name = 'created_by') THEN
          ALTER TABLE "expense" ADD COLUMN "created_by" text NULL;
        END IF;
      END $$;
    `);
  }

  override async down(): Promise<void> {
    // Drop added columns (optional for development)
    this.addSql(`
      ALTER TABLE "expense" 
      DROP COLUMN IF EXISTS "expense_date",
      DROP COLUMN IF EXISTS "paid_at",
      DROP COLUMN IF EXISTS "paid_status",
      DROP COLUMN IF EXISTS "work_order_id",
      DROP COLUMN IF EXISTS "purchase_order_id",
      DROP COLUMN IF EXISTS "artisan_id",
      DROP COLUMN IF EXISTS "vendor",
      DROP COLUMN IF EXISTS "reference_number",
      DROP COLUMN IF EXISTS "created_by";
    `);
  }
}
