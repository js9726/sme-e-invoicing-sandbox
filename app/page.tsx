"use client";

import { useMemo, useState } from "react";

type Party = {
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

type InvoiceLine = {
  id: string;
  classification: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxType: "01" | "02" | "06";
  taxRate: number;
};

type InvoiceState = {
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

type TemplateKey = "services" | "retail" | "grab" | "hawker" | "rental" | "credit";
type ValidationItem = {
  label: string;
  status: "pass" | "warn" | "fail";
};

const DEFAULT_ISSUE_DATE = "2026-07-03";
const DEFAULT_ISSUE_TIME = "09:00";
const DEFAULT_GENERATED_AT = "Client clock pending";
const GENERAL_PUBLIC_TIN = "EI00000000010";

const invoiceTypes = {
  "01": "Invoice",
  "02": "Credit note",
  "03": "Debit note",
  "04": "Refund note",
} satisfies Record<InvoiceState["typeCode"], string>;

const paymentModes = {
  "01": "Cash",
  "02": "Cheque",
  "03": "Bank transfer",
  "04": "Credit card",
  "08": "E-wallet",
} satisfies Record<InvoiceState["paymentMode"], string>;

const taxTypes = {
  "01": "Sales tax",
  "02": "Service tax",
  "06": "Not applicable",
} satisfies Record<InvoiceLine["taxType"], string>;

const states = [
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

const baseSupplier: Party = {
  name: "Awan Digital Sdn Bhd",
  tin: "C25874136090",
  idType: "BRN",
  idValue: "202301012345",
  sst: "B16-2301-32000001",
  email: "finance@awandigital.my",
  phone: "+60322011234",
  address1: "Level 8, Menara Sentral, Jalan Tun Sambanthan",
  city: "Kuala Lumpur",
  state: "Kuala Lumpur",
  postcode: "50470",
  msic: "62010",
};

const individualSupplier: Party = {
  name: "Mei Ling Personal Services",
  tin: "IG560102145678",
  idType: "NRIC",
  idValue: "560102145678",
  sst: "NA",
  email: "meiling@example.my",
  phone: "+60123456789",
  address1: "Personal address saved privately",
  city: "Petaling Jaya",
  state: "Selangor",
  postcode: "47400",
  msic: "49221",
};

const baseBuyer: Party = {
  name: "Kopi Tepi Jalan Sdn Bhd",
  tin: "C98653214080",
  idType: "BRN",
  idValue: "202101009876",
  sst: "NA",
  email: "accounts@kopitepi.my",
  phone: "+60378880011",
  address1: "12, Jalan SS 21/37, Damansara Utama",
  city: "Petaling Jaya",
  state: "Selangor",
  postcode: "47400",
  msic: "56101",
};

const individualBuyer: Party = {
  name: "Tan Ah Hock",
  tin: "IG650101109999",
  idType: "NRIC",
  idValue: "650101109999",
  sst: "NA",
  email: "customer@example.my",
  phone: "+60128889999",
  address1: "Customer address",
  city: "Subang Jaya",
  state: "Selangor",
  postcode: "47500",
  msic: "00000",
};

const generalPublicBuyer: Party = {
  name: "General Public",
  tin: GENERAL_PUBLIC_TIN,
  idType: "NA",
  idValue: "NA",
  sst: "NA",
  email: "general-public@example.my",
  phone: "NA",
  address1: "NA",
  city: "NA",
  state: "Kuala Lumpur",
  postcode: "50000",
  msic: "00000",
};

const templateCopy = {
  services: {
    title: "I sold a service",
    subtitle: "Best for monthly service, repair, design, accounting, support.",
    assistant: "I set service tax, bank transfer, and a simple service line.",
  },
  retail: {
    title: "I sold goods",
    subtitle: "Best for shop stock, cartons, supplies, or delivered goods.",
    assistant: "I set sales tax, e-wallet payment, and product lines.",
  },
  grab: {
    title: "I did Grab job",
    subtitle: "For ride, delivery, freelance, or platform work with no SSM company.",
    assistant: "No BRN needed. I used personal NRIC mode and a simple service line.",
  },
  hawker: {
    title: "I sold food",
    subtitle: "For stall, pasar malam, catering, or walk-in food sales.",
    assistant: "I used hawker mode and general-public customer details for walk-in sales.",
  },
  rental: {
    title: "I rented a place",
    subtitle: "For room rental, house rental, homestay, or Airbnb-style income.",
    assistant: "I used personal rental mode. Ask tenant details only if they request e-Invoice.",
  },
  credit: {
    title: "I refund customer",
    subtitle: "Best for returns, duplicate charge, or price correction.",
    assistant: "I changed the document to a credit note with no tax.",
  },
} satisfies Record<TemplateKey, { title: string; subtitle: string; assistant: string }>;

function newLine(overrides: Partial<InvoiceLine> = {}): InvoiceLine {
  return {
    id: overrides.id ?? "line-template",
    classification: "002",
    description: "Monthly accounting automation support",
    quantity: 1,
    unitPrice: 1200,
    discount: 0,
    taxType: "02",
    taxRate: 8,
    ...overrides,
  };
}

function sampleInvoice(template: TemplateKey): InvoiceState {
  const common = {
    currency: "MYR" as const,
    issueDate: DEFAULT_ISSUE_DATE,
    issueTime: DEFAULT_ISSUE_TIME,
    supplier: baseSupplier,
    buyer: baseBuyer,
  };

  if (template === "retail") {
    return {
      ...common,
      typeCode: "01",
      paymentMode: "08",
      internalRef: "INV-PG-0021",
      supplier: {
        ...baseSupplier,
        name: "Pulau Retail Supply Sdn Bhd",
        city: "George Town",
        state: "Penang",
        postcode: "10300",
        msic: "46900",
      },
      buyer: {
        ...baseBuyer,
        name: "Kedai Harian Desa Jaya",
        tin: "IG560102145678",
        idValue: "PG0034567-X",
        email: "owner@kedaiharian.my",
        city: "Butterworth",
        state: "Penang",
        postcode: "12000",
        msic: "47110",
      },
      lines: [
        newLine({
          id: "retail-line-1",
          classification: "001",
          description: "Carton beverages",
          quantity: 20,
          unitPrice: 48,
          discount: 40,
          taxType: "01",
          taxRate: 5,
        }),
        newLine({
          id: "retail-line-2",
          classification: "001",
          description: "Retail snack bundle",
          quantity: 12,
          unitPrice: 36,
          taxType: "01",
          taxRate: 5,
        }),
      ],
    };
  }

  if (template === "grab") {
    return {
      ...common,
      typeCode: "01",
      paymentMode: "08",
      internalRef: "INV-GRAB-0001",
      supplier: {
        ...individualSupplier,
        msic: "49221",
      },
      buyer: generalPublicBuyer,
      lines: [
        newLine({
          id: "grab-line-1",
          classification: "002",
          description: "Platform driving and delivery income",
          quantity: 1,
          unitPrice: 4000,
          taxType: "06",
          taxRate: 0,
        }),
      ],
    };
  }

  if (template === "hawker") {
    return {
      ...common,
      typeCode: "01",
      paymentMode: "01",
      internalRef: "INV-STALL-0001",
      supplier: {
        ...individualSupplier,
        name: "Mei Ling Food Stall",
        msic: "56101",
      },
      buyer: generalPublicBuyer,
      lines: [
        newLine({
          id: "hawker-line-1",
          classification: "004",
          description: "Daily food stall sales",
          quantity: 1,
          unitPrice: 400,
          taxType: "06",
          taxRate: 0,
        }),
      ],
    };
  }

  if (template === "rental") {
    return {
      ...common,
      typeCode: "01",
      paymentMode: "03",
      internalRef: "INV-RENT-0001",
      supplier: {
        ...individualSupplier,
        name: "Mei Ling Rental Income",
        msic: "68101",
      },
      buyer: individualBuyer,
      lines: [
        newLine({
          id: "rental-line-1",
          classification: "004",
          description: "Monthly room rental",
          quantity: 1,
          unitPrice: 1800,
          taxType: "06",
          taxRate: 0,
        }),
      ],
    };
  }

  if (template === "credit") {
    return {
      ...common,
      typeCode: "02",
      paymentMode: "03",
      internalRef: "CN-SVC-0004",
      lines: [
        newLine({
          id: "credit-line-1",
          description: "Credit for duplicate support hour",
          quantity: 1,
          unitPrice: 180,
          taxType: "06",
          taxRate: 0,
        }),
      ],
    };
  }

  return {
    ...common,
    typeCode: "01",
    paymentMode: "03",
    internalRef: "INV-KL-0007",
    lines: [
      newLine({
        id: "service-line-1",
        description: "E-commerce bookkeeping automation",
        quantity: 1,
        unitPrice: 1800,
      }),
      newLine({
        id: "service-line-2",
        description: "MyInvois onboarding checklist workshop",
        quantity: 2,
        unitPrice: 350,
      }),
    ],
  };
}

function currentDateParts() {
  const date = new Date();
  return {
    issueDate: date.toISOString().slice(0, 10),
    issueTime: date.toTimeString().slice(0, 5),
    generatedAt: date.toISOString(),
  };
}

function createLineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(value || 0);
}

function lineNet(line: InvoiceLine) {
  return Math.max(0, line.quantity * line.unitPrice - line.discount);
}

function lineTax(line: InvoiceLine) {
  return line.taxType === "06" ? 0 : lineNet(line) * (line.taxRate / 100);
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function hashValue(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
}

function normalizeParty(party: Party) {
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

function validate(invoice: InvoiceState, totals: { subtotal: number; total: number }) {
  const tinPattern = /^[A-Z0-9]{8,14}$/;
  const postcodePattern = /^\d{5}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const buyerIsGeneralPublic = invoice.buyer.tin === GENERAL_PUBLIC_TIN;
  const items: ValidationItem[] = [
    {
      label: invoice.supplier.idType === "BRN" ? "Your company details" : "Your personal seller details",
      status:
        invoice.supplier.name &&
        tinPattern.test(invoice.supplier.tin) &&
        invoice.supplier.idValue
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
        postcodePattern.test(invoice.supplier.postcode) &&
        postcodePattern.test(invoice.buyer.postcode)
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
      status: invoice.lines.every((line) =>
        line.taxType === "06" ? line.taxRate === 0 : line.taxRate >= 0
      )
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

function amountFromText(text: string) {
  const match = text.match(/(?:rm|myr)?\s*(\d+(?:\.\d{1,2})?)/i);
  return match ? Number(match[1]) : null;
}

function templateFromText(text: string): TemplateKey {
  const lower = text.toLowerCase();
  if (/(refund|return|credit|duplicate|wrong price)/.test(lower)) {
    return "credit";
  }
  if (/(grab|driver|ride|delivery|lalamove|rider|platform)/.test(lower)) {
    return "grab";
  }
  if (/(hawker|stall|pasar|food|nasi|mee|kopi|catering)/.test(lower)) {
    return "hawker";
  }
  if (/(airbnb|rental|rent|tenant|room|house|homestay)/.test(lower)) {
    return "rental";
  }
  if (/(goods|stock|carton|supply|retail|shop|delivery|product)/.test(lower)) {
    return "retail";
  }
  return "services";
}

export default function Home() {
  const [template, setTemplate] = useState<TemplateKey>("services");
  const [invoice, setInvoice] = useState<InvoiceState>(() => sampleInvoice("services"));
  const [generatedAt, setGeneratedAt] = useState(DEFAULT_GENERATED_AT);
  const [assistantText, setAssistantText] = useState(
    "Example: I sold bookkeeping service RM1800 to Kopi Tepi Jalan."
  );
  const [message, setMessage] = useState("Choose a template, check customer, export JSON.");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const totals = useMemo(() => {
    const subtotal = invoice.lines.reduce((sum, line) => sum + lineNet(line), 0);
    const tax = invoice.lines.reduce((sum, line) => sum + lineTax(line), 0);
    const discount = invoice.lines.reduce((sum, line) => sum + line.discount, 0);
    return {
      subtotal,
      tax,
      discount,
      total: subtotal + tax,
    };
  }, [invoice.lines]);

  const validation = useMemo(() => validate(invoice, totals), [invoice, totals]);

  const reference = useMemo(() => {
    return `${invoice.internalRef}-${hashValue(
      `${invoice.supplier.tin}-${invoice.buyer.tin}-${invoice.issueDate}-${totals.total}`
    )}`;
  }, [invoice, totals.total]);

  const payload = useMemo(() => {
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
  }, [invoice, reference, totals, validation, generatedAt]);

  const payloadJson = useMemo(() => JSON.stringify(payload, null, 2), [payload]);
  const mainLine = invoice.lines[0];

  function applyTemplate(nextTemplate: TemplateKey) {
    const parts = currentDateParts();
    setTemplate(nextTemplate);
    setGeneratedAt(parts.generatedAt);
    setInvoice({
      ...sampleInvoice(nextTemplate),
      issueDate: parts.issueDate,
      issueTime: parts.issueTime,
    });
    setMessage(templateCopy[nextTemplate].assistant);
  }

  function usePersonalSeller() {
    setInvoice((current) => ({
      ...current,
      supplier: individualSupplier,
    }));
    setMessage("No company registration? Use personal seller mode. BRN is not needed; use NRIC/Passport details when submitting for real.");
  }

  function useCompanySeller() {
    setInvoice((current) => ({
      ...current,
      supplier: baseSupplier,
    }));
    setMessage("Company mode selected. BRN means the SSM business registration number.");
  }

  function useGeneralPublicCustomer() {
    setInvoice((current) => ({
      ...current,
      buyer: generalPublicBuyer,
      lines: current.lines.map((line) => ({
        ...line,
        classification: line.classification === "001" ? "001" : "004",
      })),
    }));
    setMessage("Walk-in customer mode selected. This is a consolidated public draft, not an individual buyer e-Invoice.");
  }

  function useIndividualCustomer() {
    setInvoice((current) => ({
      ...current,
      buyer: individualBuyer,
    }));
    setMessage("Use this only when the customer asks for their own e-Invoice and gives their TIN and IC/passport details.");
  }

  function useBusinessCustomer() {
    setInvoice((current) => ({
      ...current,
      buyer: baseBuyer,
    }));
    setMessage("Business customer mode selected. Ask the company for name, TIN, BRN, and email once, then save it.");
  }

  function updateInvoice<K extends keyof InvoiceState>(key: K, value: InvoiceState[K]) {
    setInvoice((current) => ({ ...current, [key]: value }));
  }

  function updateParty(kind: "supplier" | "buyer", key: keyof Party, value: string) {
    setInvoice((current) => ({
      ...current,
      [kind]: {
        ...current[kind],
        [key]: value,
      },
    }));
  }

  function updateLine(id: string, key: keyof InvoiceLine, value: string | number) {
    setInvoice((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === id
          ? {
              ...line,
              [key]: typeof line[key] === "number" ? Number(value) : value,
            }
          : line
      ),
    }));
  }

  function addLine() {
    setInvoice((current) => ({
      ...current,
      lines: [
        ...current.lines,
        newLine({
          id: createLineId(),
          description: "New item",
          unitPrice: 100,
        }),
      ],
    }));
  }

  function removeLine(id: string) {
    setInvoice((current) => ({
      ...current,
      lines: current.lines.filter((line) => line.id !== id),
    }));
  }

  function buildFromMessage() {
    const nextTemplate = templateFromText(assistantText);
    const amount = amountFromText(assistantText);
    const base = sampleInvoice(nextTemplate);
    const parts = currentDateParts();
    const cleaned = assistantText.replace(/\s+/g, " ").trim();
    const description =
      cleaned.length > 12 ? cleaned.replace(/^(i\s+)?(sold|refund|provided)\s+/i, "") : base.lines[0].description;

    setTemplate(nextTemplate);
    setGeneratedAt(parts.generatedAt);
    setInvoice({
      ...base,
      issueDate: parts.issueDate,
      issueTime: parts.issueTime,
      lines: [
        {
          ...base.lines[0],
          id: createLineId(),
          description,
          unitPrice: amount ?? base.lines[0].unitPrice,
          quantity: 1,
          discount: 0,
        },
      ],
    });
    setMessage(`Assistant used ${templateCopy[nextTemplate].title.toLowerCase()} template.`);
  }

  async function copyPayload() {
    await navigator.clipboard.writeText(payloadJson);
    setMessage("Payload copied. Next step: send to accountant or backend.");
  }

  function exportPayload() {
    const blob = new Blob([payloadJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${reference.toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Payload JSON exported.");
  }

  function saveDraft() {
    localStorage.setItem("sme-einvoice-sandbox-draft", JSON.stringify(invoice));
    setMessage("Draft saved on this phone/browser.");
  }

  function loadDraft() {
    const draft = localStorage.getItem("sme-einvoice-sandbox-draft");
    if (!draft) {
      setMessage("No saved draft found yet.");
      return;
    }

    try {
      setInvoice(JSON.parse(draft));
      setMessage("Saved draft loaded.");
    } catch {
      setMessage("Saved draft could not be read.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f4] text-[#18201d]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-3 sm:px-5 lg:px-6">
        <header className="sticky top-0 z-10 -mx-3 border-b border-[#d7ddd7] bg-[#f4f6f4]/95 px-3 py-3 backdrop-blur sm:-mx-5 sm:px-5 lg:-mx-6 lg:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#5d6b65]">
                Malaysia SME E-Invoicing
              </p>
              <h1 className="text-xl font-semibold text-[#111815]">Simple invoice maker</h1>
            </div>
            <div className="rounded-md border border-[#0f5f4d] bg-white px-3 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase text-[#5d6b65]">Payable</p>
              <p className="text-lg font-semibold text-[#0f5f4d]">{money(totals.total)}</p>
            </div>
          </div>
        </header>

        <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">What happened today?</h2>
              <p className="mt-1 text-sm leading-6 text-[#52635c]">
                Pick one big button. The app fills most e-invoice fields first, then you only check names and amount.
              </p>
            </div>
            <span className="rounded-md border border-[#d7b45d] bg-[#fff6da] px-3 py-2 text-sm font-medium text-[#6d5011]">
              Sandbox only, no LHDN submit
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(Object.keys(templateCopy) as TemplateKey[]).map((key) => (
              <button
                key={key}
                className={template === key ? "template-card template-card-active" : "template-card"}
                type="button"
                onClick={() => applyTemplate(key)}
              >
                <span className="text-base font-semibold">{templateCopy[key].title}</span>
                <span className="mt-1 block text-sm font-normal leading-5 text-[#52635c]">
                  {templateCopy[key].subtitle}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-lg font-semibold">Are you registered with SSM?</h2>
              <p className="mt-1 text-sm leading-6 text-[#52635c]">
                If you are just driving, selling food, or renting a room under your own name, do not start with BRN.
                Use personal seller mode first.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="button-primary" type="button" onClick={usePersonalSeller}>
                No company, use IC/passport
              </button>
              <button className="button-secondary" type="button" onClick={useCompanySeller}>
                I have SSM company
              </button>
            </div>
          </div>
          <div className="mt-3 rounded-md bg-[#f8faf8] p-3 text-sm leading-6 text-[#40504a]">
            <p>
              <strong>BRN</strong> means SSM business registration number. If you do not have SSM, use an individual
              ID type such as NRIC or passport. <strong>TIN</strong> is the tax number; a real production app should
              help search or validate it through MyInvois after secure login, instead of making auntie guess.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Assistant</h2>
              <div className="mt-3 rounded-md bg-[#ecf6f2] p-3 text-sm leading-6 text-[#21332d]">
                <p className="font-semibold">Say it like WhatsApp:</p>
                <p>{message}</p>
              </div>
              <div className="mt-3 rounded-md border border-[#d7ddd7] bg-[#fffdf4] p-3 text-sm leading-6 text-[#594918]">
                <p className="font-semibold">Plain English guide</p>
                <p>
                  If you earn around RM4k/month as a driver, hawker, or small rental host, the app should first help
                  keep clean records and simple receipts. It should only ask for full buyer TIN/ID when the buyer asks
                  for an e-Invoice, or when your accountant says you must submit.
                </p>
              </div>
              <label className="mt-3 block">
                <span className="field-label">Message</span>
                <textarea
                  className="input min-h-24 resize-y"
                  value={assistantText}
                  onChange={(event) => setAssistantText(event.target.value)}
                />
              </label>
              <button className="button-primary mt-3 w-full" type="button" onClick={buildFromMessage}>
                Build invoice from message
              </button>
            </section>

            <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Ready check</h2>
                <span className={scoreClass(validation.score)}>{validation.score}/100</span>
              </div>
              <div className="mt-3 space-y-2">
                {validation.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 border-b border-[#edf0ed] py-2 text-sm last:border-0"
                  >
                    <span>{item.label}</span>
                    <span className={statusClass(item.status)}>{item.status}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Finish</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <button className="button-primary" type="button" onClick={copyPayload}>
                  Copy JSON
                </button>
                <button className="button-primary" type="button" onClick={exportPayload}>
                  Export JSON
                </button>
                <button className="button-secondary" type="button" onClick={saveDraft}>
                  Save draft
                </button>
                <button className="button-secondary" type="button" onClick={loadDraft}>
                  Load draft
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">1. Customer</h2>
                <span className="rounded-md bg-[#eef2ef] px-2 py-1 text-xs font-semibold text-[#52635c]">
                  Pick one
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#52635c]">
                Most walk-in customers do not know their TIN. Only ask for TIN and IC/BRN when the customer wants an
                individual e-Invoice in their own name.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <button className="button-primary" type="button" onClick={useGeneralPublicCustomer}>
                  Walk-in customer
                </button>
                <button className="button-secondary" type="button" onClick={useIndividualCustomer}>
                  Person asks e-Invoice
                </button>
                <button className="button-secondary" type="button" onClick={useBusinessCustomer}>
                  Company customer
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Customer name">
                  <input
                    className="input"
                    value={invoice.buyer.name}
                    onChange={(event) => updateParty("buyer", "name", event.target.value)}
                  />
                </Field>
                <Field label="Customer TIN, if they ask e-Invoice">
                  <input
                    className="input"
                    value={invoice.buyer.tin}
                    onChange={(event) => updateParty("buyer", "tin", event.target.value.toUpperCase())}
                  />
                </Field>
                <Field label="Customer ID type">
                  <select
                    className="input"
                    value={invoice.buyer.idType}
                    onChange={(event) => updateParty("buyer", "idType", event.target.value)}
                  >
                    <option value="NA">Not needed</option>
                    <option value="NRIC">MyKad / NRIC</option>
                    <option value="BRN">SSM BRN</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="ARMY">Army</option>
                  </select>
                </Field>
                <Field label="BRN / IC / passport number">
                  <input
                    className="input"
                    value={invoice.buyer.idValue}
                    onChange={(event) => updateParty("buyer", "idValue", event.target.value)}
                  />
                </Field>
                <Field label="Email receipt">
                  <input
                    className="input"
                    value={invoice.buyer.email}
                    onChange={(event) => updateParty("buyer", "email", event.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">2. Sale item</h2>
                <button className="button-secondary" type="button" onClick={addLine}>
                  Add item
                </button>
              </div>

              {mainLine ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="What item/service?">
                    <input
                      className="input"
                      value={mainLine.description}
                      onChange={(event) =>
                        updateLine(mainLine.id, "description", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Amount per item">
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={mainLine.unitPrice}
                      onChange={(event) =>
                        updateLine(mainLine.id, "unitPrice", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Quantity">
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="1"
                      value={mainLine.quantity}
                      onChange={(event) => updateLine(mainLine.id, "quantity", event.target.value)}
                    />
                  </Field>
                  <Field label="Tax">
                    <select
                      className="input"
                      value={mainLine.taxType}
                      onChange={(event) => {
                        const nextTax = event.target.value as InvoiceLine["taxType"];
                        updateLine(mainLine.id, "taxType", nextTax);
                        if (nextTax === "06") {
                          updateLine(mainLine.id, "taxRate", 0);
                        }
                      }}
                    >
                      {Object.entries(taxTypes).map(([code, label]) => (
                        <option key={code} value={code}>
                          {code} - {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              ) : null}

              <div className="mt-4 space-y-2">
                {invoice.lines.map((line, index) => (
                  <div
                    key={line.id}
                    className="rounded-md border border-[#d7ddd7] bg-[#f8faf8] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {index + 1}. {line.description}
                        </p>
                        <p className="mt-1 text-xs text-[#52635c]">
                          Qty {line.quantity} x {money(line.unitPrice)} | Tax {line.taxRate}%
                        </p>
                      </div>
                      <p className="text-right text-sm font-semibold">
                        {money(lineNet(line) + lineTax(line))}
                      </p>
                    </div>
                    {invoice.lines.length > 1 ? (
                      <button
                        className="button-quiet mt-3 w-full"
                        type="button"
                        onClick={() => removeLine(line.id)}
                      >
                        Remove this item
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">3. Review totals</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Metric label="Subtotal" value={money(totals.subtotal)} />
                <Metric label="Tax" value={money(totals.tax)} />
                <Metric label="Discounts" value={money(totals.discount)} />
                <Metric label="Payable" value={money(totals.total)} strong />
              </div>
            </section>

            <section className="rounded-md border border-[#d7ddd7] bg-white p-4 shadow-sm">
              <button
                className="flex w-full items-center justify-between text-left text-lg font-semibold"
                type="button"
                onClick={() => setShowAdvanced((current) => !current)}
              >
                More details
                <span className="text-sm text-[#52635c]">{showAdvanced ? "Hide" : "Show"}</span>
              </button>

              {showAdvanced ? (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Document ref">
                      <input
                        className="input"
                        value={invoice.internalRef}
                        onChange={(event) => updateInvoice("internalRef", event.target.value)}
                      />
                    </Field>
                    <Field label="Invoice type">
                      <select
                        className="input"
                        value={invoice.typeCode}
                        onChange={(event) =>
                          updateInvoice("typeCode", event.target.value as InvoiceState["typeCode"])
                        }
                      >
                        {Object.entries(invoiceTypes).map(([code, label]) => (
                          <option key={code} value={code}>
                            {code} - {label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Supplier name">
                      <input
                        className="input"
                        value={invoice.supplier.name}
                        onChange={(event) => updateParty("supplier", "name", event.target.value)}
                      />
                    </Field>
                    <Field label="Supplier TIN">
                      <input
                        className="input"
                        value={invoice.supplier.tin}
                        onChange={(event) =>
                          updateParty("supplier", "tin", event.target.value.toUpperCase())
                        }
                      />
                    </Field>
                    <Field label="Your ID type">
                      <select
                        className="input"
                        value={invoice.supplier.idType}
                        onChange={(event) => updateParty("supplier", "idType", event.target.value)}
                      >
                        <option value="NRIC">MyKad / NRIC</option>
                        <option value="BRN">SSM BRN</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="ARMY">Army</option>
                      </select>
                    </Field>
                    <Field label="Your BRN / IC / passport number">
                      <input
                        className="input"
                        value={invoice.supplier.idValue}
                        onChange={(event) => updateParty("supplier", "idValue", event.target.value)}
                      />
                    </Field>
                    <Field label="Customer state">
                      <select
                        className="input"
                        value={invoice.buyer.state}
                        onChange={(event) => updateParty("buyer", "state", event.target.value)}
                      >
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Customer postcode">
                      <input
                        className="input"
                        value={invoice.buyer.postcode}
                        onChange={(event) => updateParty("buyer", "postcode", event.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="rounded-md border border-[#d7ddd7] bg-[#101817] p-3 text-[#f5f7f4]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">Sandbox payload</h3>
                      <span className="rounded-md bg-[#22332f] px-2 py-1 text-xs text-[#b9cbc4]">
                        {reference}
                      </span>
                    </div>
                    <pre className="max-h-[440px] overflow-auto rounded-md bg-[#07100e] p-3 text-xs leading-5 text-[#dce8e1]">
                      {payloadJson}
                    </pre>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border border-[#d7ddd7] bg-[#f8faf8] p-3">
      <p className="text-xs font-semibold uppercase text-[#61716a]">{label}</p>
      <p className={strong ? "mt-1 text-xl font-semibold text-[#0f5f4d]" : "mt-1 text-lg font-semibold"}>
        {value}
      </p>
    </div>
  );
}

function scoreClass(score: number) {
  if (score >= 90) {
    return "rounded-md bg-[#dff4e7] px-2 py-1 text-sm font-semibold text-[#15623f]";
  }
  if (score >= 75) {
    return "rounded-md bg-[#fff1ca] px-2 py-1 text-sm font-semibold text-[#795808]";
  }
  return "rounded-md bg-[#ffe1df] px-2 py-1 text-sm font-semibold text-[#8b2d28]";
}

function statusClass(status: ValidationItem["status"]) {
  if (status === "pass") {
    return "rounded-md bg-[#dff4e7] px-2 py-1 text-xs font-semibold uppercase text-[#15623f]";
  }
  if (status === "warn") {
    return "rounded-md bg-[#fff1ca] px-2 py-1 text-xs font-semibold uppercase text-[#795808]";
  }
  return "rounded-md bg-[#ffe1df] px-2 py-1 text-xs font-semibold uppercase text-[#8b2d28]";
}
