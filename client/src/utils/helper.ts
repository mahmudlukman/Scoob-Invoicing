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

export const addThousandsSeparator = (num: number) => {
  if (num == null || isNaN(num)) return "";

  const [integerPart, fractionalPart] = num.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};

