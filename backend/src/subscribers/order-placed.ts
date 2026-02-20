import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { RESEND_REPLY_TO, META_PIXEL_ID, META_CAPI_ACCESS_TOKEN } from '../lib/constants'
import { sendMetaCapiEvent, hashUserData } from '../lib/meta-capi'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  // Retrieve order with all necessary relations
  const order = await orderModuleService.retrieveOrder(data.id, { 
    relations: ['items', 'summary', 'shipping_address', 'billing_address', 'shipping_methods'] 
  })
  
  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)
  
  // Get billing address (may be same as shipping)
  let billingAddress = shippingAddress
  if (order.billing_address?.id) {
    try {
      billingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.billing_address.id)
    } catch (e) {
      // Fall back to shipping address if billing can't be retrieved
    }
  }

  // Get shipping method name and calculate shipping total from shipping_methods
  let shippingMethod = 'Standard Shipping'
  let shippingTotal = 0
  
  if (order.shipping_methods && order.shipping_methods.length > 0) {
    shippingMethod = order.shipping_methods[0].name || shippingMethod
    // Sum up all shipping method amounts - convert BigNumberValue to number
    shippingTotal = order.shipping_methods.reduce((total, sm) => total + Number(sm.amount || 0), 0)
  }
  
  console.log('📦 Shipping calculated:', { shippingMethod, shippingTotal })

  // Calculate estimated delivery (7 days from now as default)
  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + 7)
  const estimatedDelivery = estimatedDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })

  // Build tracking URL
  const trackingUrl = `https://ruggyland.com/account/orders/${order.id}`

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: RESEND_REPLY_TO || 'support@ruggyland.com',
          subject: `Order Confirmed - #${order.display_id} | RuggyLand`
        },
        order,
        shippingAddress,
        billingAddress,
        shippingMethod,
        shippingTotal,
        estimatedDelivery,
        trackingUrl,
        preview: 'Your RuggyLand order is confirmed! ✅'
      }
    })
    console.log(`Order confirmation email sent to ${order.email} for order #${order.display_id}`)
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }

  // Send Meta Conversions API (CAPI) Purchase event
  if (META_PIXEL_ID && META_CAPI_ACCESS_TOKEN) {
    try {
      const addr = shippingAddress || billingAddress
      const userData = hashUserData({
        email: order.email,
        phone: addr?.phone ?? undefined,
        firstName: addr?.first_name ?? undefined,
        lastName: addr?.last_name ?? undefined,
        city: addr?.city ?? undefined,
        state: addr?.province ?? undefined,
        zip: addr?.postal_code ?? undefined,
        countryCode: addr?.country_code ?? undefined,
        externalId: order.customer_id ?? undefined,
      })

      await sendMetaCapiEvent(META_PIXEL_ID, META_CAPI_ACCESS_TOKEN, {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: `order_${order.id}`,
        action_source: 'website',
        event_source_url: `https://ruggyland.com/order/confirmed/${order.id}`,
        user_data: userData,
        custom_data: {
          currency: order.currency_code?.toUpperCase() || 'USD',
          value: Number(order.summary?.current_order_total || 0),
          content_ids: order.items?.map((item: any) => item.variant_id || item.id) || [],
          content_type: 'product',
          contents: order.items?.map((item: any) => ({
            id: item.variant_id || item.id,
            quantity: item.quantity,
          })) || [],
          num_items: order.items?.length || 0,
        },
      })
      console.log(`Meta CAPI Purchase event sent for order #${order.display_id}`)
    } catch (error) {
      console.error('Error sending Meta CAPI event:', error)
    }
  }

  // Send Slack notification
  try {
    await notificationModuleService.createNotifications({
      to: 'slack-channel',
      channel: 'slack',
      template: 'order-created',
      data: {
        order: {
          id: order.id,
          display_id: order.display_id,
          email: order.email,
          currency_code: order.currency_code,
          subtotal: Number(order.summary?.current_order_total || 0),
          shipping_total: shippingTotal,
          discount_total: 0,
          tax_total: Number((order.summary as any)?.current_order_tax_total || 0),
          total: Number(order.summary?.current_order_total || 0),
          shipping_address: shippingAddress,
          items: order.items?.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            thumbnail: item.thumbnail,
          })),
        },
      },
    })
    console.log(`Slack notification sent for order #${order.display_id}`)
  } catch (error) {
    console.error('Error sending Slack notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
