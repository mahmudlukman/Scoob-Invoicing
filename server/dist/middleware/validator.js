"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateChangePassword = exports.validateUserLogin = exports.validateUserRegistration = void 0;
const express_validator_1 = require("express-validator");
exports.validateUserRegistration = [
    (0, express_validator_1.check)("name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Name is missing")
        .isLength({ min: 3, max: 49 })
        .withMessage("Name must be 3 to 49 characters Long!"),
    (0, express_validator_1.check)("email").normalizeEmail().isEmail().withMessage("Email is invalid"),
    (0, express_validator_1.check)("password")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Password is Missing!")
        .isLength({ min: 6, max: 20 })
        .withMessage("Password must be 8 to 20 characters Long!"),
];
exports.validateUserLogin = [
    (0, express_validator_1.check)("email").normalizeEmail().isEmail().withMessage("Invalid email"),
    (0, express_validator_1.check)("password").trim().notEmpty().withMessage("Password is required"),
];
exports.validateChangePassword = [
    (0, express_validator_1.check)("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 8 characters"),
];
const validate = (req, res, next) => {
    const error = (0, express_validator_1.validationResult)(req).array();
    if (!error.length)
        return next();
    res.status(400).json({ success: false, message: error[0].msg });
};
exports.validate = validate;
