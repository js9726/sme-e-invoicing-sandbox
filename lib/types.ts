// Framework-free domain types and code tables for the SME e-invoicing sandbox.
// Everything here is pure data/TypeScript so it can be unit-tested with Vitest
// and reused by the Next.js UI and the myinvois-mcp server.

export type Party = {
  name: string;
  tin: string;
  idType: "BRN" | "NRIC" | "PASSPORT" | "ARMY" | "NA";
  idValue: string;
  sst: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  postcode: string;
  msic: string;
};

export type InvoiceLine = {
  id: string;
  classification: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxType: "01" | "02" | "06";
  taxRate: number;
};

export type InvoiceState = {
  typeCode: "01" | "02" | "03" | "04";
  currency: "MYR";
  issueDate: string;
  issueTime: string;
  paymentMode: "01" | "02" | "03" | "04" | "08";
  internalRef: string;
  supplier: Party;
  buyer: Party;
  lines: InvoiceLine[];
};

export type TemplateKey = "services" | "retail" | "grab" | "hawker" | "rental" | "credit";

export type ValidationItem = {
  label: string;
  status: "pass" | "warn" | "fail";
};

export type Totals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};

export const DEFAULT_ISSUE_DATE = "2026-07-03";
export const DEFAULT_ISSUE_TIME = "09:00";
export const DEFAULT_GENERATED_AT = "Client clock pending";

// LHDN's published TIN for consolidated general-public (walk-in) e-Invoices.
export const GENERAL_PUBLIC_TIN = "EI00000000010";

export const invoiceTypes = {
  "01": "Invoice",
  "02": "Credit note",
  "03": "Debit note",
  "04": "Refund note",
} satisfies Record<InvoiceState["typeCode"], string>;

export const paymentModes = {
  "01": "Cash",
  "02": "Cheque",
  "03": "Bank transfer",
  "04": "Credit card",
  "08": "E-wallet",
} satisfies Record<InvoiceState["paymentMode"], string>;

export const taxTypes = {
  "01": "Sales tax",
  "02": "Service tax",
  "06": "Not applicable",
} satisfies Record<InvoiceLine["taxType"], string>;

export const states = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
];
