# KVKK: aydınlatma, açık rıza, silme, dışa aktarma ve görüntüleme kaydı — design

Date: 2026-10-29 · Status: approved in chat ("evet doğru, tasarım belgesini yaz").

## Why

The app stores **health data** of Turkish clients: the intake form (diseases, surgeries, medications, allergies, digestion) and weights. Under KVKK (Law No. 6698), health data is a *special category*. Processing it needs:

- an information notice (aydınlatma metni);
- explicit consent (açık rıza) that is recorded;
- the data subject's rights: access, correction, deletion;
- appropriate security measures;
- storage limitation.

Today:
- There is one inline consent checkbox on the intake form, and only its timestamp is stored (`intake_form.consent_given_at`). Nothing records which text was accepted.
- There is no notice page.
- There is no way to delete or export a client's data. The FKs to `app_user` have no `ON DELETE`.
- Nothing records who viewed health data.
- Fonts load from Google, so every visitor's IP goes to Google.

The dietitian and the user will test with real use soon, so this must exist before real clients use the app.

**Legal note:** all texts are drafts. They need review by a lawyer or KVKK consultant before going live. Placeholders (address, e-mail) are filled in by the dietitian.

## Decisions from the conversation

- **Data controller:** Dyt. Betül Bağcı, as an individual (şahıs).
- **Requests:** clients send deletion and access requests **on WhatsApp to the dietitian**. The dietitian performs them in the app. Clients have **no** self-service export or delete.
- **Retention:** keep a finished client's data for **2 years** after the service ends, then delete it **automatically**.

## Goals

### A. Texts and pages
1. **Public page `/gizlilik`** ("Gizlilik ve KVKK"), linked from the landing footer, the register page, the intake consent and the user menu. It holds the **aydınlatma metni**:
   - identity: Dyt. Betül Bağcı (şahıs), address and e-mail placeholders;
   - which data is processed: identity and contact, intake answers including health data, weights, diet programs, and technical logs;
   - purposes: the dietitian service and follow-up;
   - legal bases: explicit consent for health data; contract performance for the rest;
   - recipients: none; hosting as a placeholder (data transfer abroad depends on where the server will be);
   - retention: 2 years after the service ends;
   - rights under KVKK Article 11, and how to apply: WhatsApp and the e-mail placeholder.

   It also holds an **açık rıza metni** (explicit consent text) as a separate section.
2. **Texts live in code** (a content file, Turkish), each with a **version** string such as `"2026-10-29"`.
   - Only the version of the consent text matters for re-consent.
   - The notice version is shown on the page.
   - English UI strings exist only for page chrome. The legal text is Turkish.

### B. Recorded consent
3. A new table **`consent_record`** stores `user_id`, `version`, `accepted_at`, and the hash of the exact text shown. A row is added on every acceptance, so the history is kept.
4. **First acceptance:**
   - The intake form's consent checkbox links to the consent text. Its label says "Açık rıza metnini okudum ve onaylıyorum".
   - Submitting the first form records a `consent_record` with the **current version**.
   - `intake_form.consent_given_at` stays for backwards compatibility.
5. **Re-consent when the text changes:**
   - A client whose latest accepted version is not the current one, which includes existing clients who only have the old checkbox, is sent after login to a **consent screen**. It shows the text with an "Onaylıyorum" button. This works like `IntakeGate`.
   - They cannot use the app until they accept.
   - Declining shows "Onay vermeden devam edemezsin, sorun için diyetisyenine WhatsApp'tan yaz", with the WhatsApp button and logout.
   - Dietitians are not gated.

### C. Export and deletion (by the dietitian, on request)
6. **"Verileri dışa aktar"** on the client page opens a **printable page** with everything stored about the client:
   - account (username, e-mail, created date, service period);
   - intake answers with consent records;
   - all weights;
   - all diet programs;
   - the view log (D).

   The dietitian saves it as PDF with the browser's print and sends it on WhatsApp. Opening the export is itself logged.
7. **"Danışanı ve verilerini sil"** on the client page permanently deletes, in one transaction:
   - the user;
   - the intake form;
   - weights (including those entered by the dietitian);
   - diet programs and their meals;
   - the client review;
   - consent records;
   - view logs about the client.

   Invites the client used keep their row, with `used_by` set to NULL.
   - **Strong confirmation:** the dietitian types the client's username into the confirm sheet.
   - A **deletion record** without personal data is kept: deleted-at, by whom, and a reason "talep" or "süre". This proves the deletion happened.
