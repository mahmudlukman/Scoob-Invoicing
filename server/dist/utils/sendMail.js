"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resend_1 = require("resend");
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const resend = new resend_1.Resend(config_1.default.RESEND_API_KEY);
const sendMail = async (options) => {
    const { email, subject, template, data } = options;
    // Get the path to the email template
    const templatePath = path_1.default.join(__dirname, "../mails", template);
    // Render with EJS
    const html = await ejs_1.default.renderFile(templatePath, data);
    // Send with Resend
    await resend.emails.send({
        from: "Skoob Invoice <onboarding@resend.dev>",
        to: email,
        subject,
        html,
    });
};
exports.default = sendMail;
