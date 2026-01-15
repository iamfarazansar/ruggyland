import CustomRugService from "./service";

import { Module } from "@medusajs/framework/utils";

export default Module("custom_rug", {
  service: CustomRugService,
});
