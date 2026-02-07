import RugStoriesService from "./service";
import { Module } from "@medusajs/framework/utils";

export default Module("rug_stories", {
  service: RugStoriesService,
});
