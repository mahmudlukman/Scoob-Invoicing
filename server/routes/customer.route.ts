import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customer.controller";
import { isAuthenticated } from "../middleware/auth";

const customerRouter = express.Router();

customerRouter.post("/create-customer", isAuthenticated, createCustomer);
customerRouter.get("/customers", isAuthenticated, getCustomers);
customerRouter.put("/update-customer/:id", isAuthenticated, updateCustomer);
customerRouter.delete("/delete-customer/:id", isAuthenticated, deleteCustomer);

export default customerRouter;
