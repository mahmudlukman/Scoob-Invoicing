"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV,
    WHITELIST_ORIGINS: process.env.WHITELIST_ORIGINS,
    FRONTEND_URL: process.env.FRONTEND_URL,
    DB_URL: process.env.DB_URL,
    ACTIVATION_SECRET: process.env.ACTIVATION_SECRET,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    JWT_EXPIRES: process.env.JWT_EXPIRES,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
    defaultResLimit: 20,
    defaultResOffset: 0,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SERVICE: process.env.SMTP_SERVICE,
    SMTP_MAIL: process.env.SMTP_MAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
};
exports.default = config;
