# Hazır öğünler ve düzenlenebilir hızlı maddeler — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the dietitian her own library of saved meals and editable quick-pick items, stored in the DB, and use it in the diet plan editor. The editor gains "Hazır öğün yap" and "Tüm günlere ekle".

**Architecture:**
- New backend slice `/diet-library` (DIETITIAN only, owner from token), with three tables plus a seed marker table. The defaults are seeded once per dietitian on the first library read.
- Frontend:
  - a reusable `DietLibraryManager` component, shown on a new "Hazırlar" tab page and inside a full-screen sheet over the editor;
  - the editor's quick panel moves into a `QuickPanel` component with two tabs, Öğünler and Maddeler.

**Tech Stack:** Spring Boot 4.1 / JPA / Flyway / MySQL, Mockito tests; React 19 + TS + Tailwind v4 + i18next.

**Spec:** `docs/superpowers/specs/2026-10-28-hazir-ogunler-design.md`

## Global Constraints

- **Migration:** a new Flyway migration `V7__create_diet_library.sql`. Never edit V1–V6. Constraints get readable names.
- **API rules:**
  - DTOs only, and `fail-on-unknown-properties=true`, so the frontend sends exactly the DTO fields.
  - Controller is `@PreAuthorize("hasRole('DIETITIAN')")`.
  - The owner comes from `Authentication.getName()`. Another owner's row → 404.
  - Backend messages are Turkish.
- **Limits** (trim everything first):
  - saved meal name: not blank, ≤ 60;
  - time: `^\s*$|^([01]\d|2[0-3]):[0-5]\d$`, with blank stored as `null`;
  - saved meal items: may be blank, ≤ 4000;
  - category name: not blank, ≤ 50;
  - item text: not blank, ≤ 255.
- **Seeding:** seed once per dietitian. **Deleted examples never come back.** Seeded category names are Turkish free text.
- **Name + time match** (used by both "Hazır öğün yap" and "Tüm günlere ekle"): names are trimmed and compared case-insensitively with `toLocaleLowerCase('tr')`; times are compared exactly, and an empty time matches only an empty time.
- **Frontend rules:**
  - HTTP goes through `apiRequest`; types live in `src/types`.
  - Load effects must not depend on `t`.
  - Use the brand tokens only.
  - Must work at phone width.
  - Add every string to both TR and EN.
- **Working agreement:** Claude writes the code, and **the user commits**. At each commit step, give the user the file list and wait for their `git --no-pager diff --staged --stat`.

## Review Focus

1. **StrictMode double load:** the first library GET fires twice at once. It must not seed twice. Covered by the `insertIfAbsent` design and the test `seedsOnlyWhenMarkerInserted` in Task 2.
2. **Library fails to load in the editor:** the program can still be written and saved. The quick panel shows an error line instead of chips (Task 5, browser check).
3. **Turkish case in name matching:** "İKİNDİ" vs "ikindi" and "Ara Öğün" vs "ara öğün" must match. Covered by `isSameMeal` cases in Task 5. There is no FE test runner, so check it with a quick console snippet in the browser.
4. **Deleting a category that still has items:** its items are removed too (cascade), with no 409. Covered by the test `deleteCategoryRemovesItems` and the `ON DELETE CASCADE` FK.
5. **Closing the sheet after edits:** the editor's half-written program is unchanged, and chips reflect the edits. Covered by the browser check in Task 5.

---

### Task 1: Schema, entities, repositories, defaults

**Files:**
- Create: `project/src/main/resources/db/migration/V7__create_diet_library.sql`
- Create:
  - `project/src/main/java/com/project/project/entity/MealTemplate.java`
  - `.../entity/QuickPickCategory.java`
  - `.../entity/QuickPickItem.java`
- Create:
  - `.../repository/MealTemplateRepository.java`
  - `.../repository/QuickPickCategoryRepository.java`
  - `.../repository/DietLibrarySeedRepository.java`
- Create: `.../service/impl/DietLibraryDefaults.java`

