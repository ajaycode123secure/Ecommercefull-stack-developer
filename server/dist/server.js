"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_js_1 = __importDefault(require("./config/db.js"));
const express_2 = require("@clerk/express");
const webhooks_js_1 = require("./controllers/webhooks.js");
const app = (0, express_1.default)();
// Enable trust proxy for reverse proxy platforms like Render/Vercel
app.set("trust proxy", 1);
//Connect to MongoDB
(0, db_js_1.default)();
// Clerk Webhook endpoint - needs raw body for signature verification
app.post("/api/webhooks", express_1.default.raw({ type: 'application/json' }), webhooks_js_1.clerkwebhook);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("Server is running!");
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Clerk Publishable Key is: ${process.env.CLERK_PUBLISHABLE_KEY ? "Loaded ✅" : "Missing ❌"}`);
    console.log(`Clerk Secret Key is: ${process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY !== "<your_clerk_secret_key>" ? "Loaded ✅" : "Missing/Placeholder ❌"}`);
});
