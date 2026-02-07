import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { RUG_STORIES_MODULE } from "../../../modules/rug-stories";

type StoryStep = {
  title: string;
  description: string;
  image_url: string;
};

type CreateStoryInput = {
  title: string;
  slug: string;
  subtitle?: string;
  thumbnail?: string;
  size?: string;
  material?: string;
  intro_text?: string;
  steps?: StoryStep[];
  published?: boolean;
};

// GET /admin/rug-stories - List all stories
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rugStoriesService = req.scope.resolve(RUG_STORIES_MODULE) as any;

  const stories = await rugStoriesService.listRugStories({});

  return res.json({
    stories,
    count: stories.length,
  });
}

// POST /admin/rug-stories - Create new story
export async function POST(
  req: MedusaRequest<CreateStoryInput>,
  res: MedusaResponse,
) {
  const rugStoriesService = req.scope.resolve(RUG_STORIES_MODULE) as any;

  const story = await rugStoriesService.createRugStories({
    title: req.body.title,
    slug: req.body.slug,
    subtitle: req.body.subtitle || null,
    thumbnail: req.body.thumbnail || null,
    size: req.body.size || null,
    material: req.body.material || null,
    intro_text: req.body.intro_text || null,
    steps: req.body.steps || [],
    published: req.body.published || false,
  });

  return res.status(201).json({
    story,
  });
}
