"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("../controllers/customer.controller");
const auth_1 = require("../middleware/auth");
const customerRouter = express_1.default.Router();
customerRouter.post("/create-customer", auth_1.isAuthenticated, customer_controller_1.createCustomer);
customerRouter.get("/customers", auth_1.isAuthenticated, customer_controller_1.getCustomers);
customerRouter.put("/update-customer/:id", auth_1.isAuthenticated, customer_controller_1.updateCustomer);
customerRouter.delete("/delete-customer/:id", auth_1.isAuthenticated, customer_controller_1.deleteCustomer);
exports.default = customerRouter;
