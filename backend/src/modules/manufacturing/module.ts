import ManufacturingService from "./service";
import { Module } from "@medusajs/framework/utils";

export default Module("manufacturing", {
  service: ManufacturingService,
});
