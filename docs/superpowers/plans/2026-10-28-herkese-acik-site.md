# Herkese açık site, davetle kayıt ve hizmet süresi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- Close open sign-up: accounts are created only through dietitian invite links that carry a package length.
- Lock clients whose package has ended, without deleting data, and let the dietitian manage access.
- Replace `/` with a short, eye-catching public landing page whose single call to action is WhatsApp.

**Architecture:**
- **Backend:**
  - An `invite` table, plus `app_user.access_until` (V8).
  - A `Clock` bean in Europe/Istanbul.
  - Services, each with its own rules: `ClientAccessService` (lock status and the four access actions), `InviteService` (create, list, delete, look up, consume) and `AuthService` (register only with an invite, login refuses locked clients).
  - `JwtAuthFilter` checks the lock on every CLIENT request and answers **HTTP 423**.
- **Frontend:**
  - Login and register pages are updated.
  - The dietitian gets an invite panel on Clients and an access panel on the client page.
  - A new `LandingPage` is built from small `components/landing/*` parts and a content data file.

**Tech Stack:** Spring Boot 4.1 / JPA / Flyway / MySQL, Mockito; React 19 + TS + Tailwind v4 (G theme tokens) + i18next.

**Spec:** `docs/superpowers/specs/2026-10-28-herkese-acik-site-design.md`

## Global Constraints

- **Packages and invites:**
  - Package lengths are **1, 3, 6** months; anything else → 400.
  - An invite is **single use** and expires **7 days** after creation.
  - Invite note is optional, trimmed, ≤ 60 characters.
- **Dates:**
  - "Today" = `LocalDate.now(clock)` with the clock in **Europe/Istanbul**.
  - `access_until` is the **inclusive** last day.
  - **Locked** ⇔ `accessUntil != null && accessUntil.isBefore(today)`. `NULL` = unlimited. Dietitians are never locked.
  - **Register:** `accessUntil = today.plusMonths(months)`.
- **Access actions:**
  - `ADD_MONTHS`: base = today if the client is locked or `NULL`, else the current `accessUntil`; then `accessUntil = base.plusMonths(m)`.
  - `SET_DATE`: sets the given date.
  - `UNLIMITED`: sets `NULL`.
  - `CLOSE_NOW`: sets today − 1 day.
- **Locked client:**
  - Gets **HTTP 423**, both on login and on any authenticated request.
  - Message: `Hizmet süren doldu. Devam etmek için diyetisyeninle iletişime geç.`
- **Messages** (Turkish backend messages):
  - Invite invalid, used or expired: `Davet linki geçersiz veya süresi dolmuş` (404 on lookup, 400 on register).
  - Wrong package length: `Paket süresi 1, 3 veya 6 ay olabilir`.
- **API:**
  - `/auth/**` stays permitAll, so only the invite **lookup** lives there.
  - Invite management and access endpoints are DIETITIAN only.
  - `PUT /users/{id}` must not touch `accessUntil` or role.
- **WhatsApp:**
  - The number comes from `VITE_WHATSAPP_NUMBER` (digits only, e.g. `905xxxxxxxxx`).
  - Contact links are `https://wa.me/<number>?text=<encoded>`.
  - Invite-share links are `https://wa.me/?text=<encoded>`.
- **Frontend rules:**
  - Theme tokens only.
  - TR and EN strings for UI.
  - Landing content (campaign, recipes, about) is Turkish data in code.
  - The dietitian's placeholder is an SVG illustration in **one file** (`DietitianAvatar.tsx`).
  - `npm run build` and `npm run lint` must be clean.
  - Must work at 375 px.
- **Working agreement:** Claude writes the code, and the user commits. At each commit step, list the files and wait for the user's `git --no-pager diff --staged --stat`.

## Review Focus

1. **Same invite used twice at once:** exactly one account is created. `consume` reads with a pessimistic lock. Covered by the test `consumeUsedInviteThrows` in Task 3 and the double-POST curl check in Task 5.
2. **Register fails after the invite was read** (duplicate email or username → 409): the invite stays unused. `register` is `@Transactional`. Covered by the test `registerDuplicateKeepsInviteUnused` in Task 4.
3. **Last day of the package:** `accessUntil == today` is **not** locked. Covered by the test `lastDayIsNotLocked` in Task 2.
4. **Month end:** 31 Jan + 1 month = 28/29 Feb (`plusMonths` clamps). Covered by the test `addMonthsClampsMonthEnd` in Task 2.
5. **Locked client still holding a valid JWT:** every API call returns 423, and the frontend sends them to `/login?reason=locked`. Covered by curl in Task 5 and a browser check in Task 6.

