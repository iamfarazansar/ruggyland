import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260301065028 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_inquiry" ("id" text not null, "product_id" text null, "product_handle" text null, "product_title" text not null, "name" text not null, "email" text not null, "phone" text null, "message" text not null, "status" text not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_inquiry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_inquiry_deleted_at" ON "product_inquiry" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_inquiry" cascade;`);
  }

}
