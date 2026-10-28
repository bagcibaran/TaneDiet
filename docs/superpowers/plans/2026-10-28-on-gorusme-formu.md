# Ön Görüşme Formu (Intake Form) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **In this project the user writes the code himself, step by step, guided by Claude** (see `DEVAM_NOTU.md`): Claude explains each step in Turkish with the full code, the user types it, Claude verifies (reads files, builds, runs tests). The user commits; before each commit he pastes `git --no-pager diff --staged --stat` for Claude to check.

**Goal:** Every client fills the dietitian's 7-section pre-interview form (step by step, with explicit health-data consent) before using the app, can update it later, and the dietitian sees the answers on the client's page.

**Architecture:** One `intake_form` row per client (V4 migration, `IntakeForm` entity, choice answers as Java enums stored in MySQL `ENUM` columns). `IntakeFormService` holds the rules (consent on first save, first-weight seeding, ownership). Client endpoints `/intake` and dietitian endpoint `/clients/{clientId}/intake`. Frontend: an `IntakeGate` wraps the app shell and sends clients without a form to `/intake`, a config-driven 7-step wizard, and an `IntakeSummary` card on the client detail page.

**Tech Stack:** Spring Boot 4.1 / JPA / Flyway / MySQL, JUnit 5 + Mockito; React 19 + TypeScript + React Router 7 + i18next + Tailwind v4 (theme tokens in `src/index.css`).

**Spec:** `docs/superpowers/specs/2026-10-28-on-gorusme-formu-design.md`

## Global Constraints

- Gate applies to every `CLIENT` account; dietitians are never gated.
- Consent checkbox on the last step is required on **first** submission and is enforced by the backend (400 without it); `consent_given_at` stored; updates never ask again.
- Consent copy (TR): "Bu formda paylaştığım sağlık bilgilerimin, beslenme danışmanlığı hizmeti kapsamında diyetisyenim tarafından işlenmesine açık rıza veriyorum." (EN: "I give my explicit consent for the health information I share in this form to be processed by my dietitian for the purpose of nutrition counselling.")
- Blood-test note (step 2) copies the paper form: results from the last 3 months via WhatsApp; otherwise a test with Tam Kan Sayımı, Açlık Kan Şekeri, İnsülin, HbA1c, Tiroid Testleri (TSH, T3, T4), Demir, B12, D Vitamini, Kolesterol ve Trigliserid Profili, Karaciğer ve Böbrek Fonksiyon Testleri; and: ask your doctor for nutrition advice if you have a chronic disease or regular medication.
- Age is never asked; it is computed from `birthDate`.
- First submission seeds a weight entry (today, entered by the client) **only if the client has no weight entries**. Updates never add weight entries.
- No blood-test upload, no answer history, dietitian cannot edit.
- Every UI string in both `tr.json` and `en.json`. Use theme tokens (`bg-brand`, `text-muted`, …) and `components/ui.ts` classes; no raw `slate`/`blue` colors.
- Ownership as in weight tracking: client's form always resolved from the token; dietitian access through a `findClientById` that 404s for non-clients.
- Turkish decimal comma accepted in height/weight inputs (same as `WeightForm`).

## Review Focus

1. A client who has not submitted types `/dashboard` or `/profile` directly → lands on `/intake`, never sees the app (Task 4, manual check G1).
2. Client closes or refreshes the browser at step 4 → returns to step 4 with answers kept (Task 5, manual check W3).
3. The gate's request fails (backend down / 500) → an error with a retry button, not a blank page or a redirect loop (Task 4, manual check G3).
4. Dietitian opens a client who has not filled the form → "not filled yet" card, not an error (Task 6, manual check D2).
5. Birth date in the future or height/weight out of range → rejected with a clear message on the step, and by the backend (Task 2 validation, Task 3 Postman check P5).

---

## Field list (shared by every task)

Java/TS field name → DB column (snake_case of the name) · type · required.

