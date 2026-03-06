const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ruggyland.com"

// Storefront paths — these are the only paths that exist in the app router
export const REGIONS = [
  { countryCode: "us", hreflang: "en-US" },
  { countryCode: "in", hreflang: "en-IN" },
  { countryCode: "gb", hreflang: "en-GB" },
  { countryCode: "de", hreflang: "en-DE" },
  { countryCode: "sg", hreflang: "en-SG" },
] as const

// The 5 regions Google will index
export const INDEXED_REGIONS = ["us", "in", "gb", "de", "sg"]

// Maps any storefront countryCode to its canonical indexed region
export const CANONICAL_REGION_MAP: Record<string, string> = {
  // Indexed regions — canonical to themselves
  us: "us",
  in: "in",
  gb: "gb",
  de: "de",
  sg: "sg",
  // European non-canonical paths (if they exist) → /de
  fr: "de",
  dk: "de",
  at: "de", be: "de", bg: "de", ch: "de", cy: "de",
  cz: "de", ee: "de", es: "de", fi: "de", gr: "de",
  hr: "de", hu: "de", ie: "de", is: "de", it: "de",
  li: "de", lt: "de", lu: "de", lv: "de", mt: "de",
  nl: "de", no: "de", pl: "de", pt: "de", ro: "de",
  se: "de", si: "de", sk: "de",
  // ROW non-canonical paths → /sg
  au: "sg", ca: "sg", nz: "sg", jp: "sg", kr: "sg",
  mx: "sg", br: "sg", ae: "sg", za: "sg",
}

// Regions that should NOT be indexed (add any non-canonical paths here)
export const NOINDEX_REGIONS = new Set([
  "fr", "dk", "au", "ca", "nz", "jp",
  "kr", "mx", "br", "ae", "za",
])

export function getCanonicalRegion(countryCode: string): string {
  return CANONICAL_REGION_MAP[countryCode] ?? "sg"
}

export function getAlternateLanguages(path: string): Record<string, string> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`

  // All European country hreflang tags → /de
  const euTags = [
    "en-AT", "en-BE", "en-BG", "en-CH", "en-CY", "en-CZ",
    "en-DE", "en-DK", "da-DK", "en-EE", "en-ES", "en-FI",
    "en-FR", "en-GR", "en-HR", "en-HU", "en-IE", "en-IS",
    "en-IT", "en-LI", "en-LT", "en-LU", "en-LV", "en-MT",
    "en-NL", "en-NO", "en-PL", "en-PT", "en-RO", "en-SE",
    "en-SI", "en-SK",
  ]

  const languages: Record<string, string> = {}

  // US
  languages["en-US"] = `${BASE_URL}/us${cleanPath}`

  // India
  languages["en-IN"] = `${BASE_URL}/in${cleanPath}`

  // UK
  languages["en-GB"] = `${BASE_URL}/gb${cleanPath}`

  // Europe — all EU country tags point to /de
  euTags.forEach((tag) => {
    languages[tag] = `${BASE_URL}/de${cleanPath}`
  })

  // Rest of World — x-default and all other countries point to /sg
  languages["en-SG"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-AU"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-CA"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-NZ"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-JP"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-KR"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-MX"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-BR"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-AE"] = `${BASE_URL}/sg${cleanPath}`
  languages["en-ZA"] = `${BASE_URL}/sg${cleanPath}`

  // x-default → /sg (Rest of World fallback)
  languages["x-default"] = `${BASE_URL}/sg${cleanPath}`

  return languages
}

export function getAlternates(path: string, countryCode?: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const canonicalRegion = getCanonicalRegion(countryCode ?? "sg")
  return {
    canonical: `${BASE_URL}/${canonicalRegion}${cleanPath}`,
    languages: getAlternateLanguages(cleanPath),
  }
}