---

### Task 1: Schema, entities, clock

**Files:**
- Create:
  - `project/src/main/resources/db/migration/V8__add_invites_and_access_until.sql`
  - `.../entity/Invite.java`
  - `.../repository/InviteRepository.java`
  - `.../config/TimeConfig.java`
- Modify: `.../entity/User.java`: add `LocalDate accessUntil` (column `access_until`) with a getter and setter.

**Interfaces:**
- **Produces, SQL:**
  - `ALTER TABLE app_user ADD COLUMN access_until DATE NULL`
  - table `invite`:
    - `id`;
    - `token VARCHAR(64) NOT NULL` with `UNIQUE KEY uk_invite_token`;
    - `note VARCHAR(60) NULL`;
    - `months INT NOT NULL`;
    - `created_by_id BIGINT NOT NULL` with FK `fk_invite_created_by`;
    - `created_at DATETIME(6)`, `expires_at DATETIME(6)`, `used_at DATETIME(6) NULL`;
    - `used_by_id BIGINT NULL` with FK `fk_invite_used_by`.
  - Both FKs reference `app_user (id)`. InnoDB, utf8mb4.
- **Produces, `Invite`:**
  - Constructor: `Invite(User createdBy, String token, String note, int months, LocalDateTime createdAt, LocalDateTime expiresAt)`.
  - Getters for all fields.
  - `boolean isUsable(LocalDateTime now)` → `usedAt == null && now.isBefore(expiresAt)`.
  - `void markUsed(User user, LocalDateTime now)`.
- **Produces, `InviteRepository`:**
  - `Optional<Invite> findByToken(String token)`.
  - `@Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select i from Invite i where i.token = :token") Optional<Invite> findByTokenForUpdate(@Param("token") String token)`.
  - `List<Invite> findAllByUsedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now)`.
- **Produces, `TimeConfig`:** `@Bean Clock clock()`, which returns `Clock.system(ZoneId.of("Europe/Istanbul"))`.

- [ ] **Step 1:** Write V8, the entity changes, the repository and `TimeConfig`.
- [ ] **Step 2:** Run `mvnw.cmd -q test "-Dtest=ProjectApplicationTests" "-Dspring.profiles.active=local"`. Expected: exit 0, V8 applied, Hibernate validate passes.
- [ ] **Step 3:** User commits. Message: "Add invites table and client access_until".

### Task 2: ClientAccessService (TDD)

**Files:**
- Create:
  - `.../service/impl/ClientAccessService.java`
  - DTOs `.../dto/ClientAccessRequest.java` and `.../dto/ClientAccessResponse.java`
  - `.../exception/AccessRuleException.java` (400)
- Test: `project/src/test/java/com/project/project/service/impl/ClientAccessServiceTest.java`

**Interfaces:**
- **Constructor:** `ClientAccessService(UserRepository userRepository, Clock clock)`.
- **Methods:**
  - `LocalDate today()`
  - `boolean isLocked(User user)`: role CLIENT and the rule from Global Constraints.
  - `Integer daysLeft(User user)`: `null` when unlimited or locked; otherwise `ChronoUnit.DAYS.between(today, accessUntil)`.
  - `ClientAccessResponse getAccess(Long clientId)`
  - `@Transactional ClientAccessResponse updateAccess(Long clientId, ClientAccessRequest request)`
- **`ClientAccessRequest`:**
  - `action` is an enum `ClientAccessRequest.Action { ADD_MONTHS, SET_DATE, UNLIMITED, CLOSE_NOW }` and is `@NotNull`.
  - `Integer months` is required for ADD_MONTHS, and must be one of 1/3/6, otherwise `AccessRuleException("Paket süresi 1, 3 veya 6 ay olabilir")`.
  - `LocalDate date` is required for SET_DATE, otherwise `AccessRuleException("Bitiş tarihi gerekli")`.
- **`ClientAccessResponse`:** `LocalDate accessUntil`, `boolean locked`, `Integer daysLeft`.
- **Client lookup:** must have role CLIENT, else `UserNotFoundException` (404). Same rule as `WeightEntryService.findClientById`.

