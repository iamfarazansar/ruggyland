import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201092855 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "purchase_order" ("id" text not null, "supplier_id" text not null, "status" text not null default 'draft', "order_date" timestamptz null, "expected_date" timestamptz null, "received_date" timestamptz null, "subtotal" integer not null default 0, "notes" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "purchase_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_purchase_order_deleted_at" ON "purchase_order" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "purchase_order_item" ("id" text not null, "purchase_order_id" text not null, "material_id" text not null, "quantity_ordered" integer not null default 0, "quantity_received" integer not null default 0, "unit_price" integer not null default 0, "notes" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "purchase_order_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_purchase_order_item_deleted_at" ON "purchase_order_item" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "purchase_order" cascade;`);

    this.addSql(`drop table if exists "purchase_order_item" cascade;`);
  }

}
