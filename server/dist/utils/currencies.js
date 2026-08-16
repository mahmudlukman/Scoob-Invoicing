"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrencyByCode = exports.DEFAULT_CURRENCY = exports.SUPPORTED_CURRENCIES = void 0;
exports.SUPPORTED_CURRENCIES = [
    { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
    { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "AU$", name: "Australian Dollar" },
];
exports.DEFAULT_CURRENCY = exports.SUPPORTED_CURRENCIES[0];
const getCurrencyByCode = (code) => exports.SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? exports.DEFAULT_CURRENCY;
exports.getCurrencyByCode = getCurrencyByCode;