| Step | Field | Type | Req. |
|---|---|---|---|
| 1 | `fullName` | text (≤100) | ✔ |
| 1 | `birthDate` | date, past | ✔ |
| 1 | `gender` | `Gender { FEMALE, MALE }` | ✔ |
| 1 | `heightCm` | int 100–250 | ✔ |
| 1 | `weightKg` | decimal(5,2) 20–400 | ✔ |
| 1 | `occupation` | text (≤100) | ✔ |
| 2 | `chronicDiseases`, `surgeries`, `medications`, `allergies` | long text | – |
| 3 | `mainMeals` | `MainMeals { TWO, THREE, FOUR_PLUS }` | ✔ |
| 3 | `eatsBreakfast` | boolean | ✔ |
| 3 | `waterIntake` | `WaterIntake { HALF_LITER, ONE_LITER, ONE_AND_HALF_LITER, TWO_LITERS_PLUS }` | ✔ |
| 3 | `teaCoffee` | `TeaCoffee { NONE, TWO_CUPS, THREE_CUPS_PLUS }` | ✔ |
| 3 | `drinksSoda` | boolean | ✔ |
| 3 | `dislikedFoods`, `snacks`, `eatingOut` | long text | – |
| 4 | `goal` | `Goal { LOSE_WEIGHT, GAIN_WEIGHT, MAINTAIN_WEIGHT, HEALTHY_HABITS, OTHER }` | ✔ |
| 4 | `goalOther` | text (≤255) | – |
| 4 | `previousDiets`, `specialDiet` | long text | – |
| 4 | `programStyle` | `ProgramStyle { STRICT, FLEXIBLE, CONSCIOUS_CHOICES }` | ✔ |
| 5 | `sleepHours` | `SleepHours { UNDER_4, FROM_4_TO_6, FROM_6_TO_8, OVER_8 }` | ✔ |
| 5 | `energyLevel` | `EnergyLevel { ENERGETIC, MODERATELY_TIRED, ALWAYS_TIRED }` | ✔ |
| 5 | `smokes`, `drinksAlcohol` | boolean | ✔ |
| 5 | `alcoholFrequency` | text (≤255) | – |
| 6 | `exerciseDays` | `ExerciseDays { NONE, ONE_TO_TWO, THREE_TO_FOUR, FIVE_PLUS }` | ✔ |
| 6 | `sportCardio`, `sportWeights`, `sportPilatesYoga` | boolean (multi-select) | ✔ (default false) |
| 6 | `sportOther` | text (≤255) | – |
| 6 | `tracksSteps` | boolean | ✔ |
| 6 | `averageSteps` | int ≥0 | – |
| 7 | `digestiveProblems`, `lactoseGlutenSymptoms` | long text | – |

Server-only: `id`, `user_id` (UNIQUE, FK `fk_intake_form_user`), `consent_given_at`, `created_at`, `updated_at`.

---

### Task 1: Data layer (migration, enums, entity, repositories)

**Files:**
- Create: `project/src/main/resources/db/migration/V4__create_intake_form.sql`
- Create: `project/src/main/java/com/project/project/entity/IntakeOptions.java`
- Create: `project/src/main/java/com/project/project/entity/IntakeForm.java`
- Create: `project/src/main/java/com/project/project/repository/IntakeFormRepository.java`
- Modify: `project/src/main/java/com/project/project/repository/WeightEntryRepository.java`

**Interfaces:**
- Produces: `IntakeOptions.Gender | MainMeals | WaterIntake | TeaCoffee | Goal | ProgramStyle | SleepHours | EnergyLevel | ExerciseDays` (public nested enums, values as in the field list); entity `IntakeForm(User user)` constructor + getters/setters for every field in the field list, `getConsentGivenAt()/setConsentGivenAt(LocalDateTime)`, `getCreatedAt()`, `getUpdatedAt()`, `touch()` (sets `updatedAt = now`); `IntakeFormRepository extends JpaRepository<IntakeForm, Long>` with `Optional<IntakeForm> findByUser(User user)`; `WeightEntryRepository.existsByUser(User user): boolean`.

