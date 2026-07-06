import { describe, expect, it } from "vitest";
import { computeTotals } from "../money";
import { sampleInvoice } from "../templates";
import type { TemplateKey } from "../types";
import { validate } from "../validate";

const templates: TemplateKey[] = ["services", "retail", "grab", "hawker", "rental", "credit"];

describe("sampleInvoice", () => {
  it.each(templates)("%s produces a payable, validation-clean invoice", (key) => {
    const invoice = sampleInvoice(key);
    const totals = computeTotals(invoice);
    expect(totals.total).toBeGreaterThan(0);
    expect(validate(invoice, totals).failCount).toBe(0);
  });

  it("marks a credit template as document type 02", () => {
    expect(sampleInvoice("credit").typeCode).toBe("02");
  });
});
