import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express , { Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express';
import { clerkwebhook } from "./controllers/webhooks.js";

const app = express();
//Connect to MongoDB
connectDB();

// Clerk Webhook endpoint - needs raw body for signature verification
app.post("/api/webhooks", express.raw({ type: 'application/json' }), clerkwebhook);

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Clerk Publishable Key is: ${process.env.CLERK_PUBLISHABLE_KEY ? "Loaded ✅" : "Missing ❌"}`);
  console.log(`Clerk Secret Key is: ${process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY !== "<your_clerk_secret_key>" ? "Loaded ✅" : "Missing/Placeholder ❌"}`);
});