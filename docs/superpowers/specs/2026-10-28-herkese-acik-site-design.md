# Herkese açık site, davetle kayıt ve hizmet süresi — design

Date: 2026-10-28 · Status: landing mockup approved in chat ("güzel olmuş, bununla devam edelim"); rules below come from the conversation.

## Why

People hear about the dietitian (Betül Bağcı, "tane. online diyet") on Instagram or from friends. They need somewhere to land.

Similar Turkish dietitian sites exist (gizempolat.com, diyetisyenkubrayazici.com, yevefitkal.com, dietlabonline.com). The user's verdict: "too detailed and tiring, nobody reads everything" and "too plain". Ours should be short, scannable, eye-catching and mobile-first, in the app's "G" look: green gradient hero, honey accents, colorful tiles, animations.

The sales flow happens off-site:
1. The visitor writes to the dietitian on **WhatsApp** and gets information.
2. If they buy, they pay by **IBAN transfer**.
3. The dietitian sends them an **invite link**.
4. Only then do they open an account and fill in the intake form.

People who have not bought must not be able to sign up. In the user's words, random accounts are "gereksiz veri" (useless data) and would confuse the dietitian. The app is used **for the length of the purchased package**. When it ends the account is locked but kept. When the dietitian reopens it, the client continues where they left off.

## Goals

### A. Invite-only registration
1. Public self-registration is closed. `POST /auth/register` without a valid invite is rejected.
2. The dietitian creates an **invite** in the app, with an optional short note saying who it is for (e.g. "Ayşe Y.", ≤ 60 characters, shown on the open-invite list), and picks a **package length**: 1, 3 or 6 months (see "Calls made by Claude").
   - The app shows a link `<site>/register?invite=<token>` with **Copy** and **Share on WhatsApp** buttons. Share uses `https://wa.me/?text=<message with link>`.
3. An invite is **single use** and **expires 7 days** after creation.
   - The register page opened with a valid invite shows the normal form, plus a line saying which package was granted.
   - With a missing, used or expired invite, the page shows "Kayıt yalnızca davetle" (registration is by invite only) and a WhatsApp button. It shows no form.
4. Registering with an invite creates a `CLIENT` whose access lasts **package months from the registration day**, and marks the invite used.
5. The dietitian can see her open (unused, unexpired) invites and delete one.

### B. Service period (hizmet süresi)
1. Each client has an `access_until` date (last day of access). A client with `access_until` in the past is **locked**.
2. **Locked behavior:**
   - Login fails with a clear message: "Hizmet süren doldu…" (your service period has ended), plus a WhatsApp button on the login page.
   - Any API call by a locked client is rejected, **even with a still-valid JWT**. Tokens are stateless, so the check must happen per request, not only at login.
   - The frontend sends a locked client to the login page with that message.
   - No data is deleted.
3. **Managing access** (client page, "Hizmet süresi" panel). Four actions, all asked for by the user:
   - **Add a package (1/3/6 months):** extends **from today** if the client is locked or unlimited (`NULL`), or **from the current end date** if still active. This is how the dietitian reopens an account; nothing else changes, so the client "continues where they left off".
   - **Set the end date** to a specific date. This is used to fix or shorten a wrong period. A date in the past locks the client.
   - **Make unlimited:** `access_until = NULL`.
   - **Close access now** (refund or quitting): locks immediately with `access_until = yesterday`, after a confirm dialog.
   - None of these delete data.
4. **Dietitian view:** client cards show the status: "X gün kaldı" (days left) when 7 or fewer days remain, and a "Süresi doldu" (expired) badge when locked. The client page shows the end date.
5. **Existing clients** (created before this change) get `access_until = NULL`, which means **no limit**, until the dietitian sets a package for them. Dietitians are never locked.

### C. Public landing page
`/` becomes the landing page; today it is the login page. `/login` stays.

Sections in order, as in the approved mockup `.superpowers/brainstorm/*/content/landing-v1.html`:

1. **Hero:**
   - Green gradient with floating blobs, logo, and a top-right "Danışan girişi" (client login) link. There is **no sign-up link anywhere**.
   - A short headline with a honey-colored word, and a one-line subtitle.
   - The dietitian's **placeholder illustration** (an SVG avatar, not a photo of a real person), name and title. The real photo will later replace one file.
   - A big pulsing **WhatsApp** button, and three ✓ chips.
