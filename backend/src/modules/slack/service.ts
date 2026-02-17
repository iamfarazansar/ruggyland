import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import axios from "axios"
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

type Options = {
  webhook_url: string
  admin_url: string
}

type OrderData = {
  id: string
  display_id?: number
  email?: string
  currency_code: string
  subtotal?: number
  shipping_total?: number
  discount_total?: number
  tax_total?: number
  total?: number
  shipping_address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    city?: string
    country_code?: string
  }
  items?: {
    title: string
    quantity: number
    unit_price: number
    thumbnail?: string | null
  }[]
}

class SlackNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "slack"
  protected options: Options

  constructor(container: Record<string, unknown>, options: Options) {
    super()
    this.options = options
  }

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.webhook_url) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        "Slack webhook_url is required"
      )
    }
    if (!options.admin_url) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        "Slack admin_url is required"
      )
    }
  }

  private formatCurrency(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount)
  }

  private async sendOrderNotification(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const order = notification.data?.order as OrderData | undefined
    if (!order) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found in notification data")
    }

    const currency = order.currency_code
    const blocks: Record<string, unknown>[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:shopping_trolley: Order *<${this.options.admin_url}/orders/${order.id}|#${order.display_id}>* has been placed!`,
        },
      },
    ]

    // Customer & shipping info
    const addr = order.shipping_address
    if (addr) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `*Customer*`,
            `${addr.first_name || ""} ${addr.last_name || ""}`.trim(),
            order.email || "",
            "",
            `*Ship to*`,
            addr.address_1 || "",
            `${addr.city || ""}, ${(addr.country_code || "").toUpperCase()}`,
          ].join("\n"),
        },
      })
    }

    // Order totals
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `*Subtotal*\t${this.formatCurrency(Number(order.subtotal || 0), currency)}`,
          `*Shipping*\t${this.formatCurrency(Number(order.shipping_total || 0), currency)}`,
          `*Discount*\t${this.formatCurrency(Number(order.discount_total || 0), currency)}`,
          `*Tax*\t${this.formatCurrency(Number(order.tax_total || 0), currency)}`,
          `*Total*\t${this.formatCurrency(Number(order.total || 0), currency)}`,
        ].join("\n"),
      },
    })

    // Line items
    if (order.items?.length) {
      blocks.push({ type: "divider" })
      for (const item of order.items) {
        const line: Record<string, unknown> = {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${item.title}*\n${item.quantity} x ${this.formatCurrency(Number(item.unit_price), currency)}`,
          },
        }
        if (item.thumbnail) {
          line.accessory = {
            type: "image",
            alt_text: item.title,
            image_url: item.thumbnail,
          }
        }
        blocks.push(line)
      }
    }

    await axios.post(this.options.webhook_url, {
      text: `New order #${order.display_id} placed`,
      blocks,
    })

    return { id: order.id }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    switch (notification.template) {
      case "order-created":
        return this.sendOrderNotification(notification)
      default:
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Slack template "${notification.template}" not supported`
        )
    }
  }
}

export default SlackNotificationProviderService
