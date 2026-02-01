import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201110253 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "expense" ("id" text not null, "category" text not null, "amount" integer not null default 0, "currency" text not null default 'INR', "title" text not null, "description" text null, "work_order_id" text null, "purchase_order_id" text null, "artisan_id" text null, "paid_status" text not null default 'unpaid', "paid_at" timestamptz null, "expense_date" timestamptz not null, "vendor" text null, "reference_number" text null, "created_by" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "expense_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_expense_deleted_at" ON "expense" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "expense" cascade;`);
  }

}
