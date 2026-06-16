export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password: string) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Please must be at least 6 characters";
  return "";
};

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "U";
  return name.trim().charAt(0).toUpperCase();
}

export const addThousandsSeparator = (
  num: number | string,
  decimalPlaces: number = 2,
): string => {
  if (num == null) return "";

  // 1. Convert to a numeric value safely
  const parsedNum = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(parsedNum)) return "";

  // 2. Enforce fixed decimal points strictly on the number first to preserve trailing zeros
  const fixedString = parsedNum.toFixed(decimalPlaces);

  // 3. Split into whole and decimal parts
  const [integerPart, fractionalPart] = fixedString.split(".");

  // 4. Add commas to the integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // 5. Reconstruct the currency string
  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};

export const currency = "₦";
