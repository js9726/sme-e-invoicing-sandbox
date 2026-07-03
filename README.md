# Malaysia SME E-Invoicing Sandbox

Local MyInvois-style payload builder for Malaysian SME invoice workflows.

This is a resume project, not a live tax integration. It validates common SME
invoice fields, calculates totals, and produces a sandbox JSON payload that is
safe to inspect, copy, and export without LHDN credentials.

## What It Shows

- Malaysian supplier and buyer profiles with TIN, BRN, SST, MSIC, state, and
  postcode fields.
- Personal seller mode for Grab drivers, hawkers, freelancers, rental hosts,
  and people without SSM company registration.
- Walk-in/general-public customer mode for customers who do not ask for their
  own individual e-Invoice.
- Invoice, credit note, debit note, and refund note modes.
- Line-item pricing, discounts, SST/service-tax handling, totals, and payable
  amount calculation.
- Readiness scoring for identity fields, postcodes, email, line completeness,
  tax-rate consistency, and positive totals.
- MyInvois-style JSON generation with copy and export actions.
- Browser-local draft save and reload.
- Sample SME scenarios for service billing, retail supply, and credit notes.

## Boundaries

- No live LHDN submission.
- No OAuth client credentials.
- No taxpayer lookup.
- No PDF signing or official QR validation.

The generated JSON is intentionally labelled as sandbox output. Treat it as a
schema-thinking and workflow demo, not as official MyInvois SDK output.

## Useful Commands

```bash
npm ci
npm run dev -- --port 3037
npm run lint
npm run build
```

## Current Local URL

When the dev server is running:

```text
http://localhost:3037/
```

## Resume Angle

This project demonstrates practical Malaysian compliance tech: frontend form
architecture, live validation, deterministic calculations, JSON payload design,
local persistence, and clear separation between a safe sandbox and a regulated
production API.

## Production Direction

For a real mobile app aimed at 10 SME clients first, use this stack:

| Layer | Pick | Why |
|---|---|---|
| Mobile app | Expo + React Native + TypeScript | One codebase for Android, iOS, and web; EAS can build and submit store builds. |
| Routing/UI | Expo Router + simple card flows | Works well for step-by-step mobile screens and elderly/non-technical users. |
| Database | Supabase Postgres | Managed Postgres, Auth, Storage, Realtime, Edge Functions, and row-level security in one platform. |
| Tenant model | One shared database with `tenant_id` on business rows | Better than one database per client at 10 clients, and easier to scale later. |
| Backend/API | Supabase Edge Functions or Vercel/Cloudflare Workers | Keep LHDN OAuth, signing, submissions, and secrets server-side. |
| Files | Supabase Storage or Cloudflare R2 | Store generated PDFs, attachments, and audit artifacts outside the mobile client. |
| Release | EAS Build, EAS Submit, EAS Update | Build native apps, submit to stores, and push small fixes quickly. |

### Suggested Multi-Client Tables

```text
tenants
tenant_members
supplier_profiles
customers
invoices
invoice_lines
invoice_submissions
invoice_attachments
assistant_threads
audit_log
```

Every tenant-owned table should include `tenant_id`, `created_by`, `created_at`,
and `updated_at`. Enable row-level security so users only see rows for companies
where they are members.

### Simple-User UX Direction

The first production interface should not feel like accounting software.

1. Ask one question: "What happened today?"
2. Offer three large buttons: "I sold a service", "I sold goods", "I refund customer".
3. Let the user type a WhatsApp-style sentence.
4. Use a template parser to fill item, amount, tax mode, and invoice type.
5. Show only customer name, TIN/BRN, amount, and final total first.
6. Hide accounting details under "More details".
7. Submit only after a simple "Ready check" passes.

The current sandbox implements this first template-assistant pattern locally.

### Why It Helps Small Non-Technical Sellers

A Grab driver, hawker, or small rental host may not have an SSM company or know
what TIN/BRN means. The app should help them in stages:

1. **Record keeping mode**: keep clean daily income records and simple receipt
   drafts, even if full e-Invoice submission is not mandatory yet.
2. **Personal seller mode**: use NRIC/passport identity instead of BRN when the
   seller has no company registration.
3. **Walk-in customer mode**: avoid forcing customer TIN for normal public sales.
   Use a consolidated/public draft path where appropriate.
4. **Customer asks e-Invoice**: then ask only for the buyer details needed:
   name, TIN, and IC/BRN/passport.
5. **Accountant/LHDN ready**: later connect server-side TIN search/validation and
   official submission, without exposing secrets in the mobile app.

For example, someone earning RM4k/month should not be frightened by a tax-form
screen. The app should behave like a helper: "What did you sell today?", "Was
the customer a normal walk-in?", "Save this record", and "Ask your accountant
when ready."

### Primary Docs To Learn

- Expo docs: https://docs.expo.dev/
- Expo Application Services: https://docs.expo.dev/eas/
- Supabase docs: https://supabase.com/docs
- Supabase row-level security: https://supabase.com/docs/guides/database/postgres/row-level-security
- LHDN MyInvois SDK: https://sdk.myinvois.hasil.gov.my/
