import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260201101031 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "work_order" add column if not exists "thumbnail" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "work_order" drop column if exists "thumbnail";`);
  }

}
