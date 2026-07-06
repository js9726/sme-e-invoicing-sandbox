import { describe, expect, it } from "vitest";
import { computeTotals, lineNet, lineTax, round } from "../money";
import type { InvoiceLine } from "../types";

function line(overrides: Partial<InvoiceLine> = {}): InvoiceLine {
  return {
    id: "l1",
    classification: "002",
    description: "Item",
    quantity: 1,
    unitPrice: 100,
    discount: 0,
    taxType: "02",
    taxRate: 8,
    ...overrides,
  };
}

describe("round", () => {
  it("rounds half up to 2 decimals", () => {
    expect(round(1.005)).toBe(1.01);
  });
  it("keeps clean values unchanged", () => {
    expect(round(2.5)).toBe(2.5);
  });
  it("absorbs float drift", () => {
    expect(round(0.1 + 0.2)).toBe(0.3);
  });
});

describe("lineNet", () => {
  it("subtracts discount from quantity * price", () => {
    expect(lineNet(line({ quantity: 2, unitPrice: 100, discount: 40 }))).toBe(160);
  });
  it("floors at zero when discount exceeds gross", () => {
    expect(lineNet(line({ quantity: 1, unitPrice: 10, discount: 50 }))).toBe(0);
  });
});

describe("lineTax", () => {
  it("is zero for tax type 06 (not applicable)", () => {
    expect(lineTax(line({ quantity: 1, unitPrice: 100, taxType: "06", taxRate: 0 }))).toBe(0);
  });
  it("applies the rate to the net for sales/service tax", () => {
    expect(lineTax(line({ quantity: 2, unitPrice: 100, discount: 40, taxType: "01", taxRate: 5 }))).toBe(8);
  });
});

describe("computeTotals", () => {
  it("sums net, tax, and discount across lines", () => {
    const totals = computeTotals({
      lines: [
        line({ quantity: 2, unitPrice: 100, discount: 40, taxType: "01", taxRate: 5 }), // net 160, tax 8
        line({ quantity: 1, unitPrice: 200, taxType: "06", taxRate: 0 }), // net 200, tax 0
      ],
    });
    expect(totals.subtotal).toBe(360);
    expect(totals.tax).toBe(8);
    expect(totals.discount).toBe(40);
    expect(totals.total).toBe(368);
  });
});
