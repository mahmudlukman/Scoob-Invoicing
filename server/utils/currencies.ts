export interface CurrencyOption {
  code: string; // ISO 4217
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
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

export const DEFAULT_CURRENCY: CurrencyOption = SUPPORTED_CURRENCIES[0];

export const getCurrencyByCode = (code?: string): CurrencyOption =>
  SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