**Interfaces:**
- **Produces, tables:**
  - `meal_template`:
    - columns `id`, `owner_id` (FK `fk_meal_template_owner`), `name VARCHAR(60) NOT NULL`, `meal_time VARCHAR(5) NULL`, `items TEXT NOT NULL`, `created_at DATETIME(6)`;
    - index on `owner_id`.
  - `quick_pick_category`:
    - columns `id`, `owner_id` (FK `fk_quick_pick_category_owner`), `name VARCHAR(50)`, `position INT`.
  - `quick_pick_item`:
    - columns `id`, `category_id`, `text VARCHAR(255)`, `position INT`;
    - FK `fk_quick_pick_item_category` with `ON DELETE CASCADE`.
  - `diet_library_seed`:
    - columns `owner_id BIGINT PRIMARY KEY` (FK `fk_diet_library_seed_owner`), `seeded_at DATETIME(6)`.
  - All tables are InnoDB, utf8mb4.
- **Produces, entities:**
  - `MealTemplate(User owner, String name, String mealTime, String items)`:
    - getters for all fields;
    - setters for `name`, `mealTime`, `items`;
    - `createdAt` set in the constructor.
  - `QuickPickCategory(User owner, String name, int position)`:
    - `@OneToMany(mappedBy="category", cascade=ALL, orphanRemoval=true) @OrderBy("position ASC, id ASC") List<QuickPickItem> items`;
    - `addItem(String text)` appends with `position = items.size()`;
    - `setName`.
  - `QuickPickItem(QuickPickCategory category, String text, int position)`, with `setText`.
- **Produces, repositories:**
  - `MealTemplateRepository`: `List<MealTemplate> findAllByOwner(User owner)`, `Optional<MealTemplate> findByIdAndOwner(Long id, User owner)`.
  - `QuickPickCategoryRepository`:
    - `List<QuickPickCategory> findAllByOwnerOrderByPositionAscIdAsc(User owner)`;
    - `Optional<QuickPickCategory> findByIdAndOwner(Long id, User owner)`;
    - `long countByOwner(User owner)`;
    - `@Query("select i from QuickPickItem i where i.id = :id and i.category.owner = :owner") Optional<QuickPickItem> findItemByIdAndOwner(Long id, User owner)`.
  - `DietLibrarySeedRepository`:
    - not a JPA entity repository; a Spring `@Repository` class using `JdbcTemplate`;
    - `int insertIfAbsent(Long ownerId)` runs `INSERT IGNORE INTO diet_library_seed (owner_id, seeded_at) VALUES (?, NOW(6))` and returns the affected rows (1 = this caller seeds).
  - `DietLibraryDefaults`:
    - `static final List<MealPreset> MEALS` (record `MealPreset(String name, String time)`), copied from `MEAL_PRESETS` in `client/src/diet/quickPicks.ts`;
    - `static final LinkedHashMap<String, List<String>> CATEGORIES`, keyed by the Turkish category names, in this order:
      - Kahvaltılık (`breakfast`)
      - Protein
      - Karbonhidrat (`carb`)
      - Salata
      - Meyve
      - Kuruyemiş
      - Süt ürünleri
      - İçecek
    - item lists copied verbatim from `QUICK_PICKS`.

- [ ] **Step 1:** Write V7 with the tables and constraint names above.
- [ ] **Step 2:** Write the entities, repositories and `DietLibraryDefaults`.
- [ ] **Step 3: Verify.** Run `mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local`, then check:
  - the log shows `Successfully applied 1 migration ... v7`;
  - the app starts with no Hibernate validate error.
- [ ] **Step 4: User commits:**
  - `git add project/src/main/resources/db/migration/V7__create_diet_library.sql project/src/main/java/com/project/project/entity project/src/main/java/com/project/project/repository project/src/main/java/com/project/project/service/impl/DietLibraryDefaults.java`
  - message: "Add diet library schema: saved meals, quick-pick categories and items, seed marker"

### Task 2: DietLibraryService (TDD)

