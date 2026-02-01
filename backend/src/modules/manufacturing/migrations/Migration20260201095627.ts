import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201095627 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "work_order_artisan" ("id" text not null, "work_order_id" text not null, "artisan_id" text not null, "role" text null, "labor_cost" integer not null default 0, "notes" text null, "status" text not null default 'assigned', "started_at" timestamptz null, "completed_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "work_order_artisan_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_work_order_artisan_deleted_at" ON "work_order_artisan" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "work_order_artisan" cascade;`);
  }

}
