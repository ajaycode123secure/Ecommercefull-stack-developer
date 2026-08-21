   import { Request, Response } from 'express'
import { verifyWebhook } from '@clerk/express/webhooks'
import User from '../models/User'

 export const clerkwebhook = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req)

     

    if (evt.type === 'user.created'|| evt.type === 'user.updated') {
        const user = await User.findOne({ clerkId: evt.data.id })
        const userData = {
            email: evt.data.email_addresses[0].email_address,
            name: evt.data.first_name + ' ' + evt.data.last_name,
            image: evt.data?.image_url,
        }

        if (user) {
            await User.updateOne({ clerkId: evt.data.id }, userData)
        }else {
            await User.create({ clerkId: evt.data.id, ...userData })
        }
        return res.json({ message: 'Webhook received and processed successfully' })
    }

  } catch (err) {
    console.error('Error verifying webhook:', err)
    return res.status(400).json({ error: 'Error verifying webhook' })
  }
}