import { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import User from "../models/User";

export const clerkwebhook = async (req: Request, res: Response) => {
  try {
    console.log("========== CLERK WEBHOOK START ==========");

    const evt = await verifyWebhook(req);

    console.log("Event type:", evt.type);
    console.log("Clerk ID:", evt.data.id);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const email = evt.data.email_addresses?.[0]?.email_address;

      const userData = {
        email: email,
        name: `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim(),
        image: evt.data.image_url || "",
      };

      console.log("User data:", userData);

      const user = await User.findOne({
        clerkId: evt.data.id,
      });

      console.log("Existing user:", user);

      if (user) {
        await User.updateOne(
          { clerkId: evt.data.id },
          userData
        );

        console.log("User updated successfully");
      } else {
        const newUser = await User.create({
          clerkId: evt.data.id,
          ...userData,
        });

        console.log("User created successfully:", newUser);
      }

      console.log("========== CLERK WEBHOOK END ==========");

      return res.status(200).json({
        message: "Webhook received and processed successfully",
      });
    }

    return res.status(200).json({
      message: "Webhook received",
    });
  } catch (err) {
    console.error("ERROR:", err);

    return res.status(400).json({
      error: "Error verifying webhook",
    });
  }
};