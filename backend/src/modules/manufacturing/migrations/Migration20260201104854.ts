import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201104854 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "work_order_artisan" add column if not exists "paid_status" text not null default 'unpaid', add column if not exists "paid_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "work_order_artisan" drop column if exists "paid_status", drop column if exists "paid_at";`);
  }

}
