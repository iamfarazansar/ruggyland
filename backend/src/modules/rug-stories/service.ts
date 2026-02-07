import { MedusaService } from "@medusajs/framework/utils";
import { RugStory } from "./models/rug-story";

class RugStoriesService extends MedusaService({
  RugStory,
}) {}

export default RugStoriesService;
