import { Module } from "@medusajs/framework/utils";
import FinanceService from "./service";

export default Module("finance", { service: FinanceService });
