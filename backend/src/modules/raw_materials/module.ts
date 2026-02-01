import RawMaterialsService from "./service";
import { Module } from "@medusajs/framework/utils";

export default Module("raw_materials", {
  service: RawMaterialsService,
});
