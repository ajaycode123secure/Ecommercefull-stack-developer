"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerkwebhook = void 0;
const webhooks_1 = require("@clerk/express/webhooks");
const User_1 = __importDefault(require("../models/User"));
const clerkwebhook = async (req, res) => {
    try {
        const evt = await (0, webhooks_1.verifyWebhook)(req);
        if (evt.type === 'user.created' || evt.type === 'user.updated') {
            const user = await User_1.default.findOne({ clerkId: evt.data.id });
            const userData = {
                email: evt.data.email_addresses[0].email_address,
                name: evt.data.first_name + ' ' + evt.data.last_name,
                image: evt.data?.image_url,
            };
            if (user) {
                await User_1.default.updateOne({ clerkId: evt.data.id }, userData);
            }
            else {
                await User_1.default.create({ clerkId: evt.data.id, ...userData });
            }
            return res.json({ message: 'Webhook received and processed successfully' });
        }
        return res.json({ message: 'Webhook received' });
    }
    catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({ error: 'Error verifying webhook' });
    }
};
exports.clerkwebhook = clerkwebhook;
