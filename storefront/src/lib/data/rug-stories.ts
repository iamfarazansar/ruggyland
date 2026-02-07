"use server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export type StoryStep = {
  title: string
  description: string
  image_url: string
}

export type RugStory = {
  id: string
  title: string
  slug: string
  subtitle: string | null
  thumbnail: string | null
  size: string | null
  material: string | null
  intro_text: string | null
  steps: StoryStep[]
  published: boolean
  created_at: string
  updated_at: string
}

export const listRugStories = async (): Promise<{
  stories: RugStory[]
  count: number
}> => {
  try {
    const response = await fetch(`${BACKEND_URL}/store/rug-stories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: {
        revalidate: 60,
      },
    })

    if (!response.ok) {
      console.error(
        "Rug stories API error:",
        response.status,
        response.statusText
      )
      return { stories: [], count: 0 }
    }

    const data = await response.json()
    return data as { stories: RugStory[]; count: number }
  } catch (error) {
    console.error("Error fetching rug stories:", error)
    return { stories: [], count: 0 }
  }
}

export const getRugStory = async (slug: string): Promise<RugStory | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/store/rug-stories/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: {
        revalidate: 60,
      },
    })

    if (!response.ok) {
      console.error(
        "Rug story API error:",
        response.status,
        response.statusText
      )
      return null
    }

    const data = await response.json()
    return data.story as RugStory
  } catch (error) {
    console.error("Error fetching rug story:", error)
    return null
  }
}
