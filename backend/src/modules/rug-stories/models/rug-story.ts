import { model } from "@medusajs/framework/utils";

export const RugStory = model.define("rug_story", {
  id: model.id().primaryKey(),

  // Basic info
  title: model.text(),
  slug: model.text().unique(),
  subtitle: model.text().nullable(),

  // Main image
  thumbnail: model.text().nullable(),

  // Specs
  size: model.text().nullable(),
  material: model.text().nullable(),

  // Content
  intro_text: model.text().nullable(),

  // Crafting steps stored as JSON array
  // Each step: { title: string, description: string, image_url: string }
  steps: model.json().default([]),

  // Publishing
  published: model.boolean().default(false),
});
