/**
 * Setup Regions Script
 *
 * Creates 5 regions: India (INR), Europe (EUR), US (USD), UK (GBP), Rest of World (USD)
 *
 * Usage:
 *   npx medusa exec src/scripts/setup-regions.ts
 *
 * Or against a remote backend:
 *   MEDUSA_BACKEND_URL=https://your-backend.railway.app \
 *   ADMIN_EMAIL=admin@example.com \
 *   ADMIN_PASSWORD=yourpassword \
 *   npx tsx src/scripts/setup-regions.ts
 */

import {
  ExecArgs,
  IRegionModuleService,
  IStoreModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const STORE_CURRENCIES = ["usd", "eur", "inr", "gbp"]

const INDIA_COUNTRIES = ["in"]

const UK_COUNTRIES = ["gb"]

const US_COUNTRIES = ["us"]

const EUROPE_COUNTRIES = [
  "at", // Austria
  "be", // Belgium
  "bg", // Bulgaria
  "hr", // Croatia
  "cy", // Cyprus
  "cz", // Czechia
  "dk", // Denmark
  "ee", // Estonia
  "fi", // Finland
  "fr", // France
  "de", // Germany
  "gr", // Greece
  "hu", // Hungary
  "ie", // Ireland
  "it", // Italy
  "lv", // Latvia
  "lt", // Lithuania
  "lu", // Luxembourg
  "mt", // Malta
  "nl", // Netherlands
  "pl", // Poland
  "pt", // Portugal
  "ro", // Romania
  "sk", // Slovakia
  "si", // Slovenia
  "es", // Spain
  "se", // Sweden
  "no", // Norway
  "is", // Iceland
  "ch", // Switzerland
  "li", // Liechtenstein
]

// All other countries → Rest of World (USD)
const REST_OF_WORLD_COUNTRIES = [
  "af", "al", "dz", "ad", "ao", "ag", "ar", "am", "au", "az",
  "bs", "bh", "bd", "bb", "by", "bz", "bj", "bt", "bo", "ba",
  "bw", "br", "bn", "bf", "bi",
  "kh", "cm", "ca", "cv", "cf", "td", "cl", "cn", "co", "km",
  "cg", "cd", "cr", "ci", "cu",
  "dj", "dm", "do",
  "ec", "eg", "sv", "gq", "er", "et",
  "fj",
  "ga", "gm", "ge", "gh", "gd", "gt", "gn", "gw", "gy",
  "ht", "hn",
  "id", "ir", "iq", "il",
  "jm", "jp", "jo",
  "kz", "ke", "ki", "kp", "kr", "kw", "kg",
  "la", "lb", "ls", "lr", "ly",
  "mk", "mg", "mw", "my", "mv", "ml", "mr", "mu", "mx", "fm",
  "md", "mc", "mn", "me", "ma", "mz", "mm",
  "na", "nr", "np", "nz", "ni", "ne", "ng",
  "om",
  "pk", "pw", "pa", "pg", "py", "pe", "ph",
  "qa",
  "ru", "rw",
  "kn", "lc", "vc", "ws", "sm", "st", "sa", "sn", "rs", "sc",
  "sl", "sg", "sb", "so", "za", "ss", "lk", "sd", "sr", "sz",
  "sy",
  "tw", "tj", "tz", "th", "tl", "tg", "to", "tt", "tn", "tr",
  "tm", "tv",
  "ug", "ua", "ae", "uy", "uz",
  "vu", "ve", "vn",
  "ye",
  "zm", "zw",
]

// Medusa default manual fulfillment provider
const FULFILLMENT_PROVIDER = "manual_manual"

const REGIONS = [
  {
    name: "India (Rupee)",
    currency_code: "inr",
    countries: INDIA_COUNTRIES,
    payment_providers: ["pp_razorpay_razorpay"],
    fulfillment_providers: [FULFILLMENT_PROVIDER],
  },
  {
    name: "Europe",
    currency_code: "eur",
    countries: EUROPE_COUNTRIES,
    payment_providers: ["pp_paypal_paypal"],
    fulfillment_providers: [FULFILLMENT_PROVIDER],
  },
  {
    name: "US (USD)",
    currency_code: "usd",
    countries: US_COUNTRIES,
    payment_providers: ["pp_paypal_paypal"],
    fulfillment_providers: [FULFILLMENT_PROVIDER],
  },
  {
    name: "UK",
    currency_code: "gbp",
    countries: UK_COUNTRIES,
    payment_providers: ["pp_paypal_paypal"],
    fulfillment_providers: [FULFILLMENT_PROVIDER],
  },
  {
    name: "Rest of World",
    currency_code: "usd",
    countries: REST_OF_WORLD_COUNTRIES,
    payment_providers: ["pp_paypal_paypal"],
    fulfillment_providers: [FULFILLMENT_PROVIDER],
  },
]

export default async function setupRegions({ container }: ExecArgs) {
  const regionService: IRegionModuleService = container.resolve(Modules.REGION)
  const storeService: IStoreModuleService = container.resolve(Modules.STORE)
  const logger = container.resolve("logger")

  logger.info("Starting region setup...")

  // 0. Ensure all currencies are added to the store
  const [store] = await storeService.listStores()
  if (store) {
    const existingCurrencies = (store.supported_currencies ?? []) as {
      currency_code: string
      is_default?: boolean
    }[]
    const existingCodes = existingCurrencies.map((c) => c.currency_code)
    const missingCurrencies = STORE_CURRENCIES.filter(
      (c) => !existingCodes.includes(c)
    )
    if (missingCurrencies.length > 0) {
      const hasDefault = existingCurrencies.some((c) => c.is_default)
      await storeService.updateStores(store.id, {
        supported_currencies: [
          ...existingCurrencies.map((c) => ({
            currency_code: c.currency_code,
            is_default: c.is_default ?? false,
          })),
          ...missingCurrencies.map((code, i) => ({
            currency_code: code,
            // If no default exists, make the first new currency default
            is_default: !hasDefault && i === 0,
          })),
        ],
      })
      logger.info(`Added currencies to store: ${missingCurrencies.join(", ").toUpperCase()}`)
    } else {
      logger.info("All currencies already present in store.")
    }
  }

  // 1. Delete all existing regions
  const existing = await regionService.listRegions({}, { take: 100 })
  if (existing.length > 0) {
    logger.info(`Deleting ${existing.length} existing region(s)...`)
    await regionService.deleteRegions(existing.map((r) => r.id))
    logger.info("Existing regions deleted.")
  }

  // 2. Create new regions
  for (const regionData of REGIONS) {
    try {
      await regionService.createRegions({
        name: regionData.name,
        currency_code: regionData.currency_code,
        countries: regionData.countries,
        payment_providers: regionData.payment_providers,
      })
      logger.info(
        `Created region: ${regionData.name} (${regionData.currency_code.toUpperCase()}) — ${regionData.countries.length} countries`
      )
    } catch (error: any) {
      logger.error(`Failed to create region "${regionData.name}": ${error.message}`)
    }
  }

  logger.info("Region setup complete!")
  logger.info("Regions created:")
  logger.info("  1. India (Rupee)     — INR — Razorpay")
  logger.info("  2. Europe            — EUR — PayPal")
  logger.info("  3. US (USD)          — USD — PayPal")
  logger.info("  4. UK                — GBP — PayPal")
  logger.info("  5. Rest of World     — USD — PayPal")
}