- [ ] **Step 1: Write the failing tests.** Use a fixed clock, `Clock.fixed(Instant.parse("2026-10-28T09:00:00Z"), ZoneId.of("Europe/Istanbul"))`, so today = 2026-10-28.
  - Lock status:
    - `lastDayIsNotLocked`: `accessUntil` 2026-10-28 → `isLocked` is false and `daysLeft` is 0.
    - `pastDayIsLocked`: 2026-10-27 → locked, and `daysLeft` is null.
    - `unlimitedIsNotLocked`: `NULL` → not locked, and `daysLeft` is null.
    - `dietitianNeverLocked`: a DIETITIAN with a past date → not locked.
  - ADD_MONTHS:
    - `addMonthsFromEndWhenActive`: active until 2026-11-10, +3 → 2027-02-10.
    - `addMonthsFromTodayWhenLocked`: until 2026-10-01, +1 → 2026-11-28.
    - `addMonthsFromTodayWhenUnlimited`: `NULL`, +6 → 2027-04-28.
    - `addMonthsClampsMonthEnd`: clock fixed to 2027-01-31, `NULL`, +1 → 2027-02-28.
    - `addMonthsRejectsTwo`: months 2 → `AccessRuleException`.
  - Other actions:
    - `setDateCanShortenOrLock`: SET_DATE 2026-10-20 → locked true.
    - `unlimitedSetsNull`.
    - `closeNowLocksImmediately`: → `accessUntil` 2026-10-27 and locked true.
  - `nonClientIs404`.
- [ ] **Step 2:** Run `mvnw.cmd test "-Dtest=ClientAccessServiceTest"`. Expected: compile FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the test again. Expected: PASS.
- [ ] **Step 5:** User commits. Message: "Add client access rules: lock status and add, set, unlimited, close actions".

### Task 3: InviteService (TDD)

**Files:**
- Create:
  - `.../service/impl/InviteService.java`
  - DTOs `InviteCreateRequest`, `InviteResponse`, `InviteLookupResponse`
  - `.../exception/InviteInvalidException.java`
- Test: `.../service/impl/InviteServiceTest.java`

**Interfaces:**
- **Constructor:** `InviteService(InviteRepository inviteRepository, UserRepository userRepository, Clock clock)`.
- **`InviteCreateRequest`:** `@NotNull Integer months`; `@Size(max = 60) String note`.
- **`InviteResponse`:** `Long id`, `String token`, `String note`, `int months`, `LocalDateTime createdAt`, `LocalDateTime expiresAt`.
- **`InviteLookupResponse`:** `int months`.
- **Methods:**
  - `@Transactional InviteResponse create(String dietitianUsername, InviteCreateRequest r)`:
    - months not 1/3/6 → `AccessRuleException` (from Task 2);
    - token = 32 random bytes from `SecureRandom`, Base64-URL without padding;
    - blank note → null;
    - `expiresAt = now + 7 days`.
  - `List<InviteResponse> listOpen()`: open invites, newest first.
  - `@Transactional void delete(Long id)`: only an unused invite; missing or used → `InviteInvalidException`.
  - `InviteLookupResponse lookup(String token)`: not usable → `InviteInvalidException`.
  - `Invite consume(String token, User user)`:
    - **must be called inside the caller's transaction**;
    - uses `findByTokenForUpdate`;
    - not usable → `InviteInvalidException`;
    - otherwise `markUsed(user, now)` and returns the invite.
- **Error:** `InviteInvalidException(String message)` uses the fixed message "Davet linki geçersiz veya süresi dolmuş".

- [ ] **Step 1: Write the failing tests:**
  - `createRejectsFourMonths`
  - `createSetsSevenDayExpiryAndTrimsNote`: note `"  "` → null.
  - `tokensAreUniqueAndUrlSafe`: two creates give different tokens matching `[A-Za-z0-9_-]{43}`.
  - `lookupExpiredThrows`
  - `lookupUsedThrows`
  - `consumeUsedInviteThrows`
  - `consumeMarksUsed`
  - `deleteUsedInviteThrows`
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** User commits. Message: "Add invite service: single-use 7-day links with package length".

### Task 4: Register with invite, login refuses locked (TDD)

**Files:**
- Modify: `.../service/impl/AuthService.java`, `.../controller/AuthController.java`
- Create:
  - `.../dto/RegisterRequest.java`
  - `.../exception/ClientAccessLockedException.java`
