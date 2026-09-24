import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customer.controller";
import { isAuthenticated, requireActiveAccount } from "../middleware/auth";

const customerRouter = express.Router();

customerRouter.use(isAuthenticated, requireActiveAccount);

customerRouter.post("/create-customer", createCustomer);
customerRouter.get("/customers", getCustomers);
customerRouter.put("/update-customer/:id", updateCustomer);
customerRouter.delete("/delete-customer/:id", deleteCustomer);

export default customerRouter;
