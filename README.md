# Tide — a cash decision tool for freelancers

**Finance vertical · TrojanHacks 2026**

Tide helps a freelancer answer one concrete question: **Can I cover my bills if a client pays late, and is borrowing necessary?** Enter starting cash, expected client payments, weekly bills, and a safety amount. A payment delay changes the six-week cash forecast, which changes the borrowing gap and example loan cost.

## Try the working demo

- Live site: https://tide-36b83.web.app/
- Direct sample walkthrough: https://tide-36b83.web.app/?demo=1
- Choose **Delay Atlas payment**. The sample's lowest projected cash changes from **$7,700** to **$3,700**, creating a **$1,300 gap** below its $5,000 safety amount. Open **See borrowing decision** to see that gap carried into the loan calculator.

The sample walkthrough requires no account and does not save changes. **Restart demo** restores the sample. For a private, persistent plan, use email/password or Google sign-in. Each account's plan is saved under its Firebase UID in Cloud Firestore.

## How it works

1. `forecast()` in `src/plan.js` adds expected income and invoice receipts, subtracts bills, and carries the balance forward week by week.
2. `setInvoiceStatus()` moves delayed payments to their updated expected week. The same plan is used throughout the dashboard.
3. `getPlanSummary()` finds the lowest balance, any bill shortfall, and the gap below the user's chosen safety amount.
4. `calculateLoan()` shows example monthly payment, total repayment, and interest for an amount, APR, and term chosen by the user.

The app does **not** connect to banks, send reminders automatically, offer loans, or give a lender quote. A reminder can be copied into the user's own email. Loan figures omit lender-specific fees and are examples for comparison.

## Build and test

React, Vite, Tailwind CSS, Firebase Authentication, and Cloud Firestore.

```bash
npm install
npm test
npm run dev
npm run build
```

Tests cover payment timing, cash forecasting, safety gaps, loan math, the dashboard workflow, and the sample walkthrough.

## Firebase setup

The public web app configuration for `tide-36b83` is in `src/firebase.js`. For another project, copy `.env.example` to `.env.local` and set the four `VITE_FIREBASE_*` values. Enable **Email/Password** and **Google** under Authentication, authorize the hosting domain, create Firestore, and publish `firestore.rules`. Each signed-in user can access only their own `users/{uid}` document. Do not place a service-account key in client code.
