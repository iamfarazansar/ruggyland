import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RUG_STORIES_MODULE } from "../../modules/rug-stories";

// GET /rug-stories - List all published stories (public endpoint, no API key required)
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const rugStoriesService = req.scope.resolve(RUG_STORIES_MODULE) as any;

    // Get all stories using the correct method name
    const allStories = await rugStoriesService.listRugStories({});

    // Filter for published stories only
    const publishedStories = allStories.filter(
      (s: any) => s.published === true,
    );

    return res.json({
      stories: publishedStories,
      count: publishedStories.length,
    });
  } catch (error: any) {
    console.error("Error in /rug-stories:", error);
    return res.status(500).json({
      message: "Failed to fetch rug stories",
      error: error.message,
    });
  }
}
