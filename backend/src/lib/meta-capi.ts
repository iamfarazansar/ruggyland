import { createHash } from "crypto"

const GRAPH_API_VERSION = "v21.0"

function sha256(value: string): string {
  return createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex")
}

type UserData = {
  em?: string
  ph?: string
  fn?: string
  ln?: string
  ct?: string
  st?: string
  zp?: string
  country?: string
  client_ip_address?: string
  client_user_agent?: string
  fbc?: string
  fbp?: string
  external_id?: string
}

type EventData = {
  event_name: string
  event_time: number
  event_id: string
  event_source_url?: string
  action_source: "website"
  user_data: UserData
  custom_data?: Record<string, any>
}

export async function sendMetaCapiEvent(
  pixelId: string,
  accessToken: string,
  event: EventData
) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [event],
      access_token: accessToken,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      `Meta CAPI error ${response.status}: ${JSON.stringify(error)}`
    )
  }

  return response.json()
}

export function hashUserData(raw: {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  zip?: string
  countryCode?: string
  ip?: string
  userAgent?: string
  externalId?: string
}): UserData {
  const data: UserData = {}

  if (raw.email) data.em = sha256(raw.email)
  if (raw.phone) data.ph = sha256(raw.phone.replace(/[^0-9]/g, ""))
  if (raw.firstName) data.fn = sha256(raw.firstName)
  if (raw.lastName) data.ln = sha256(raw.lastName)
  if (raw.city) data.ct = sha256(raw.city)
  if (raw.state) data.st = sha256(raw.state)
  if (raw.zip) data.zp = sha256(raw.zip)
  if (raw.countryCode) data.country = sha256(raw.countryCode)
  if (raw.ip) data.client_ip_address = raw.ip
  if (raw.userAgent) data.client_user_agent = raw.userAgent
  if (raw.externalId) data.external_id = sha256(raw.externalId)

  return data
}