- [ ] **Step 1: Stop the backend**, then write `V4__create_intake_form.sql`: table `intake_form`, columns from the field list (snake_case), enum fields as MySQL `ENUM('…')` with values in the Java declaration order and `NOT NULL`, booleans `BIT(1) NOT NULL`, long text `TEXT NULL`, short text `VARCHAR(n) NULL` (`full_name`, `occupation` `VARCHAR(100) NOT NULL`), `height_cm INT NOT NULL`, `weight_kg DECIMAL(5,2) NOT NULL`, `average_steps INT NULL`, `birth_date DATE NOT NULL`, `consent_given_at`/`created_at`/`updated_at DATETIME(6) NOT NULL`, `UNIQUE KEY uk_intake_form_user (user_id)`, `CONSTRAINT fk_intake_form_user FOREIGN KEY (user_id) REFERENCES app_user (id)`, same engine/charset/collation as V3. Claude reviews the file before the backend starts.
- [ ] **Step 2: Write `IntakeOptions`, `IntakeForm` (`@Table(name = "intake_form")`, `@OneToOne @JoinColumn(name = "user_id", nullable = false)` user, `@Enumerated(EnumType.STRING)` enums, `@Column(columnDefinition = "TEXT")` long texts), `IntakeFormRepository`, and add `existsByUser` to `WeightEntryRepository`.** `createdAt`/`updatedAt` set in the constructor; `touch()` refreshes `updatedAt`.
- [ ] **Step 3: Start the backend (`local` profile).** Expected log: `Migrating schema `task_manager` to version "4 - create intake form"`, app starts (Hibernate `validate` passes). Claude checks `SHOW CREATE TABLE intake_form` and `flyway_schema_history`.
- [ ] **Step 4: Commit** (user pastes `git --no-pager diff --staged --stat` first; expect 5 files).
  `git commit -m "Add intake_form table, entity and repositories"`

### Task 2: Service, DTOs and rules (TDD)

**Files:**
- Create: `project/src/main/java/com/project/project/dto/IntakeFormRequest.java`
- Create: `project/src/main/java/com/project/project/dto/IntakeFormResponse.java`
- Create: `project/src/main/java/com/project/project/exception/IntakeConsentRequiredException.java`
- Create: `project/src/main/java/com/project/project/service/impl/IntakeFormService.java`
- Test: `project/src/test/java/com/project/project/service/impl/IntakeFormServiceTest.java`

**Interfaces:**
- Consumes: Task 1 entity/repositories; `WeightEntry(User, BigDecimal, LocalDate, User)`; `UserRepository.findByUsername`, `findById`.
- Produces:
  - `IntakeFormRequest`: every field-list field (boxed types: `Boolean`, `Integer`, `BigDecimal`, enums, `LocalDate`, `String`) + `Boolean consent`. Validation: `@NotBlank @Size(max=100)` fullName/occupation; `@NotNull @Past` birthDate; `@NotNull @Min(100) @Max(250)` heightCm; `@NotNull @DecimalMin("20.0") @DecimalMax("400.0") @Digits(integer=3, fraction=2)` weightKg; `@NotNull` on every required enum/boolean; `@Size(max=255)` short optional texts; `@Size(max=2000)` long texts; `@Min(0)` averageSteps. Turkish messages in the style of `WeightEntryCreateRequest`.
  - `IntakeFormResponse(IntakeForm form)`: every field-list field + `int age` + `LocalDateTime consentGivenAt` + `LocalDateTime updatedAt`.
  - `IntakeFormService`: `Optional<IntakeFormResponse> getMyForm(String username)`, `IntakeFormResponse saveMyForm(String username, IntakeFormRequest request)`, `Optional<IntakeFormResponse> getClientForm(Long clientId)`.
  - `IntakeConsentRequiredException(String message)` (RuntimeException).

