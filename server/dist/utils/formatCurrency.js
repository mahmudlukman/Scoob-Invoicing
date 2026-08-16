"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addThousandsSeparator = void 0;
const addThousandsSeparator = (num, decimalPlaces = 2) => {
    if (num == null)
        return "";
    const parsedNum = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(parsedNum))
        return "";
    const fixedString = parsedNum.toFixed(decimalPlaces);
    const [integerPart, fractionalPart] = fixedString.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fractionalPart
        ? `${formattedInteger}.${fractionalPart}`
        : formattedInteger;
};
exports.addThousandsSeparator = addThousandsSeparator;