2. **Campaign:** a shining honey card (tag, title, one line).
3. **"Diyet takip sistemi":** a horizontally scrolling row of phone frames showing the app's screens (home, menu, weight chart, intake form), each with a short caption. They are drawn in HTML/CSS in the G style, not image files, so they stay sharp and need no assets.
4. **"Nasıl başlarım?"** (how do I start): four step cards — WhatsApp → choose a package (transfer) → invite link → menu on your phone.
5. **Recipes:** a horizontally scrolling row of cards (emoji on a pastel tile, name, minutes, meal type). Tapping one opens a **bottom sheet** with ingredients and steps.
6. **About:** "Merhaba, ben Betül" (hi, I'm Betül), two sentences, and specialty tags.
7. **Final call:** a green card with a WhatsApp button.
8. A **floating WhatsApp button** stays visible at the bottom right on mobile.

Content rules:
- Campaign, recipes, about text and specialty tags live in **code** (a data file) for now. The user said: "kod tarafında yap, sonra resimle tasarımla filan yaparız" (keep it in code for now; we'll add images and design later).
- The texts are examples the dietitian will replace.
- UI strings exist in TR and EN (TR default), with a TR/EN toggle in the hero. Recipe and campaign content is Turkish only, like the menus.
- Mobile first, and it must also look right on desktop: a centered column, with phone frames and recipes in a row.
- `prefers-reduced-motion` turns animations off, like the rest of the app.

## Non-goals

- Online payment and package prices on the site; prices are discussed on WhatsApp.
- A CMS for campaigns and recipes, and real photos or images.
- Email sending.
- Multiple dietitians.
- Blog or SEO work beyond a proper `<title>` and description.

## Anti-goals

- Long walls of text. Every section must be scannable in a few seconds on a phone.
- Any path that lets a non-buyer create an account.
- Losing a client's data when their period ends.
- Locking out an active client by mistake. Today counts as "still active": locked means `access_until < today`.

## Constraints

Follow `CLAUDE.md`:
- New Flyway migration(s) with named constraints.
- DTO-only API.
- The owner and dietitian come from the token.
- DIETITIAN-only endpoints for invites and access changes.
- Backend messages are in Turkish.
- Mockito unit tests for the rules: invite validity, register with or without an invite, lock check, and extend from today vs from the end date.
- Frontend: `apiRequest`, types in `src/types`, theme tokens only, `build` and `lint` clean, works at phone width.

The `/auth/**` permitAll rule means the invite **lookup** endpoint used by the register page can live under `/auth`. Creating and listing invites needs the dietitian and must **not** be under `/auth`.

The WhatsApp number is configuration (`VITE_WHATSAPP_NUMBER`), not hard-coded. A placeholder goes in `.env.example`.

## Calls made by Claude (check these)

- The package lengths offered are **1, 3 and 6 months**.
- Invite links are single use and expire after **7 days**.
- Access is counted from the **registration day**, not the invite day.
- Adding a package extends from today if the client is locked or unlimited, else from the current end date.
- **Dates:** "Today" is computed in the **Europe/Istanbul** time zone, through an injected `Clock`. The end date is **inclusive**, so it is the last day the client can use the app. A package of N months started on day D ends on D + N months; for example, 1 month from 28 Oct runs to 28 Nov.
- **`/users`:** The existing `UserController` `/users` CRUD stays dietitian-only, and `PUT /users/{id}` cannot change `access_until` or role. This is not a public sign-up path, so the "no account without buying" rule holds. Only the "Hizmet süresi" actions change `access_until`.
- Existing clients are unlimited (`NULL`) until a package is set.
- A logged-in user who opens `/` still sees the landing page. "Danışan girişi" becomes "Uygulamaya git" (go to the app) and goes to their home.
- The phone screens on the landing page are drawn in HTML/CSS rather than real screenshots.

## Left to the builder

- Table and endpoint shapes, token format (random, URL-safe, not guessable), and where the per-request lock check lives (filter vs. service).
- How the frontend learns the client is locked (status code or error code), as long as the user sees the specific message.
- The landing component structure and the exact example texts.