- [ ] **Step 1: Write the failing tests** (Mockito style of `TaskServiceTest`; mocks: `IntakeFormRepository`, `UserRepository`, `WeightEntryRepository`; helper `validRequest()` filling every required field, weight `72.40`):
  - `saveMyForm_firstTimeWithoutConsent_throws` — no existing form, `consent=false` → `assertThrows(IntakeConsentRequiredException.class, …)`; `verify(intakeFormRepository, never()).save(any())`.
  - `saveMyForm_firstTime_savesConsentTimeAndSeedsWeight` — no form, no weight entries, `consent=true` → saved form has non-null `consentGivenAt`; `verify(weightEntryRepository).save(argThat(e -> e.getWeightKg().compareTo(new BigDecimal("72.40")) == 0 && e.getMeasuredOn().equals(LocalDate.now()) && e.getEnteredBy() == user))`.
  - `saveMyForm_firstTime_doesNotSeedWhenWeightsExist` — `existsByUser` → true → `verify(weightEntryRepository, never()).save(any())`.
  - `saveMyForm_update_keepsConsentAndDoesNotSeed` — existing form with `consentGivenAt = T`, request `consent=null`, new `medications="D vitamini"` → saved form keeps `T`, has the new medications; no weight save.
  - `getMyForm_noForm_returnsEmpty` — `findByUser` empty → `Optional.empty()`.
  - `getClientForm_dietitianId_throwsUserNotFound` — `findById` returns a DIETITIAN → `UserNotFoundException`.
  - `response_ageComputedFromBirthDate` — birthDate = today minus 30 years → `age == 30`.
- [ ] **Step 2: Run** `.\mvnw.cmd test "-Dtest=IntakeFormServiceTest"` (from `project/`). Expected: compilation failure / FAIL.
- [ ] **Step 3: Implement DTOs, exception and `IntakeFormService`.** `saveMyForm`: find user; `findByUser` → existing or `new IntakeForm(user)`; if new and `!Boolean.TRUE.equals(request.getConsent())` throw `IntakeConsentRequiredException("Devam etmek için açık rıza onayı gerekli")`; copy all fields (one private `apply(form, request)` method); if new: `setConsentGivenAt(now)` and, when `!weightEntryRepository.existsByUser(user)`, save `new WeightEntry(user, request.getWeightKg(), LocalDate.now(), user)`; else `touch()`; save and return response. `getClientForm` uses a private `findClientById` identical in behaviour to `WeightEntryService`'s. Age: `Period.between(birthDate, LocalDate.now()).getYears()`. Mark `saveMyForm` `@Transactional` (form + weight entry saved together).
- [ ] **Step 4: Run the tests again.** Expected: 7 tests PASS. Also `.\mvnw.cmd test "-Dtest=TaskServiceTest"` still passes.
- [ ] **Step 5: Commit** (5 files). `git commit -m "Add intake form service with consent and first-weight rules"`

### Task 3: Endpoints, error mapping, Postman checks, sample data

**Files:**
- Create: `project/src/main/java/com/project/project/controller/IntakeController.java` (`/intake`, `@PreAuthorize("hasRole('CLIENT')")`)
- Create: `project/src/main/java/com/project/project/controller/ClientIntakeController.java` (`/clients/{clientId}/intake`, `@PreAuthorize("hasRole('DIETITIAN')")`)
- Modify: `project/src/main/java/com/project/project/exception/GlobalExceptionHandler.java`

**Interfaces:**
- Produces (HTTP):
  - `GET /intake` → 200 `IntakeFormResponse` JSON, or **204** when the client has no form.
  - `PUT /intake` (body `IntakeFormRequest`, `@Valid`) → 200 `IntakeFormResponse`; 400 on validation or missing first-time consent.
  - `GET /clients/{clientId}/intake` → 200 / 204; 404 for unknown or non-client id; 403 for clients.
- `IntakeConsentRequiredException` → 400 `{status, message}` in `GlobalExceptionHandler`.

- [ ] **Step 1: Implement both controllers and the handler.** 204 = `ResponseEntity.noContent().build()` when the service returns `Optional.empty()`.
- [ ] **Step 2: Postman checks** (backend running):
  - P1 betül `GET /intake` → 204.
  - P2 betül `PUT /intake` full valid body, `"consent": false` → 400 "Devam etmek için açık rıza onayı gerekli".
  - P3 same with `"consent": true` → 200, `age` correct, `consentGivenAt` set; betül's weight list unchanged (she already has entries).
  - P4 `PUT` again with a changed `medications` and no `consent` → 200, `consentGivenAt` unchanged, `updatedAt` newer.
  - P5 `"birthDate": "2030-01-01"` or `"heightCm": 20` → 400 with the field message.
  - P6 dietitian `GET /clients/41/intake` → 200; `GET /clients/28/intake` → 404; betül `GET /clients/41/intake` → 403.
  - P7 body with an unknown field → 400 (`fail-on-unknown-properties`).