**Files:**
- Create: `project/src/main/java/com/project/project/service/impl/DietLibraryService.java`
- Create: `.../exception/DietLibraryNotFoundException.java`
- Create the DTOs in `.../dto/`:
  - `MealTemplateRequest`: `name`, `time`, `items`, with the limits from Global Constraints.
  - `MealTemplateResponse`: `id`, `name`, `time`, `items`.
  - `QuickPickCategoryRequest`: `name`.
  - `QuickPickItemRequest`: `text`.
  - `QuickPickCategoryResponse`: `id`, `name`, `List<QuickPickItemResponse> items`.
  - `QuickPickItemResponse`: `id`, `text`.
  - `DietLibraryResponse`: `List<MealTemplateResponse> meals`, `List<QuickPickCategoryResponse> categories`.
- Test: `project/src/test/java/com/project/project/service/impl/DietLibraryServiceTest.java`

**Interfaces:**
- **Constructor:** `DietLibraryService(MealTemplateRepository, QuickPickCategoryRepository, DietLibrarySeedRepository, UserRepository)`.
- **Methods** (every method takes `String ownerUsername` first, and every write is `@Transactional`):
  - `DietLibraryResponse getLibrary(String owner)`:
    - calls `seedIfNeeded`;
    - sorts meals by `mealTime` ascending with nulls last, then by `id`.
  - Saved meals:
    - `MealTemplateResponse createMeal(String owner, MealTemplateRequest r)`
    - `MealTemplateResponse updateMeal(String owner, Long id, MealTemplateRequest r)`
    - `void deleteMeal(String owner, Long id)`
  - Categories:
    - `QuickPickCategoryResponse createCategory(String owner, QuickPickCategoryRequest r)`: position = `countByOwner`.
    - `QuickPickCategoryResponse renameCategory(String owner, Long id, QuickPickCategoryRequest r)`
    - `void deleteCategory(String owner, Long id)`
  - Items:
    - `QuickPickItemResponse addItem(String owner, Long categoryId, QuickPickItemRequest r)`
    - `QuickPickItemResponse updateItem(String owner, Long itemId, QuickPickItemRequest r)`
    - `void deleteItem(String owner, Long itemId)`
- **Helpers:**
  - `seedIfNeeded(User owner)`: when `insertIfAbsent(owner.getId()) == 1`, saves the default meals (items `""`) and the categories with their items.
  - A trim helper: blank time → `null`; meal items trimmed per line, and blank lines dropped.
- **Errors:** a row that is missing or not this owner's → `DietLibraryNotFoundException` ("Kayıt bulunamadı").

- [ ] **Step 1: Write the failing tests.** Use Mockito, in the style of `DietPlanServiceTest`.
  - `seedsOnlyWhenMarkerInserted`:
    - with `insertIfAbsent` → 1: verify `mealTemplateRepository.saveAll` was called with 7 meals, and `categoryRepository.saveAll` with 8 categories, the first named "Kahvaltılık" with 8 items;
    - with `insertIfAbsent` → 0: verify no `saveAll`.
  - `doesNotReseedAfterEverythingDeleted`: `insertIfAbsent` → 0 and the repositories return empty lists → the response has empty `meals` and `categories`.
  - `mealsSortedByTimeNullsLast`: given times `"13:00"`, `null`, `"09:00"`, the order is 09:00, 13:00, null.
  - `createMealTrimsAndBlankTimeIsNull`: name `"  Kahvaltı "` → `"Kahvaltı"`; time `" "` → `null`; items `"a\n\n b \n"` → `"a\nb"`.
  - `updateMealOfAnotherOwnerIs404`: `findByIdAndOwner` returns empty → `DietLibraryNotFoundException`.
  - `deleteCategoryRemovesItems`: verify `categoryRepository.delete(category)` is called; the items go with it through cascade.
  - `addItemAppendsAtEnd`: a category with 2 items, add `"  1 kase yoğurt "` → the new item has position 2 and text `"1 kase yoğurt"`.
  - `updateItemOfAnotherOwnerIs404`.
