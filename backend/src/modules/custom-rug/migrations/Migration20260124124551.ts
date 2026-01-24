import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260124124551 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "custom_rug_request" ("id" text not null, "client_request_id" text null, "name" text not null, "email" text not null, "phone" text null, "width" integer not null, "height" integer not null, "unit" text not null, "shape" text not null, "budgetMin" integer null, "budgetMax" integer null, "currency" text not null default 'USD', "notes" text null, "referenceImages" jsonb null, "status" text not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "custom_rug_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_custom_rug_request_deleted_at" ON "custom_rug_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "custom_rug_request" cascade;`);
  }

}