8. **Automatic deletion:**
   - A daily job deletes clients whose `access_until` is more than **2 years** in the past, using the same deletion and reason "süre".
   - Clients with `access_until = NULL` (unlimited) are never auto-deleted.
   - The client page shows "Veriler {date} tarihinde otomatik silinecek" when a client is locked.

### D. View log
9. Record **every time a dietitian opens a client's health data**: the client page (intake summary) and the export. Store viewer, client, action (`VIEW_INTAKE` / `EXPORT`) and timestamp in **`access_log`**.
   - It appears in the export.
   - It is visible to the dietitian on the client page, collapsed, as "Görüntüleme kaydı".
   - Entries older than 2 years are purged by the daily job.

### E. Small privacy fixes
10. **Self-host Inter Tight**:
    - use the `@fontsource` package (same weights, 400 to 800);
    - remove the Google Fonts links from `index.html`;
    - the look must not change.

## Non-goals

- Client self-service export or delete.
- A cookie banner: no tracking or analytics cookies exist; only `localStorage` for the session token and drafts. The privacy page mentions this.
- Encryption at rest, backups, TLS and hosting: these belong to the deployment step A4.
- E-mail sending.
- A correction workflow: clients already edit their intake form; the dietitian corrects other data in the app.
- A legal review of the text (outside the code).

## Anti-goals

- Deleting a client partially: a failure must roll everything back.
- Deleting by mistake: no one-click delete; it needs a typed confirmation.
- A consent wall that loses data: the intake draft, the weights and the rest stay; the gate only blocks until acceptance.
- Logging health data contents in `access_log` or server logs: store only ids and the action.

## Constraints

Follow `CLAUDE.md`:
- new Flyway migration(s) with named constraints;
- DTO-only API, with the owner from the token;
- DIETITIAN-only endpoints for export, delete and logs;
- CLIENT-only endpoints for own consent;
- Mockito tests for consent version logic, deletion (all repositories called, order respects FKs, deletion record written), the auto-delete selection (2 years after `access_until`, `NULL` never) and the access log;
- frontend: `useFeedback` confirm, tokens only, `usePageTitle`, TR/EN chrome, phone width;
- `build` and `lint` clean;
- "today" uses the Istanbul `Clock`.

## Calls made by Claude (check these)

- The re-consent gate blocks the app until the client accepts.
- Export is a printable HTML page, not a generated PDF file.
- Deletion is a hard delete, plus a deletion record without personal data.
- The view log covers intake views and exports only; weights and menus are not "special category" health data in the same sense.
- The 2-year auto-delete counts from `access_until`, which is the service end.

- **First consent vs. the re-consent gate:**
  - A new client (no intake form yet) gives first consent through the intake checkbox. `PUT /intake` with `consent=true` writes the first `consent_record` with the current version.
  - The re-consent gate applies only to clients who **already have an intake form** and whose latest accepted version is not the current one. Old clients have no record, so they are gated once.
  - Gate order on the frontend: IntakeGate first, then the consent gate.
- **The server enforces consent:**
  - The intake form's existing `consent_given_at` counts as no current record.
  - `JwtAuthFilter` (already loading every CLIENT per request) returns **428 Precondition Required** for a client with an intake form but no current consent, except on the consent endpoints and `/auth/**`.
  - The frontend `apiClient` maps 428 to the consent screen, the way it maps 423.
- **The backend is the source of truth for the texts:**
  - The notice and consent texts (Turkish) and their versions live in the backend, as resources or a constants class.
  - They are served publicly by `GET /legal/privacy` and `GET /legal/consent` (`/legal/**` is `permitAll`).
  - `/gizlilik` and the consent screen render what the server returns.
  - The SHA-256 hash is computed on the server; accepting sends only the version, and a stale version → 409.
- **The deletion record** keeps only the deleted user's **numeric id**, plus `deleted_at`, the deleting dietitian's id and the reason. It has no name, e-mail or health data.
- **Deletion also removes** the client's `task` rows (an FK from V1). The order must respect all FKs to `app_user` (V1–V8).

## Left to the builder

- Exact table shapes, the scheduling mechanism (`@Scheduled` daily; with time zone), endpoint paths, and the hash function (SHA-256).
- How the consent gate composes with `IntakeGate`. Suggested order: consent first, then intake.
- The wording of the draft texts. Keep it plain, sincere and short, and match the "sen" tone for clients.
