// --------------------------------------------------
// Auth Validation Helpers
// --------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;
const MIN_NAME_LENGTH = 3;

const DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "throwaway.com",
  "throwawaymail.com",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "yopmail.com",
  "temp-mail.org",
  "trashmail.com",
  "dropmail.me",
];

// --------------------------------------------------
// Field-level validators
// --------------------------------------------------

export const validateFullName = (fullName: string): string | null => {
  const trimmed = fullName.trim();
  if (!trimmed) return "Please enter your full name.";
  if (trimmed.length < MIN_NAME_LENGTH) {
    return `Full name must be at least ${MIN_NAME_LENGTH} characters.`;
  }
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return "Full name can only contain letters, spaces, hyphens and apostrophes.";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) return "Please enter your email address.";
  if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address.";
  return null;
};

export const validateSignUpEmail = (email: string): string | null => {
  const baseError = validateEmail(email);
  if (baseError) return baseError;

  const domain = email.trim().toLowerCase().split("@")[1];
  if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
    return "Please use a permanent email address.";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Please enter a password.";
  const trimmedLength = password.trim().length;
  if (trimmedLength < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (trimmedLength > MAX_PASSWORD_LENGTH) {
    return `Password must be no more than ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
};

export const validateLoginPassword = (password: string): string | null => {
  if (!password) return "Please enter your password.";
  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): string | null => {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
};

// --------------------------------------------------
// Form-level validators
// --------------------------------------------------

export const validateSignUpForm = (
  fullName: string,
  email: string,
  password: string,
): string | null =>
  validateFullName(fullName) ||
  validateSignUpEmail(email) ||
  validatePassword(password) ||
  null;

export const validateLoginForm = (
  email: string,
  password: string,
): string | null =>
  validateEmail(email) || validateLoginPassword(password) || null;

export const validateResetPasswordForm = (
  password: string,
  confirmPassword: string,
): string | null =>
  validatePassword(password) ||
  validateConfirmPassword(password, confirmPassword) ||
  null;

export const validateForgotPasswordForm = (email: string): string | null =>
  validateEmail(email) || null;

// --------------------------------------------------
// Field-level validator map
// --------------------------------------------------

export const validateAllSignUpFields = (fields: {
  fullName: string;
  email: string;
  password: string;
}) => ({
  fullName: validateFullName(fields.fullName),
  email: validateEmail(fields.email),
  password: validatePassword(fields.password),
});

export const validateAllLoginFields = (fields: {
  email: string;
  password: string;
}) => ({
  email: validateEmail(fields.email),
  password: validateLoginPassword(fields.password),
});

// --------------------------------------------------
// Backend error message passthrough
// --------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAuthErrorMessage = (err: any): string => {
  return err?.data?.message || "Something went wrong. Please try again.";
};
