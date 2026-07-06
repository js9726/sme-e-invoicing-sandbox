import { describe, expect, it } from "vitest";
import { computeTotals, round } from "../money";
import { buildPayload, computeReference, hashValue } from "../payload";
import { sampleInvoice } from "../templates";
import { validate } from "../validate";

function build(key: Parameters<typeof sampleInvoice>[0]) {
  const invoice = sampleInvoice(key);
  const totals = computeTotals(invoice);
  const validation = validate(invoice, totals);
  const reference = computeReference(invoice, totals.total);
  return {
    invoice,
    totals,
    reference,
    payload: buildPayload({ invoice, totals, validation, reference, generatedAt: "test-clock" }),
  };
}

describe("hashValue", () => {
  it("is deterministic for the same input", () => {
    expect(hashValue("awan-kopi-2026")).toBe(hashValue("awan-kopi-2026"));
  });
  it("returns an 8-char token", () => {
    expect(hashValue("anything")).toHaveLength(8);
  });
});

describe("buildPayload", () => {
  it("carries the document type code", () => {
    expect(build("services").payload.document.eInvoiceTypeCode).toBe("01");
  });
  it("emits one payload line per invoice line", () => {
    const { invoice, payload } = build("retail");
    expect(payload.document.invoiceLines).toHaveLength(invoice.lines.length);
  });
  it("rounds the payable total to 2 decimals", () => {
    const { totals, payload } = build("services");
    expect(payload.document.legalMonetaryTotal.payableAmount).toBe(round(totals.total));
  });
  it("uses the computed reference as the code number", () => {
    const { reference, payload } = build("services");
    expect(payload.document.eInvoiceCodeNumber).toBe(reference);
  });
});
