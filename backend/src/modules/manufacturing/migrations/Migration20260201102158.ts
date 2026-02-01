import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201102158 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "work_order_media" add column if not exists "category" text not null default 'reference';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "work_order_media" drop column if exists "category";`);
  }

}
