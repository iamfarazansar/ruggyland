import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()

  const disallow = ["/checkout", "/checkout/*", "/account", "/account/*", "/api/*", "/order/*"]

  return {
    rules: [
      // Explicitly allow Google AI Overviews crawler
      { userAgent: "Google-Extended", allow: "/" },
      // Explicitly allow ChatGPT/OpenAI crawler
      { userAgent: "GPTBot", allow: "/" },
      // Explicitly allow Perplexity crawler
      { userAgent: "PerplexityBot", allow: "/" },
      // Explicitly allow Anthropic/Claude crawler
      { userAgent: "ClaudeBot", allow: "/" },
      // All other bots — allow site, block private paths
      {
        userAgent: "*",
        allow: ["/us/", "/in/", "/gb/", "/de/", "/sg/"],
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
