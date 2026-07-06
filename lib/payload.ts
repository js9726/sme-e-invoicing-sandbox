// MyInvois-style sandbox payload builder. Deterministic given its inputs so the
// UI, tests, and MCP server all produce identical JSON.
import { lineNet, lineTax, round } from "./money";
import {
  invoiceTypes,
  paymentModes,
  taxTypes,
  type InvoiceState,
  type Party,
  type Totals,
} from "./types";
import type { ValidationResult } from "./validate";

export function hashValue(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
}

export function computeReference(invoice: InvoiceState, total: number) {
  return `${invoice.internalRef}-${hashValue(
    `${invoice.supplier.tin}-${invoice.buyer.tin}-${invoice.issueDate}-${total}`
  )}`;
}

export function normalizeParty(party: Party) {
  return {
    name: party.name,
    tin: party.tin,
    idType: party.idType,
    idValue: party.idValue,
    sstRegistrationNumber: party.sst || "NA",
    email: party.email,
    phone: party.phone,
    msicCode: party.msic,
    address: {
      line1: party.address1,
      city: party.city,
      state: party.state,
      postcode: party.postcode,
      country: "MYS",
    },
  };
}

export type BuildPayloadArgs = {
  invoice: InvoiceState;
  totals: Totals;
  validation: ValidationResult;
  reference: string;
  generatedAt: string;
};

export function buildPayload({ invoice, totals, validation, reference, generatedAt }: BuildPayloadArgs) {
  return {
    sandbox: true,
    standard: "LHDN MyInvois-style sandbox payload",
    caution: "For resume/demo validation only. This app does not submit to LHDN.",
    document: {
      eInvoiceVersion: "1.1",
      eInvoiceTypeCode: invoice.typeCode,
      eInvoiceTypeName: invoiceTypes[invoice.typeCode],
      eInvoiceCodeNumber: reference,
      issueDate: invoice.issueDate,
      issueTime: invoice.issueTime,
      documentCurrencyCode: invoice.currency,
      paymentMode: invoice.paymentMode,
      paymentModeName: paymentModes[invoice.paymentMode],
      supplier: normalizeParty(invoice.supplier),
      buyer: normalizeParty(invoice.buyer),
      invoiceLines: invoice.lines.map((line, index) => ({
        lineId: index + 1,
        classification: line.classification,
        description: line.description,
        quantity: line.quantity,
        unitPrice: round(line.unitPrice),
        discountAmount: round(line.discount),
        lineExtensionAmount: round(lineNet(line)),
        taxType: line.taxType,
        taxTypeName: taxTypes[line.taxType],
        taxRate: line.taxRate,
        taxAmount: round(lineTax(line)),
        payableAmount: round(lineNet(line) + lineTax(line)),
      })),
      taxTotal: {
        taxAmount: round(totals.tax),
        taxableAmount: round(totals.subtotal),
      },
      legalMonetaryTotal: {
        lineExtensionAmount: round(totals.subtotal),
        allowanceTotalAmount: round(totals.discount),
        taxExclusiveAmount: round(totals.subtotal),
        taxInclusiveAmount: round(totals.total),
        payableAmount: round(totals.total),
      },
      sandboxMetadata: {
        readinessScore: validation.score,
        validationFailures: validation.failCount,
        validationWarnings: validation.warnCount,
        generatedAt,
      },
    },
  };
}
