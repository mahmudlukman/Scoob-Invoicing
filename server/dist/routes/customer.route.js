"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("../controllers/customer.controller");
const auth_1 = require("../middleware/auth");
const customerRouter = express_1.default.Router();
customerRouter.use(auth_1.isAuthenticated, auth_1.requireActiveAccount);
customerRouter.post("/create-customer", customer_controller_1.createCustomer);
customerRouter.get("/customers", customer_controller_1.getCustomers);
customerRouter.put("/update-customer/:id", customer_controller_1.updateCustomer);
customerRouter.delete("/delete-customer/:id", customer_controller_1.deleteCustomer);
exports.default = customerRouter;
