import { describe, expect, it } from "vitest";
import { amountFromText, templateFromText } from "../parse";

describe("templateFromText", () => {
  it("routes refunds to a credit note", () => {
    expect(templateFromText("refund customer RM120 wrong size")).toBe("credit");
  });
  it("routes platform work to grab", () => {
    expect(templateFromText("Grab ride to airport")).toBe("grab");
  });
  it("routes food sales to hawker", () => {
    expect(templateFromText("sold nasi lemak at the stall")).toBe("hawker");
  });
  it("routes room income to rental", () => {
    expect(templateFromText("monthly room rental for tenant")).toBe("rental");
  });
  it("routes stock to retail", () => {
    expect(templateFromText("sold a carton of stock")).toBe("retail");
  });
  it("falls back to services", () => {
    expect(templateFromText("monthly bookkeeping work")).toBe("services");
  });
});

describe("amountFromText", () => {
  it("reads an RM-prefixed integer", () => {
    expect(amountFromText("I sold service RM1800")).toBe(1800);
  });
  it("reads a MYR decimal amount", () => {
    expect(amountFromText("myr 65.50 fare")).toBe(65.5);
  });
  it("returns null when there is no number", () => {
    expect(amountFromText("no price here")).toBeNull();
  });
});
