const LOCALE_CURRENCY: Record<string, string> = {
  en: "usd",
  es: "eur",
  fr: "eur",
  de: "eur",
  pt: "brl",
  it: "eur",
  nl: "eur",
  ja: "jpy",
  ko: "krw",
  "zh-CN": "cny",
  ar: "sar",
  hi: "inr",
};

// Currencies that don't use subunits (no cents)
const ZERO_DECIMAL_CURRENCIES = ["jpy", "krw"];

export function getCurrencyForLocale(locale: string): string {
  return LOCALE_CURRENCY[locale] ?? "usd";
}

/**
 * Format a price stored in smallest currency unit (cents) for display.
 * Uses Intl.NumberFormat for proper symbol, placement, and decimals.
 */
export function formatPrice(
  amountInCents: number,
  currency: string,
  locale: string = "en",
  showCurrency: boolean = true,
): string {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase());
  const amount = isZeroDecimal ? amountInCents : amountInCents / 100;

  const intlLocale = locale === "zh-CN" ? "zh-Hans-CN" : locale;

  return new Intl.NumberFormat(intlLocale, {
    style: showCurrency ? "currency" : "decimal",
    ...(showCurrency && { currency: currency.toUpperCase() }),
    minimumFractionDigits: isZeroDecimal ? 0 : 0,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(amount);
}

/**
 * Convert a user-entered dollar amount to cents for storage.
 */
export function toCents(amount: number, currency: string): number {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase());
  return isZeroDecimal ? Math.round(amount) : Math.round(amount * 100);
}

/**
 * Convert cents to a display amount for form inputs.
 */
export function fromCents(cents: number, currency: string): number {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase());
  return isZeroDecimal ? cents : cents / 100;
}
