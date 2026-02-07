import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RUG_STORIES_MODULE } from "../../../../modules/rug-stories";

type StoryStep = {
  title: string;
  description: string;
  image_url: string;
};

type UpdateStoryInput = {
  title?: string;
  slug?: string;
  subtitle?: string;
  thumbnail?: string;
  size?: string;
  material?: string;
  intro_text?: string;
  steps?: StoryStep[];
  published?: boolean;
};

// GET /admin/rug-stories/:id - Get single story
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const rugStoriesService = req.scope.resolve(RUG_STORIES_MODULE) as any;

    const story = await rugStoriesService.retrieveRugStory(id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    return res.json({
      story,
    });
  } catch (error: any) {
    console.error("Error getting rug story:", error);
    return res.status(500).json({
      message: "Failed to get story",
      error: error.message,
    });
  }
}

// PUT /admin/rug-stories/:id - Update story
export async function PUT(
  req: MedusaRequest<UpdateStoryInput>,
  res: MedusaResponse,
) {
  try {
    const { id } = req.params;
    const rugStoriesService = req.scope.resolve(RUG_STORIES_MODULE) as any;

    console.log("Updating story:", id, "with data:", JSON.stringify(req.body));

    // Find available update methods
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(rugStoriesService),
    ).filter((name) => name.toLowerCase().includes("update"));
    console.log("Available update methods:", methods);

    // Try the correct method - MedusaService uses singular object with id
    const story = await rugStoriesService.updateRugStories({
      id,
      ...req.body,
    });

    console.log("Update result:", story);

    return res.json({
      story,
    });
  } catch (error: any) {
    console.error("Error updating rug story:", error);
    return res.status(500).json({
      message: "Failed to update story",
      error: error.message,
    });
  }
}

// DELETE /admin/rug-stories/:id - Delete story
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const rugStoriesService = req.scope.resolve(RUG_STORIES_MODULE) as any;

    await rugStoriesService.deleteRugStories(id);

    return res.json({
      id,
      deleted: true,
    });
  } catch (error: any) {
    console.error("Error deleting rug story:", error);
    return res.status(500).json({
      message: "Failed to delete story",
      error: error.message,
    });
  }
}
