"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCSRFToken = exports.csrfProtection = void 0;
const crypto = __importStar(require("crypto"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const config_1 = __importDefault(require("../config"));
const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }
    // Skip in development
    if (config_1.default.NODE_ENV !== "production") {
        return next();
    }
    const csrfToken = req.headers["x-csrf-token"] || req.body._csrf;
    if (!csrfToken) {
        return next(new errorHandler_1.default("CSRF token missing", 403));
    }
    // Validate CSRF token from cookie
    const cookieToken = req.cookies["csrf_token"];
    if (!cookieToken || csrfToken !== cookieToken) {
        return next(new errorHandler_1.default("Invalid CSRF token", 403));
    }
    next();
};
exports.csrfProtection = csrfProtection;
// Generate CSRF token middleware
const generateCSRFToken = (req, res, next) => {
    if (!req.cookies["csrf_token"]) {
        const token = crypto.randomBytes(32).toString("hex");
        res.cookie("csrf_token", token, {
            httpOnly: false, // Must be accessible by JavaScript
            secure: config_1.default.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
    }
    next();
};
exports.generateCSRFToken = generateCSRFToken;
