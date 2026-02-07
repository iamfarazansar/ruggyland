import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RUG_STORIES_MODULE } from "../../../modules/rug-stories";

// GET /store/rug-stories - List all published stories
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const rugStoriesService = req.scope.resolve(RUG_STORIES_MODULE) as any;

    // Get all stories using the correct method name
    const allStories = await rugStoriesService.listRugStories({});

    console.log("All stories from DB:", JSON.stringify(allStories, null, 2));

    // Filter for published stories only
    const publishedStories = allStories.filter(
      (s: any) => s.published === true,
    );

    console.log("Published stories:", publishedStories.length);

    return res.json({
      stories: publishedStories,
      count: publishedStories.length,
      debug: {
        totalInDb: allStories.length,
        publishedCount: publishedStories.length,
      },
    });
  } catch (error: any) {
    console.error("Error in /store/rug-stories:", error);
    return res.status(500).json({
      message: "Failed to fetch rug stories",
      error: error.message,
    });
  }
}
