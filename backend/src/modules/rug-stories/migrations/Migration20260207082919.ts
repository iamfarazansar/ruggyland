import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260207082919 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "rug_story" drop constraint if exists "rug_story_slug_unique";`);
    this.addSql(`create table if not exists "rug_story" ("id" text not null, "title" text not null, "slug" text not null, "subtitle" text null, "thumbnail" text null, "size" text null, "material" text null, "intro_text" text null, "steps" jsonb not null default '[]', "published" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rug_story_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_rug_story_slug_unique" ON "rug_story" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rug_story_deleted_at" ON "rug_story" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "rug_story" cascade;`);
  }

}
