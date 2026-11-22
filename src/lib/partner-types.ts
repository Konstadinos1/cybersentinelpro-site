/** Kept free of zod so the partner drawer does not pull the validator into the browser. */
export const PARTNER_TYPES = ["accounting_firm", "msp", "fractional_cto", "privacy_counsel", "other"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];
