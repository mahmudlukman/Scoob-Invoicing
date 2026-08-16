export const addThousandsSeparator = (
  num: number | string,
  decimalPlaces: number = 2,
): string => {
  if (num == null) return "";

  const parsedNum = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(parsedNum)) return "";

  const fixedString = parsedNum.toFixed(decimalPlaces);
  const [integerPart, fractionalPart] = fixedString.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};
