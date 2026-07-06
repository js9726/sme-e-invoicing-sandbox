import { describe, expect, it } from "vitest";
import { computeTotals } from "../money";
import { sampleInvoice } from "../templates";
import { validate } from "../validate";

describe("validate", () => {
  it("gives a clean service invoice a perfect score", () => {
    const invoice = sampleInvoice("services");
    const result = validate(invoice, computeTotals(invoice));
    expect(result.failCount).toBe(0);
    expect(result.score).toBe(100);
  });

  it("passes a walk-in general-public buyer without a real TIN", () => {
    const invoice = sampleInvoice("grab");
    const result = validate(invoice, computeTotals(invoice));
    expect(result.failCount).toBe(0);
  });

  it("costs 14 points for a single failed check", () => {
    const invoice = sampleInvoice("services");
    invoice.supplier = { ...invoice.supplier, tin: "" };
    const result = validate(invoice, computeTotals(invoice));
    expect(result.failCount).toBe(1);
    expect(result.score).toBe(86);
  });

  it("costs 5 points for a warning (invalid buyer email)", () => {
    const invoice = sampleInvoice("services");
    invoice.supplier = { ...invoice.supplier, tin: "" };
    invoice.buyer = { ...invoice.buyer, email: "not-an-email" };
    const result = validate(invoice, computeTotals(invoice));
    expect(result.failCount).toBe(1);
    expect(result.warnCount).toBe(1);
    expect(result.score).toBe(81);
  });

  it("never returns a negative score", () => {
    const invoice = sampleInvoice("services");
    invoice.supplier = { ...invoice.supplier, tin: "", postcode: "" };
    invoice.buyer = { ...invoice.buyer, tin: "x", postcode: "", email: "bad" };
    invoice.lines = [{ ...invoice.lines[0], description: "", quantity: 0, unitPrice: 0, taxType: "01", taxRate: -1 }];
    const result = validate(invoice, computeTotals(invoice));
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