- [ ] **Step 2: Watch them fail.** Run `mvnw.cmd test "-Dtest=DietLibraryServiceTest"`. Expected: compile failure or FAIL.
- [ ] **Step 3:** Implement the service, the DTOs and the exception.
- [ ] **Step 4: Run all service tests.** Run `mvnw.cmd test "-Dtest=TaskServiceTest,IntakeFormServiceTest,ClientReviewServiceTest,DietPlanServiceTest,DietLibraryServiceTest"`. Expected: all pass (40 + new).
- [ ] **Step 5:** User commits. Message: "Add diet library service with one-time seeding of default meals and quick picks".

### Task 3: Controller and error mapping

**Files:**
- Create: `project/src/main/java/com/project/project/controller/DietLibraryController.java`
- Modify: `.../exception/GlobalExceptionHandler.java`, to map `DietLibraryNotFoundException` → 404.

**Interfaces** (`@RequestMapping("/diet-library")`, DIETITIAN):

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/diet-library` | — | 200 `DietLibraryResponse` |
| POST | `/meals` | — | 201 |
| PUT | `/meals/{id}` | — | 200 |
| DELETE | `/meals/{id}` | — | 204 |
| POST | `/categories` | `{name}` | 201 |
| PUT | `/categories/{id}` | `{name}` | 200 |
| DELETE | `/categories/{id}` | — | 204 |
| POST | `/categories/{id}/items` | `{text}` | 201 |
| PUT | `/items/{id}` | `{text}` | 200 |
| DELETE | `/items/{id}` | — | 204 |

- [ ] **Step 1:** Implement the controller (`@Valid` on bodies) and the handler.
- [ ] **Step 2: Verify with curl.** Restart the API. Create a temporary dietitian: register, promote with SQL, log in. Send UTF-8 JSON bodies with `--data-binary @file`.
  - **Seeding:**
    - `GET` → 7 meals and 8 categories;
    - a second `GET` → the same ids, nothing duplicated.
  - **Saved meals:**
    - `POST /meals {"name":"Standart kahvaltı","time":"09:00","items":"2 yumurta\n5 zeytin"}` → 201;
    - `PUT` → 200;
    - `DELETE` → 204.
  - **Categories:** `DELETE /categories/{first}` → 204, and a following `GET` no longer lists it.
  - **Delete everything:** delete every category and meal, then `GET` → both lists empty. The examples did not come back.
  - **Errors:**
    - a client token → 403;
    - an unknown id → 404 `{"status":404,"message":"Kayıt bulunamadı"}`;
    - blank name → 400.
  - **Clean up:** delete the temporary user and its rows.
- [ ] **Step 3:** User commits. Message: "Add /diet-library endpoints for the dietitian".

### Task 4: Frontend library: types, service, manager, "Hazırlar" tab

**Files:**
- Create:
  - `client/src/types/dietLibrary.ts`
  - `client/src/services/dietLibraryService.ts`
- Create:
  - `client/src/components/diet/DietLibraryManager.tsx`
  - `client/src/pages/DietLibraryPage.tsx`
- Modify:
  - `client/src/App.tsx`: add route `/library` with `allowedRoles={['DIETITIAN']}`.
  - `client/src/components/AppShell.tsx`: add `{ to: '/library', labelKey: 'nav.library', icon: BookMarked }` to `DIETITIAN_TABS`.
  - `client/src/i18n/locales/{tr,en}.json`: add `nav.library` ("Hazırlar" / "Library") and a `diet.library.*` block.

**Interfaces:**
- **Types:**
  - `MealTemplate {id:number; name:string; time:string|null; items:string}`
  - `QuickPickItem {id:number; text:string}`
  - `QuickPickCategory {id:number; name:string; items:QuickPickItem[]}`
  - `DietLibrary {meals:MealTemplate[]; categories:QuickPickCategory[]}`
  - `MealTemplateRequest {name:string; time:string|null; items:string}`
- **Service functions:** one per endpoint.
  - Library: `getDietLibrary()`
  - Saved meals:
    - `createMealTemplate(req)`
    - `updateMealTemplate(id, req)`
    - `deleteMealTemplate(id)`
  - Categories:
    - `createQuickCategory(name)`
    - `renameQuickCategory(id, name)`
    - `deleteQuickCategory(id)`
  - Items:
    - `addQuickItem(categoryId, text)`
    - `updateQuickItem(id, text)`
    - `deleteQuickItem(id)`
- **Component:** `DietLibraryManager({ library, onChange }: { library: DietLibrary; onChange: (next: DietLibrary) => void })`.
  - Every change calls the API right away. On success it calls `onChange` with the new state; on error it shows the error message under the edited row.
  - **Saved meals section:**
    - a list of cards (name · time, the items as lines) with Düzenle and Sil buttons;
    - Düzenle swaps the card for an inline form (name, time, items textarea, Kaydet / Vazgeç);
    - a "＋ Yeni hazır öğün" card at the end opens an empty form.
  - **Quick items section:**
    - one block per category, with the name, a rename (pencil) button and a delete button;
    - item chips with ✎ and ×;
    - a "＋ Madde ekle" chip that opens an inline input; Enter saves, Esc cancels;
    - "＋ Yeni kategori" at the end.
  - Deleting a category asks `window.confirm(t('diet.library.confirmDeleteCategory', {name}))`. Deleting a single item or meal asks nothing.
- **Page:** `DietLibraryPage` loads `getDietLibrary()` once (with a cancel flag and no `t` dependency) and renders `PageHero` (title "Hazırlar") plus `DietLibraryManager`.

- [ ] **Step 1:** Write the types, the service, the manager, the page, the route, the tab and the i18n keys.
- [ ] **Step 2:** Run `npm run build` and `npm run lint` from `client/`. Expected: both clean.
- [ ] **Step 3: Browser check at 375 px**, with a temporary dietitian:
  - the bottom bar shows "Danışanlar | Hazırlar";
  - add, edit and delete a saved meal;
  - add, edit and delete an item;
  - rename a category;
  - delete a category (confirm appears);
  - reload: the changes are still there.
- [ ] **Step 4:** User commits. Message: "Add Hazırlar page to manage saved meals and quick-pick items".

### Task 5: Editor: two-tab quick panel, sheet, card actions

**Files:**
- Create:
  - `client/src/components/diet/QuickPanel.tsx`
  - `client/src/components/diet/LibrarySheet.tsx`
- Modify:
  - `client/src/diet/dietUtils.ts`: add `isSameMeal`.
  - `client/src/pages/DietPlanEditorPage.tsx`
- Delete: `client/src/diet/quickPicks.ts`. Remove the `diet.quick.*` and `diet.editor.addMeal` keys if they become unused.
- Modify: `client/src/i18n/locales/{tr,en}.json`

**Interfaces:**
- **Helper:** `isSameMeal(a: {name:string; time:string|null}, b: {name:string; time:string|null}): boolean`, implementing the match rule from Global Constraints. `null` and `''` count as the same empty time.
- **`QuickPanel`:**
  - Props:
    - `{ library: DietLibrary | null; loadError: unknown; optionMode: boolean; onOptionModeChange(v:boolean); onAddMeal(t: {name:string; time:string|null; items:string}); onAddItem(text:string); onEdit(): void }`.
  - Layout:
    - it keeps the current sticky card look;
    - a tab row "Öğünler | Maddeler" with a "Düzenle" link on the right.
  - **Öğünler tab:** chips "name · time" for each saved meal, then "Boş öğün" (which calls `onAddMeal({name:'', time:null, items:''})`).
  - **Maddeler tab:** today's category chips, item chips and the "add as option" checkbox.
  - **Height:** the body is `max-h-28 overflow-y-auto` on both tabs, so the panel is no taller than today's.
  - **While loading:** the text `dashboard.loading`.
  - **On error:** `toErrorMessage(loadError, t, 'diet.library.loadError')`.
- **`LibrarySheet({ open, library, onChange, onClose })`:**
  - a `fixed inset-0 z-50` overlay with a cream background, a scrollable body, and a header with the title and a close button;
  - it renders `DietLibraryManager`.
- **Editor changes:**
  - **Loading:** load `getDietLibrary()` in its own effect (cancel flag, no `t`), separate from the plans load, so a library failure does not block the editor.
  - **Adding a saved meal:** `onAddMeal` appends a copy to the current day and selects it. The copy's time is `time ?? ''`.
  - **Removed:** the bottom "Öğün ekle" box (`MEAL_PRESETS`).
  - **Meal card action row:** new text buttons before ↑ ↓ 🗑:
    - **"☆ Hazır öğün yap"**:
      - Validation: if the name is blank, show `diet.editor.templateNeedsName` under the card.
      - Matching: find the first saved meal where `isSameMeal` holds.
      - No match: call `createMealTemplate`, then show a card notice `diet.editor.templateSaved` for 2 s.
      - Match found: show an inline choice row in the card: "Eskisini güncelle" (calls `updateMealTemplate(match.id, …)`), "Yeni olarak ekle" (calls `createMealTemplate`) and "Vazgeç".
      - After a save, update `library` in state.
    - **"Tüm günlere ekle"** (WEEKLY only):
      - for every other weekday, if a meal there `isSameMeal` this one, replace its `items`;
      - otherwise append a copy;
      - then show the notice `diet.editor.addedToAllDays` for 2 s.
- **i18n keys:**
  - `diet.editor.tabMeals`
  - `diet.editor.tabItems`
  - `diet.editor.editLibrary`
  - `diet.editor.emptyMeal`
  - `diet.editor.saveAsTemplate`
  - `diet.editor.templateSaved`
  - `diet.editor.templateExists`
  - `diet.editor.updateExisting`
  - `diet.editor.addAsNew`
  - `diet.editor.templateNeedsName`
  - `diet.editor.addToAllDays`
  - `diet.editor.addedToAllDays`
  - `diet.library.loadError`

- [ ] **Step 1:** Add `isSameMeal`, then write `QuickPanel` and `LibrarySheet`.
- [ ] **Step 2:** Rewire the editor to use them, add the card actions, and delete `quickPicks.ts`.
- [ ] **Step 3:** Run `npm run build` and `npm run lint`. Expected: clean, and no import of `quickPicks` remains (`grep -r quickPicks client/src` returns nothing).
- [ ] **Step 4: Browser check at 375 px**, with a temporary dietitian and client:
  - **Adding a saved meal:** create a weekly program; on Pzt, tap the "Kahvaltı · 09:00" chip and a meal card is added.
  - **Hazır öğün yap, first time:** type the items, then "☆ Hazır öğün yap" → the "kaydedildi" notice.
  - **Hazır öğün yap, second time:** press it again → the choice row appears; "Eskisini güncelle" leaves a single saved meal.
  - **Tüm günlere ekle:**
    - press it → Sal–Paz each have the meal;
    - press it again → still one copy per day.
  - **Library sheet:** with a half-written program, open "Düzenle", add an item chip, close → the program is unchanged and the new chip is visible.
  - **Saving:** save the program, and it opens on the client page.
  - **Case-insensitive match:** in the console, run `isSameMeal({name:'ARA ÖĞÜN',time:'16:00'},{name:'ara öğün',time:'16:00'})`, or check the behavior through the UI with an upper-case name.
  - **Library failure:** stop the API briefly, reload the editor; the quick panel shows an error and the rest of the editor is still usable.
  - **Clean up:** delete the temporary users and their rows.
- [ ] **Step 5:** User commits. Message: "Use saved meals and editable quick picks in the diet editor; add save-as-template and add-to-all-days".

### Task 6: Notes

**Files** (local, gitignored): `CLAUDE.md`, `DEVAM_NOTU.md`

- [ ] **Step 1: Update the notes.**
  - Remove `/profile` from the route list; mention `UserMenu` and the `/library` tab.
  - Add V7 and the diet library section: tables, seed marker, endpoints, `isSameMeal`.
  - Note that `quickPicks.ts` is gone.
  - In DEVAM_NOTU, record Step 2 as done; next is Step 3 (modern look). Later wishes: calories.
- [ ] **Step 2:** The user commits the spec and the plan:
  - `git add docs/superpowers/specs/2026-10-28-hazir-ogunler-design.md docs/superpowers/plans/2026-10-28-hazir-ogunler.md`
  - message: "Add saved meals design and plan"
  - If they prefer, this can go in with Task 1.
