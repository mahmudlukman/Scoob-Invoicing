import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error";
import compression from "compression";
import helmet from "helmet";
import limiter from "./utils/rateLimiter";
import type { CorsOptions } from "cors";
import config from "./config";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import invoiceRouter from "./routes/invoice.route";
import aiRouter from "./routes/ai.route";

export const app = express();
// Load environment variables from .env file
dotenv.config();
// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors => Cross Origin Resource Sharing
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === "development" ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      // Reject requests from non-whitelisted origins
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false
      );
    }
  },
};

// Apply CORS middleware
app.use(cors({ ...corsOptions, credentials: true }));
// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // Only compress responses larger than 1KB
  })
);

// Use Helmet to enhance security by setting various HTTP headers
app.use(helmet());

// Apply rate limiting middleware to prevent excessive requests and enhance security
app.use(limiter);

// routes
app.use("/api/v1", authRouter, userRouter, invoiceRouter, aiRouter);

// testing API
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, message: "API is working" });
});

app.use(errorMiddleware);
