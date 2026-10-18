# Tide cashflow workspace

React, Vite, Tailwind CSS, Firebase Authentication, and Cloud Firestore.

## Firebase setup

1. Create a Firebase project and register a web app.
2. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**. Add `tide-cashflow-workspace.epicjay3.chatgpt.site` to **Authentication → Settings → Authorized domains** for Google sign-in.
3. In **Firestore Database**, create a database. Publish the rules in `firestore.rules` so each signed-in user can read and write only their own plan at `users/{uid}`.
4. The Tide Firebase web app config is included in `src/firebase.js`. To use another project locally, copy `.env.example` to `.env.local` and fill in its four values. These web app settings are public identifiers. Do not put a service account key in the site.
5. Run `npm install` and `npm run dev` locally. Run `npm run build` for a static production build.

Run `npm test` to check payment timing, cash forecasts, safety gaps, loan math, and connected dashboard actions.

The site starts a new account with editable sample figures. Changes to invoices, bills, cash, and the safety amount update the forecast and borrowing check. The plan is saved to Firestore under the signed-in user's UID. A same-device cache keeps edits available if Firestore is temporarily unreachable; the save indicator reports when cloud saving fails.

The hosted Site is currently private and has its own ChatGPT access gate before the Firebase screen.
