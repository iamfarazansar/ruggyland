import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RUG_STORIES_MODULE } from "../../../../modules/rug-stories";

// Disable authentication and publishable API key requirement for this public endpoint
export const AUTHENTICATE = false;

// GET /store/rug-stories/:slug - Get single story by slug
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { slug } = req.params;
    const rugStoriesService = req.scope.resolve(RUG_STORIES_MODULE) as any;

    // Get all stories and filter by slug (since direct filter may not work)
    const allStories = await rugStoriesService.listRugStories({});
    const story = allStories.find(
      (s: any) => s.slug === slug && s.published === true,
    );

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    return res.json({
      story,
    });
  } catch (error: any) {
    console.error("Error in /store/rug-stories/:slug:", error);
    return res.status(500).json({
      message: "Failed to fetch rug story",
      error: error.message,
    });
  }
}
