import { check, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

export const validateUserRegistration = [
  check("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Name is missing")
    .isLength({ min: 3, max: 49 })
    .withMessage("Name must be 3 to 49 characters Long!"),
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is Missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters Long!"),
];

export const validateUserLogin = [
  check("email").normalizeEmail().isEmail().withMessage("Invalid email"),
  check("password").trim().notEmpty().withMessage("Password is required"),
];

export const validateChangePassword = [
  check("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];


export const validate = (req: Request, res: Response, next: NextFunction) => {
  const error = validationResult(req).array();
  if (!error.length) return next();

  res.status(400).json({ success: false, message: error[0].msg });
};
