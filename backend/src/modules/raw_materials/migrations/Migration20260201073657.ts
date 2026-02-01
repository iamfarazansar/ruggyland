import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201073657 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "material" ("id" text not null, "name" text not null, "sku" text null, "description" text null, "category" text not null, "unit" text not null, "current_stock" integer not null default 0, "min_stock_level" integer not null default 0, "cost_per_unit" integer not null default 0, "color" text null, "weight_type" text null, "supplier_id" text null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "material_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_material_deleted_at" ON "material" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "stock_movement" ("id" text not null, "material_id" text not null, "type" text not null, "quantity" integer not null, "reason" text null, "notes" text null, "work_order_id" text null, "created_by" text null, "stock_before" integer not null default 0, "stock_after" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stock_movement_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_deleted_at" ON "stock_movement" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "supplier" ("id" text not null, "name" text not null, "contact_person" text null, "email" text null, "phone" text null, "address" text null, "city" text null, "country" text null, "notes" text null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "supplier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_supplier_deleted_at" ON "supplier" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "material" cascade;`);

    this.addSql(`drop table if exists "stock_movement" cascade;`);

    this.addSql(`drop table if exists "supplier" cascade;`);
  }

}
