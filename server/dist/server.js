"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const cloudinary_1 = require("cloudinary");
const db_1 = __importDefault(require("./utils/db"));
const config_1 = __importDefault(require("./config"));
// cloudinary config
cloudinary_1.v2.config({
    cloud_name: config_1.default.CLOUDINARY_CLOUD_NAME,
    api_key: config_1.default.CLOUDINARY_API_KEY,
    api_secret: config_1.default.CLOUDINARY_API_SECRET,
});
// create server
app_1.app.listen(config_1.default.PORT, () => {
    console.log(`Server is connected with port ${config_1.default.PORT}`);
    (0, db_1.default)();
});
