"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const rateLimiter_1 = require("./utils/rateLimiter");
const config_1 = __importDefault(require("./config"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const invoice_route_1 = __importDefault(require("./routes/invoice.route"));
const ai_route_1 = __importDefault(require("./routes/ai.route"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
const csrf_1 = require("./middleware/csrf");
exports.app = (0, express_1.default)();
// Load environment variables from .env file
dotenv_1.default.config();
// body parser
exports.app.use(express_1.default.json({ limit: "50mb" }));
// cookie parser
exports.app.use((0, cookie_parser_1.default)());
// cors => Cross Origin Resource Sharing
const corsOptions = {
    origin(origin, callback) {
        if (config_1.default.NODE_ENV === "development" ||
            !origin ||
            config_1.default.WHITELIST_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
            // Reject requests from non-whitelisted origins
            callback(new Error(`CORS error: ${origin} is not allowed by CORS`), false);
        }
    },
};
// Apply CORS middleware
exports.app.use((0, cors_1.default)({ ...corsOptions, credentials: true }));
// Enable response compression to reduce payload size and improve performance
exports.app.use((0, compression_1.default)({
    threshold: 1024, // Only compress responses larger than 1KB
}));
// Use Helmet to enhance security by setting various HTTP headers
exports.app.use((0, helmet_1.default)());
// CSRF protection
exports.app.use(csrf_1.generateCSRFToken);
// Apply rate limiting middleware to prevent excessive requests and enhance security
exports.app.use(rateLimiter_1.limiter);
// routes
exports.app.use("/api/v1", auth_route_1.default, user_route_1.default, invoice_route_1.default, ai_route_1.default, analytics_route_1.default);
// testing API
exports.app.get("/test", (req, res, next) => {
    res.status(200).json({ success: true, message: "API is working" });
});
exports.app.use(error_1.errorMiddleware);