- [ ] **Step 3: Sample data.** Claude fills betül's form with realistic sample answers via `PUT /intake` (as P3), per the user's request.
- [ ] **Step 4: Commit** (3 files). `git commit -m "Add intake endpoints for clients and dietitians"`

### Task 4: Frontend data layer and gate

**Files:**
- Create: `client/src/types/intake.ts`
- Create: `client/src/services/intakeService.ts`
- Create: `client/src/routes/IntakeGate.tsx`
- Create: `client/src/pages/IntakePage.tsx` (temporary placeholder: hero + "coming soon" text; replaced in Task 5)
- Modify: `client/src/App.tsx`, `client/src/i18n/locales/tr.json`, `client/src/i18n/locales/en.json`

**Interfaces:**
- Produces:
  - `types/intake.ts`: string-union types per enum (`type Gender = 'FEMALE' | 'MALE'`, …, values exactly as Task 1), `IntakeFormRequest` (field list + `consent?: boolean`, numbers as `number`, dates as `'YYYY-MM-DD'` strings, optional texts `string | null`), `IntakeForm` (= request fields + `age: number`, `consentGivenAt: string`, `updatedAt: string`).
  - `intakeService.ts`: `getMyIntake(): Promise<IntakeForm | undefined>` (204 → `undefined`, already how `apiRequest` treats an empty body), `saveMyIntake(request: IntakeFormRequest): Promise<IntakeForm>` (PUT), `getClientIntake(clientId: number): Promise<IntakeForm | undefined>`.
  - `IntakeGate({ children })`: for `getRole() !== 'CLIENT'` renders children immediately; for clients calls `getMyIntake()` once per mount → loading state (cream screen + logo) → `undefined` → `<Navigate to="/intake" replace />` → form → children → error → message (`toErrorMessage`) + retry button.
  - Routes: `/intake` = `<ProtectedRoute allowedRoles={['CLIENT']}><IntakePage /></ProtectedRoute>`, outside `AppShell` (no tab bar while filling). The shell route element becomes `<ProtectedRoute><IntakeGate><AppShell /></IntakeGate></ProtectedRoute>`.
  - i18n keys `intake.gate.loading`, `intake.gate.error`, `intake.gate.retry`.

- [ ] **Step 1: Write the files and route changes.**
- [ ] **Step 2: Verify:** `npm run build` and `npm run lint` clean. Manual: G1 a newly registered client logs in → `/intake`; typing `/dashboard` or `/profile` → back to `/intake`. G2 betül (has a form after Task 3) → dashboard as before; dietitian → `/clients` as before. G3 stop the backend, reload as a client → error + retry, no loop.
- [ ] **Step 3: Commit** (≈7 files).

### Task 5: The 7-step wizard

**Files:**
- Create: `client/src/intake/intakeSteps.ts` (step/field config)
- Create: `client/src/components/intake/IntakeField.tsx` (renders one field)
- Modify: `client/src/pages/IntakePage.tsx` (replace placeholder)
- Modify: `client/src/i18n/locales/tr.json`, `client/src/i18n/locales/en.json`