- Modify: `.../exception/GlobalExceptionHandler.java`, to map:
  - `AccessRuleException` → 400;
  - `InviteInvalidException` → 404;
  - `ClientAccessLockedException` → **423** (`HttpStatus.LOCKED`).
- Test: `.../service/impl/AuthServiceTest.java` (new)

**Interfaces:**
- **`RegisterRequest`:** `username`, `email`, `password` (same validation as `UserCreateRequest`) plus `@NotBlank inviteToken`.
- **`AuthService`:**
  - New constructor: `AuthService(UserRepository, PasswordEncoder, JwtService, InviteService, ClientAccessService)`. `UserService` is dropped if it is no longer used.
  - `@Transactional UserResponse register(RegisterRequest r)`:
    - saves a new CLIENT user with the encoded password and `accessUntil = today.plusMonths(invite.getMonths())`;
    - then calls `inviteService.consume(token, user)`.
    - **Order:** take the invite lock first (`consume`), then save the user and set the dates. A duplicate key then rolls the whole transaction back.
    - A used, expired or invalid invite → `InviteInvalidException`. The controller maps it to **400** for register by catching it and rethrowing an `AccessRuleException` with the same message.
  - `login`: after the password check, if `clientAccessService.isLocked(user)` → throw `ClientAccessLockedException("Hizmet süren doldu. Devam etmek için diyetisyeninle iletişime geç.")`.
- **`AuthController`:**
  - `POST /auth/register` takes `RegisterRequest`.
  - New `GET /auth/invites/{token}` → `InviteLookupResponse`.

- [ ] **Step 1: Write the failing tests:**
  - `registerWithoutValidInviteFails`
  - `registerSetsAccessFromToday`: 3 months, clock 2026-10-28 → 2027-01-28, role CLIENT.
  - `registerDuplicateKeepsInviteUnused`:
    - `userRepository.save` throws `DataIntegrityViolationException`;
    - assert it propagates and `invite.getUsedAt()` is null.
    - With a mocked repository, this means `markUsed` happens **after** a successful save. Order the code accordingly: lock and validate first, save, then mark used.
  - `loginLockedClientThrows423Exception`
  - `loginLastDayClientSucceeds`
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Implement. Split `InviteService.consume` into `Invite lockUsable(String token)` and `void markUsed(Invite, User)` if the test order needs it. Update Task 3's tests to match.
- [ ] **Step 4:** Run all service tests: `mvnw.cmd test "-Dtest=TaskServiceTest,IntakeFormServiceTest,ClientReviewServiceTest,DietPlanServiceTest,DietLibraryServiceTest,ClientAccessServiceTest,InviteServiceTest,AuthServiceTest"`. Expected: all pass.
- [ ] **Step 5:** User commits. Message: "Register only with an invite; refuse login for clients whose package ended".

### Task 5: Endpoints, per-request lock, client overview

**Files:**
- Create:
  - `.../controller/InviteController.java`: `/invites`, DIETITIAN. `POST` → 201 `InviteResponse`; `GET` → open list; `DELETE /{id}` → 204.
  - `.../controller/ClientAccessController.java`: `/clients/{clientId}/access`, DIETITIAN. `GET` and `PUT` (body `ClientAccessRequest`) → `ClientAccessResponse`.
- Modify `.../security/JwtAuthFilter.java`:
  - inject `UserRepository` and `ClientAccessService`;
  - when role is `CLIENT`, load the user by username;
  - if the user is missing or `isLocked`, write a 423 JSON `{"status":423,"message":"Hizmet süren doldu. Devam etmek için diyetisyeninle iletişime geç."}` with UTF-8 and return without calling the chain.
- Modify `.../dto/ClientOverviewResponse.java`: add `LocalDate accessUntil`, `boolean locked`, `Integer daysLeft`.
- Modify `.../service/impl/ClientReviewService.java`:
  - add `ClientAccessService` to the constructor and fill the new fields;
  - update `ClientReviewServiceTest`'s constructor call with a mock.
