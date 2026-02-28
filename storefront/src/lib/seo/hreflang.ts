const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ruggyland.com"

// All active storefront regions — keep in sync with Medusa Admin regions
export const REGIONS = [
  { countryCode: "us", hreflang: "en-US" },
  { countryCode: "in", hreflang: "en-IN" },
  { countryCode: "au", hreflang: "en-AU" },
  { countryCode: "ca", hreflang: "en-CA" },
  { countryCode: "de", hreflang: "en-DE" }, // English content for now; change to de-DE if localized
  { countryCode: "fr", hreflang: "en-FR" }, // English content for now; change to fr-FR if localized
  { countryCode: "ae", hreflang: "en-AE" },
  { countryCode: "sg", hreflang: "en-SG" },
  { countryCode: "nz", hreflang: "en-NZ" },
  { countryCode: "za", hreflang: "en-ZA" },
  { countryCode: "jp", hreflang: "en-JP" },
  { countryCode: "kr", hreflang: "en-KR" },
  { countryCode: "mx", hreflang: "en-MX" },
  { countryCode: "br", hreflang: "en-BR" },
  { countryCode: "gb", hreflang: "en-GB" }, // Medusa ISO code for UK region
] as const

// Canonical region — all duplicate regional pages point here
const CANONICAL_REGION = "us"

/**
 * Returns the canonical URL for a given path.
 * Always points to the /us/ version.
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${BASE_URL}/${CANONICAL_REGION}${cleanPath}`
}

/**
 * Returns Next.js `alternates.languages` object for hreflang.
 * Pass the path WITHOUT the region prefix, e.g. "/products/shanks-rug"
 */
export function getAlternateLanguages(path: string): Record<string, string> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const languages: Record<string, string> = {}

  REGIONS.forEach(({ countryCode, hreflang }) => {
    languages[hreflang] = `${BASE_URL}/${countryCode}${cleanPath}`
  })

  // x-default points to the canonical region
  languages["x-default"] = `${BASE_URL}/${CANONICAL_REGION}${cleanPath}`

  return languages
}

/**
 * Returns full Next.js `alternates` object ready for generateMetadata.
 * Pass the path WITHOUT the region prefix, e.g. "/products/shanks-rug"
 */
export function getAlternates(path: string) {
  return {
    canonical: getCanonicalUrl(path),
    languages: getAlternateLanguages(path),
  }
}
