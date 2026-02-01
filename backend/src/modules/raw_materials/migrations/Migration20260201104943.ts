import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201104943 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "purchase_order" add column if not exists "paid_status" text not null default 'unpaid', add column if not exists "paid_at" timestamptz null, add column if not exists "paid_amount" integer not null default 0;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "purchase_order" drop column if exists "paid_status", drop column if exists "paid_at", drop column if exists "paid_amount";`);
  }

}
