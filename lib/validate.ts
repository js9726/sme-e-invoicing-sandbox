// Readiness scoring for SME invoices. Behaviour matches the original in-component
// validate(): each fail costs 14 points, each warn costs 5, floored at 0.
import { GENERAL_PUBLIC_TIN, type InvoiceState, type ValidationItem } from "./types";

export type ValidationResult = {
  items: ValidationItem[];
  score: number;
  failCount: number;
  warnCount: number;
};

export function validate(
  invoice: InvoiceState,
  totals: { subtotal: number; total: number }
): ValidationResult {
  const tinPattern = /^[A-Z0-9]{8,14}$/;
  const postcodePattern = /^\d{5}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const buyerIsGeneralPublic = invoice.buyer.tin === GENERAL_PUBLIC_TIN;

  const items: ValidationItem[] = [
    {
      label: invoice.supplier.idType === "BRN" ? "Your company details" : "Your personal seller details",
      status:
        invoice.supplier.name && tinPattern.test(invoice.supplier.tin) && invoice.supplier.idValue
          ? "pass"
          : "fail",
    },
    {
      label: buyerIsGeneralPublic ? "Walk-in customer mode" : "Customer e-Invoice details",
      status: buyerIsGeneralPublic
        ? invoice.buyer.idType === "NA" && invoice.buyer.idValue === "NA"
          ? "pass"
          : "fail"
        : invoice.buyer.name && tinPattern.test(invoice.buyer.tin) && invoice.buyer.idValue
          ? "pass"
          : "fail",
    },
    {
      label: "Postcodes look valid",
      status:
        postcodePattern.test(invoice.supplier.postcode) && postcodePattern.test(invoice.buyer.postcode)
          ? "pass"
          : "fail",
    },
    {
      label: "Email receipt ready",
      status: buyerIsGeneralPublic
        ? emailPattern.test(invoice.supplier.email)
          ? "pass"
          : "warn"
        : emailPattern.test(invoice.supplier.email) && emailPattern.test(invoice.buyer.email)
          ? "pass"
          : "warn",
    },
    {
      label: "At least one item",
      status: invoice.lines.length > 0 ? "pass" : "fail",
    },
    {
      label: "Item name, quantity, price",
      status: invoice.lines.every((line) => line.description && line.quantity > 0 && line.unitPrice > 0)
        ? "pass"
        : "fail",
    },
    {
      label: "Tax setting makes sense",
      status: invoice.lines.every((line) => (line.taxType === "06" ? line.taxRate === 0 : line.taxRate >= 0))
        ? "pass"
        : "fail",
    },
    {
      label: "Total is more than zero",
      status: totals.total > 0 ? "pass" : "fail",
    },
  ];

  const failCount = items.filter((item) => item.status === "fail").length;
  const warnCount = items.filter((item) => item.status === "warn").length;
  const score = Math.max(0, 100 - failCount * 14 - warnCount * 5);

  return { items, score, failCount, warnCount };
}