- Modify `.../service/impl/UserService.java` only if `updateUser` would copy role or `accessUntil`. It should not.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Run all service tests (the command from Task 4) and the context test. Expected: pass.
- [ ] **Step 3: Verify with curl** against a test instance on :8081, the same approach as the last feature. Use temporary accounts and UTF-8 JSON files.
  - **Register without an invite:**
    - `POST /auth/register` without `inviteToken` → 400.
    - With a garbage token → 400.
  - **Invites:**
    - As a temporary dietitian, `POST /invites {"months":1,"note":"Ayşe Y."}` → 201.
    - `GET /auth/invites/{token}` → `{"months":1}`.
  - **Register with an invite:**
    - `POST /auth/register` with the token → 201.
    - The same token again → 400.
    - Two parallel registers with one fresh token → exactly one 201.
  - **Client access:**
    - As the dietitian, `GET /clients` shows `accessUntil` = today + 1 month and `locked` false.
    - Log in as the client and keep the token.
    - Dietitian `PUT /clients/{id}/access {"action":"CLOSE_NOW"}`.
    - The client's old token on `GET /weights` → 423 with the Turkish message.
    - Client login → 423.
    - Dietitian `{"action":"ADD_MONTHS","months":3}` → `accessUntil` = today + 3 months, and the client can log in again with their weights intact.
  - **Forbidden:** a client calling `/invites` → 403.
  - **Clean up:** delete the temporary users and invites.
- [ ] **Step 4:** User commits. Message: "Add invite and client access endpoints; lock expired clients on every request".

### Task 6: Frontend auth (login, register, 423, WhatsApp)

**Files:**
- Modify:
  - `client/.env.example`: add `VITE_WHATSAPP_NUMBER=905000000000`.
  - `client/src/vite-env.d.ts`: add `readonly VITE_WHATSAPP_NUMBER: string`.
- Create:
  - `client/src/utils/whatsapp.ts`: `whatsappContactLink(text: string): string` and `whatsappShareLink(text: string): string`.
  - `client/src/components/WhatsAppButton.tsx`: props `{ text: string; label: string; size?: 'lg' | 'md'; pulse?: boolean }`. Opens `whatsappContactLink(text)` with `target="_blank" rel="noopener"`. The color is WhatsApp green `#25d366`, added as theme token `--color-whatsapp`.
- Modify `client/src/services/apiClient.ts`: on **423** for a request that carried a token, call `clearSession()` and then `window.location.replace('/login?reason=locked')`.
- Modify `client/src/types/auth.ts`: `RegisterRequest` gains `inviteToken: string`; add `InviteLookup = { months: number }`.
- Modify `client/src/services/authService.ts`: add `lookupInvite(token): Promise<InviteLookup>`.
- Modify `client/src/pages/LoginPage.tsx`:
  - remove the "Kayıt ol" link;
  - show the locked message plus `WhatsAppButton` when `reason=locked` **or** when login returns `ApiError` 423.
- Modify `client/src/pages/RegisterPage.tsx`:
  - read `?invite`;
  - while looking up, show loading;
  - on an invalid invite, show the "Kayıt yalnızca davetle" card with `WhatsAppButton`;
  - on a valid invite, show the form plus the line `register.packageLine` ("Paketin: {{months}} ay") and send `inviteToken`.
- i18n (TR/EN):
  - `register.inviteOnlyTitle`, `register.inviteOnlyText`, `register.packageLine`, `register.checkingInvite`
  - `login.lockedTitle`, `login.lockedText`
  - `whatsapp.ask`, `whatsapp.contact`, `whatsapp.lockedMessage`

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Run `npm run build` and `npm run lint`. Expected: clean.
- [ ] **Step 3: Browser check at 375 px** (test instance):
  - `/register` without a token → the invite-only card;
  - with a valid token → the form with "Paketin: 1 ay", and registering works;
  - a locked client's open session → redirected to `/login?reason=locked` with the message and WhatsApp button.
- [ ] **Step 4:** User commits. Message: "Invite-only register page, locked login message and WhatsApp button".

### Task 7: Dietitian UI: invites and access

**Files:**
- Create:
  - `client/src/types/invite.ts`
  - `client/src/types/access.ts`
  - `client/src/services/inviteService.ts`: `createInvite`, `getOpenInvites`, `deleteInvite`.
  - `client/src/services/accessService.ts`: `getClientAccess`, `updateClientAccess`.
- Create `client/src/components/invites/InvitePanel.tsx`, a bottom sheet opened from a "Davet oluştur" button in the `ClientsPage` hero:
  - month chips 1 / 3 / 6, an optional note input (maxLength 60) and a "Link oluştur" button;
  - the result shows the link `${window.location.origin}/register?invite=${token}` with **Kopyala** (`navigator.clipboard`, then shows "Kopyalandı") and **WhatsApp'ta paylaş** (`whatsappShareLink(t('invites.shareText', { link, months }))`);
  - below, the open invites (note or "İsimsiz", months, expiry date) with delete.
