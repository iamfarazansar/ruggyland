import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, ICustomerModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { RESEND_REPLY_TO } from '../lib/constants'

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER)
  
  const customer = await customerModuleService.retrieveCustomer(data.id)

  // Don't send welcome email if customer doesn't have an email
  if (!customer.email) {
    console.log('Customer created without email, skipping welcome email')
    return
  }

  try {
    await notificationModuleService.createNotifications({
      to: customer.email,
      channel: 'email',
      template: EmailTemplates.CUSTOMER_CREATED,
      data: {
        emailOptions: {
          replyTo: RESEND_REPLY_TO || 'info@ruggyland.com',
          subject: 'Welcome to RuggyLand! 🎉'
        },
        customer,
        preview: 'Welcome to RuggyLand!'
      }
    })
    console.log(`Welcome email sent to ${customer.email}`)
  } catch (error) {
    console.error('Error sending customer welcome notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'customer.created'
}
