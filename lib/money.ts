// Deterministic invoice arithmetic. No framework imports so it is unit-testable
// and shared between the UI and the MCP server.
import type { InvoiceLine, InvoiceState, Totals } from "./types";

export function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function money(value: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(value || 0);
}

export function lineNet(line: InvoiceLine) {
  return Math.max(0, line.quantity * line.unitPrice - line.discount);
}

export function lineTax(line: InvoiceLine) {
  return line.taxType === "06" ? 0 : lineNet(line) * (line.taxRate / 100);
}

// Raw (un-rounded) running totals, matching the original in-component memo.
// Callers round only at display/payload time.
export function computeTotals(invoice: Pick<InvoiceState, "lines">): Totals {
  const subtotal = invoice.lines.reduce((sum, line) => sum + lineNet(line), 0);
  const tax = invoice.lines.reduce((sum, line) => sum + lineTax(line), 0);
  const discount = invoice.lines.reduce((sum, line) => sum + line.discount, 0);
  return {
    subtotal,
    tax,
    discount,
    total: subtotal + tax,
  };
}
