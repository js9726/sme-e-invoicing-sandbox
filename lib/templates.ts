// Sample parties, scenario templates, and the plain-language template copy.
// Pure data + builders, no framework or runtime (Date/crypto) dependencies.
import {
  DEFAULT_ISSUE_DATE,
  DEFAULT_ISSUE_TIME,
  GENERAL_PUBLIC_TIN,
  type InvoiceLine,
  type InvoiceState,
  type Party,
  type TemplateKey,
} from "./types";

export const baseSupplier: Party = {
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

export const individualSupplier: Party = {
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

export const baseBuyer: Party = {
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

export const individualBuyer: Party = {
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

export const generalPublicBuyer: Party = {
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

export const templateCopy = {
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

export function newLine(overrides: Partial<InvoiceLine> = {}): InvoiceLine {
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

export function sampleInvoice(template: TemplateKey): InvoiceState {
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
