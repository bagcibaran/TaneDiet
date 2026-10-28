# Ön görüşme formu (pre-interview intake form) — design

Date: 2026-10-28 · Status: awaiting the user's approval

## Why

The dietitian ("tane. online diyet") starts every client relationship with a paper pre-interview form (`tane.öngörüşme.pdf`). She needs those answers before the first appointment, and she needs to look up the important ones (health history, allergies, meal habits, goals) later while planning. Today the form travels as a PDF over WhatsApp. Moving it into the app means every new client fills it right after signing up, and the dietitian always sees the latest answers on the client's page.

Clients mostly use phones, so filling ~30 questions must feel light on a small screen.

## Goals

- A client who has registered **must submit the form before using the rest of the app** (home/weight tracking are blocked until then). The gate applies to **every CLIENT account**, including accounts that existed before this feature: the app is not live yet and all old client accounts were test accounts (deleted on 2026-10-28; only the test client `betül` remains, and her form will be filled with sample answers during development).
- Before submitting, the client gives **explicit consent to the processing of their health data** (KVKK). The last step has a required consent checkbox with a short consent text; the app stores **when** consent was given. The consent text is a draft to be reviewed by the dietitian (or a lawyer) before going live.
- The form is filled **step by step: 7 screens, one per section**, with a progress bar and Back / Next buttons, styled with the existing "tane." theme (green `PageHero`, cream cards, bottom tab bar hidden or irrelevant while gated).
- After submitting, the client can **update their answers at any time** (e.g. a new medication or allergy), from a place reachable in the app (e.g. the Profile tab).
- The dietitian sees the client's answers on the client detail page (`/clients/:id`): the **important answers at a glance** plus the full answers, and a **"last updated" date** so she notices changes.
- The form's weight answer seeds the client's **first weight entry** (measured today, entered by the client) so the weight chart starts on day one — **only on the first submission and only if the client has no weight entries yet**, so the chart never gets a duplicate or out-of-order point.
- All UI strings in Turkish and English (i18n), like the rest of the app.

## Non-goals (this version)

- **Blood test upload.** Clients keep sending blood tests over WhatsApp. The form shows a note that tells them to do so (and lists the tests the paper form lists). File upload comes later together with progress photos.
- **Change history** of answers (what it said before). Only the latest answers and the last-updated date are kept.
- The dietitian editing the client's answers. Only the client fills/updates the form.
- The public website (about, recipes) — a separate project after this one.
- Appointment booking ("then create an appointment day" at the end of the paper form) — not in scope; the final screen can thank the client instead.

## Anti-goals

- A client must never be able to read or change another client's form; a client must never reach the dietitian's view. Same ownership rules as weight tracking (owner always from the token / `findClientById`).
- The gate must not lock out the dietitian or make the app unusable if the form endpoint fails silently — failures show an error, not a blank screen.
- Do not ask for age separately; it is derived from the birth date.

## Form content

Source: the paper form. Questions with "Varsa belirtiniz" (if any, specify) are free text that may be empty. Choice questions become tap-friendly options (chips). Grouped into the 7 steps:

1. **Kişisel bilgiler** — full name; birth date (age is computed, not asked); gender (Kadın / Erkek); height (cm); weight (kg); occupation.
2. **Sağlık geçmişi** — chronic diseases (diabetes, hypertension, thyroid, …); significant surgeries (especially GI); medications or supplements; food allergies or intolerances. Plus the blood-test note: send results from the last 3 months over WhatsApp; if none, get a test covering complete blood count, fasting glucose, insulin, HbA1c, thyroid (TSH, T3, T4), iron, B12, vitamin D, cholesterol and triglyceride profile, liver and kidney function. And: if you have a chronic disease or take regular medication, ask your doctor whether there is any nutrition advice.
3. **Beslenme alışkanlıkları** — main meals per day (2 / 3 / 4+); breakfast (yes / no); daily water (0.5 L / 1 L / 1.5 L / 2 L+); tea/coffee (none / 2 cups / 3+ cups); fizzy drinks (yes / no); foods disliked or avoided; most frequent snacks; how often eating out.
4. **Hedef ve beklentiler** — goal (lose weight / gain weight / maintain weight / build healthy eating habits / other + text); previous diets and how they went; special diet (vegan, vegetarian, …); preferred program style (strict and clear / flexible / a list to make conscious choices).
5. **Yaşam tarzı** — daily sleep (≤4 h / 4–6 h / 6–8 h / 8 h+); energy during the day (energetic / moderately tired / always tired); smoking (yes / no); alcohol (yes / no, + frequency if yes).
6. **Spor ve hareketlilik** — exercise days per week (none / 1–2 / 3–4 / 5+); sport types, multiple allowed (cardio / weight training / pilates-yoga / other + text); tracks daily steps (yes / no, + average steps if yes).
7. **Mide ve bağırsak sağlığı** — digestive problems (constipation, diarrhea, bloating, …); lactose or gluten intolerance symptoms.

The last step also holds the **consent checkbox** (required). Draft text (TR): "Bu formda paylaştığım sağlık bilgilerimin, beslenme danışmanlığı hizmeti kapsamında diyetisyenim tarafından işlenmesine açık rıza veriyorum." (EN: "I give my explicit consent for the health information I share in this form to be processed by my dietitian for the purpose of nutrition counselling.") Submitting without ticking it is rejected by the backend, not just the UI. Updating the form later does not require consenting again.

After submitting, the client sees a short thank-you and lands on the home page.

## What the dietitian sees

On `/clients/:id`, alongside the existing weight section:

- An **at-a-glance summary** of the answers she asked for: health history (chronic diseases, surgeries, medications), **allergies/intolerances**, **meals per day**, goal, special diet. Empty answers are shown as "none"/"—", not hidden, so she knows the client answered.
- The **full answers**, grouped by the same 7 sections (readable on a phone; can be collapsed/expanded).
- Age (from birth date), height, and the **last updated** date.
- If the client has not submitted the form yet, a clear "not filled yet" state.

## Decisions made with the user

- Blood test upload: later; WhatsApp note for now.
- The client can update answers any time; the dietitian always sees the latest.
- Layout: step by step, 7 screens, progress bar, Back / Next.
- Age is derived from birth date; form weight becomes the first weight entry; only the client fills the form; no change history, just a last-updated date.
- The gate applies to all CLIENT accounts (old ones were test accounts and were removed).
- Explicit health-data consent checkbox on the last step, consent time stored.

## Calls made by the designer (check these)

- Seeding the first weight entry is skipped if the client already has weight entries.
- Consent is given once, at first submission; later updates don't ask again.
- Consent text above is a draft; the dietitian should review it before real clients use the app.

## Left to the builder

- Data model (one row per client is the expected shape; exact table/columns, how multi-choice sport types are stored) and the `V4__` migration.
- Endpoint names and shapes (client own form vs dietitian view of a client's form) and how the frontend learns whether the form is done (for the gate).
- Which fields are required. Expected: step 1 fields required; single-choice questions required; free-text "if any" fields optional.
- Whether the client's in-progress answers survive closing the browser mid-form ("continue where you left off") and how (browser storage vs server draft).
- Where exactly the client reaches "update my form" (Profile tab entry, or its own tab).
- Exact gender option wording.