**Interfaces:**
- Consumes: Task 4 types/service; `components/ui.ts` classes; `PageHero`/`PageBody`.
- Produces:
  - `intakeSteps.ts`: `type FieldKind = 'text' | 'longText' | 'date' | 'number' | 'decimal' | 'choice' | 'yesNo' | 'check'`; `type IntakeFieldConfig = { name: keyof IntakeFormRequest; kind: FieldKind; required?: boolean; options?: readonly string[] }`; `type IntakeStepConfig = { key: string; fields: IntakeFieldConfig[]; note?: 'bloodTest' }`; `export const INTAKE_STEPS: IntakeStepConfig[]` — 7 entries, keys `personal, health, eating, goals, lifestyle, sport, gut`, fields and `required` exactly as the field list; step `health` has `note: 'bloodTest'`; sport types are three `check` fields.
  - `IntakeField({ field, value, onChange })`: label from `intake.fields.<name>`; `choice` → chips with labels `intake.options.<EnumName>.<VALUE>`; `yesNo` → two chips; `check` → toggle chip; `decimal` accepts comma (`replace(',', '.')`); `longText` → textarea.
  - `IntakePage`: state `answers: Partial<IntakeFormRequest>`, `step: number`, `consent: boolean`; on mount loads `getMyIntake()` to prefill (update mode) and, if none, a draft from `localStorage['intakeDraft:' + username]`; saves the draft on every change; progress bar `(step+1)/7`; hero shows `intake.steps.<key>.title` and "Adım N / 7"; **Next** blocked with an inline message while a required field of the step is empty; last step shows the consent checkbox **only when there is no saved form yet**; submit → `saveMyIntake` → clear draft → first submission: a thank-you card (`intake.thanks`) with a button to `/dashboard`; update: `navigate('/dashboard')` directly; backend 400 message shown on the last step.
  - i18n: `intake.title`, `intake.stepOf` ("Adım {{current}} / {{total}}"), `intake.back`, `intake.next`, `intake.submit`, `intake.saving`, `intake.requiredMissing`, `intake.thanks`, `intake.goHome`, `intake.consent` (copy from Global Constraints), `intake.bloodTestNote` (copy from Global Constraints), `intake.steps.<key>.title` ×7, `intake.fields.<name>` for every field, `intake.options.<EnumName>.<VALUE>` for every enum value, `intake.yes`, `intake.no`. Turkish question wording follows the paper form.

- [ ] **Step 1: Write `intakeSteps.ts` and `IntakeField.tsx`.** `npm run build` clean.
- [ ] **Step 2: Write `IntakePage.tsx` and all i18n keys** (TR from the paper form, EN equivalents).
- [ ] **Step 3: Verify:** build + lint clean. Manual (phone view, new test client): W1 Next on step 1 with empty name → message, stays. W2 fill all 7 steps → consent unticked → submit refused in UI; ticked → dashboard opens, first weight entry = form weight. W3 refresh on step 4 → still step 4 with answers. W4 `72,5` in weight accepted. W5 EN language → all labels English. Delete the test client afterwards (Claude).
- [ ] **Step 4: Commit.**

### Task 6: Update entry and dietitian view

**Files:**
- Create: `client/src/components/intake/IntakeSummary.tsx`
- Modify: `client/src/pages/ProfilePage.tsx` (link card "Ön görüşme formum" → `/intake`)
- Modify: `client/src/pages/ClientDetailPage.tsx` (render `<IntakeSummary clientId={clientId} />` above `WeightSection`)
- Modify: `client/src/i18n/locales/tr.json`, `client/src/i18n/locales/en.json`

**Interfaces:**
- Consumes: `getClientIntake`, `INTAKE_STEPS` (to list full answers in step order with the same labels).
- Produces: `IntakeSummary({ clientId: number })`: loads the client's form; none → card `intake.summary.notFilled`; form → card with age, height, last updated (`intake.summary.updatedAt`), and highlighted rows: chronic diseases, surgeries, medications, **allergies**, main meals, goal (+ goalOther), special diet — empty values shown as `intake.summary.none`; below, one collapsible `<details>` per step with every answer. Profile link visible only for clients.

- [ ] **Step 1: Write `IntakeSummary` and the two page changes + i18n.**
- [ ] **Step 2: Verify:** build + lint clean. Manual: D1 dietitian → betül → summary with allergies/medications/meals, sections expand. D2 dietitian → a client without a form → "not filled yet". U1 betül → Profile → "Ön görüşme formum" → prefilled wizard, no consent box, change medications → dietitian sees new value and newer date; weight list unchanged.
- [ ] **Step 3: Commit.**

### Task 7: Wrap-up

- [ ] **Step 1:** Phone-width pass over `/intake`, `/dashboard`, `/profile`, `/clients/:id` (TR and EN).
- [ ] **Step 2:** Claude updates `DEVAM_NOTU.md` and `CLAUDE.md` (local only).
- [ ] **Step 3:** User pushes; Claude verifies the pushed commits contain non-empty files.