- Modify `client/src/pages/ClientsPage.tsx` card badges:
  - `locked` → "Süresi doldu" (`bg-coral/20 text-ink`);
  - `daysLeft !== null && daysLeft <= 7` → "{{count}} gün kaldı" (`bg-peach text-peach-ink`).
  - Update `types/client.ts`.
- Create `client/src/components/AccessPanel.tsx`, a "Hizmet süresi" card on `ClientDetailPage`, placed above `IntakeSummary`:
  - status line: unlimited / until date (days left) / locked;
  - buttons +1 ay, +3 ay, +6 ay;
  - a date input with "Kaydet";
  - "Süresiz yap";
  - "Erişimi hemen kapat" with `window.confirm`.
  - Each action calls `updateClientAccess` and updates the card.
- i18n: `invites.*`, `access.*`, `clients.badges.expired`, `clients.badges.daysLeft`.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Run `build` and `lint`. Expected: clean.
- [ ] **Step 3: Browser check at 375 px:**
  - create an invite → copy works and the WhatsApp link has the encoded text;
  - delete an invite;
  - each of the four access actions changes the status line and the card badge.
- [ ] **Step 4:** User commits. Message: "Dietitian invite panel and client access controls".

### Task 8: Landing page

**Files:**
- Create:
  - `client/src/pages/LandingPage.tsx`
  - `client/src/landing/content.ts`: Turkish data.
    - `CAMPAIGN { tag, title, text }`
    - `RECIPES: Recipe[]` with `{ id, emoji, tone, name, minutes, meal, ingredients: string[], steps: string[] }`; four recipes as in the mockup.
    - `ABOUT { title, text, tags: { label, tone }[] }`
  - Components in `client/src/components/landing/`:
    - `DietitianAvatar.tsx`: the SVG placeholder; the comment says replace this file with the real photo.
    - `LandingHero.tsx`
    - `CampaignCard.tsx`
    - `AppShowcase.tsx`: four HTML/CSS phone frames in the G style: home, menu, weight chart, intake.
    - `StartSteps.tsx`
    - `RecipeRow.tsx` and `RecipeSheet.tsx` (bottom sheet; Esc and backdrop close it; scroll is locked while open).
    - `AboutCard.tsx`
    - `FinalCall.tsx`
    - `FloatingWhatsApp.tsx`
- Modify `client/src/App.tsx`: `/` → `LandingPage` (outside `AuthLayout` and `AppShell`).
- i18n: `landing.*` for UI strings (headline, subtitle, chips, section titles, steps, buttons, "Danışan girişi", "Uygulamaya git").
- `index.html`: set `<title>tane. online diyet</title>` and a meta description.

**Interfaces:**
- **Hero top right:** `isLoggedIn()` ? link "Uygulamaya git" to `/dashboard` (dietitians are redirected on from there) : link "Danışan girişi" to `/login`. There is also the TR/EN `LanguageToggle`.
- **Layout:** sections follow the approved mockup order. On ≥ `sm` the page is a centered column, `max-w-3xl`, with the showcase and recipe rows still horizontal.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Run `build` and `lint`. Expected: clean.
- [ ] **Step 3: Browser check** at 375 px and at desktop width:
  - all seven sections render in order;
  - the rows scroll sideways;
  - a recipe opens and closes;
  - the WhatsApp links use the configured number;
  - no "Kayıt ol" anywhere;
  - logged out → "Danışan girişi", logged in → "Uygulamaya git".
- [ ] **Step 4:** User commits. Message: "Public landing page: hero, campaign, app showcase, steps, recipes, about, WhatsApp".

### Task 9: Notes

- [ ] **Step 1: Update `CLAUDE.md`:**
  - V8;
  - invite and access sections;
  - the 423 lock in the filter;
  - `/` = landing;
  - `VITE_WHATSAPP_NUMBER`.
- [ ] **Step 2: Update `DEVAM_NOTU.md`:**
  - step 4 done;
  - next ideas: real photo, editable campaigns and recipes, calories.
  - Remind the user to put the real WhatsApp number in `.env`.
- [ ] **Step 3:** User commits the spec and the plan: `git add docs/superpowers/specs/2026-10-28-herkese-acik-site-design.md docs/superpowers/plans/2026-10-28-herkese-acik-site.md`.
