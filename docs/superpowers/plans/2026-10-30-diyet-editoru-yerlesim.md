# Diyet editörü üç sütunlu yerleşim: uygulama planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `DietPlanEditorPage` into a tablet-first layout:
- **≥ lg:** three columns (meal list | open meal | items);
- **md:** meal strip on top + two columns;
- **phone:** a strip and a bottom sheet.

All existing features are kept.

**Architecture:**
- State and save logic stay in `DietPlanEditorPage`.
- Presentation moves into four focused components under `components/diet/editor/`:
  - `MealList` (vertical list + add menu)
  - `MealStrip` (horizontal strip + add sheet)
  - `MealEditor` (the open meal card)
  - `ItemPicker` (search + categories + option mode + edit library)
- A small portal `BottomSheet` serves the phone panels.
- `QuickPanel` is deleted.
- No backend change.

**Tech Stack:** React 19, TypeScript, Tailwind v4 tokens, react-i18next, lucide-react.

**Spec:** `docs/superpowers/specs/2026-10-30-diyet-editoru-yerlesim-design.md`

## Global Constraints

- Frontend only. There is no frontend test setup, so each task's "test" is:
  - `npm run build` and `npm run lint` clean;
  - the browser checks listed in the task.
- Only theme tokens; cards are `rounded-3xl bg-card shadow-soft`. No raw Tailwind palette colours.
- New strings go into both `client/src/i18n/locales/tr.json` and `en.json` under `diet.editor.*`. They should be flat and easy to translate (German comes later).
- Fixed and bottom elements:
  - render through `createPortal` (never inside `animate-rise` / `stagger` parents);
  - add `env(safe-area-inset-bottom)`.
- Load effects must not depend on `t`.
- Breakpoints: `lg` = three columns, `md` = strip + two columns, `< md` = phone.
- Code style: 4-space indent, single quotes, no semicolons. Turkish comments in the codebase's style. Do not run prettier.

## Review Focus

1. **Library failed to load (`library === null`, `libraryError` set).**
   - "+ Boş öğün" must still work in `MealList`/`MealStrip`.
   - `ItemPicker` shows the error, and the editor still saves.
   - Covered by Task 3's browser check, with the library request blocked.
2. **Adding an item when no meal is selected.**
   - Picker buttons are disabled and the "Önce bir öğün ekle" hint shows.
   - `addQuickItem` never targets a meal on another day.
   - Covered by Task 2's check.
3. **Weekly ↔ daily switch and day change keep a valid selection.**
   - The first meal of the shown day is selected, or `null` if the day is empty.
   - The selected key must never point at another day's meal.
   - Covered by Task 2's check.
4. **Deleting the selected meal.** The neighbour (next, else previous) is selected. A meal with items asks for confirmation. Covered by Task 2's check.
5. **Long item text and long meal names at 375 px.**
   - The text wraps and nothing scrolls horizontally on the page; strips scroll horizontally only inside themselves.
   - Covered by Task 3's check.

---

### Task 1: Presentational components

**Files:**
- Create:
  - `client/src/components/diet/editor/BottomSheet.tsx`
  - `client/src/components/diet/editor/ItemPicker.tsx`
  - `client/src/components/diet/editor/MealList.tsx`
  - `client/src/components/diet/editor/MealStrip.tsx`
  - `client/src/components/diet/editor/MealEditor.tsx`
- Modify: both locale files.

**Interfaces (Produces):**
- `type EditorMeal = { key: string; name: string; time: string; items: string }`
  - Move it from the page to `client/src/components/diet/editor/types.ts`, so the page imports it.
- `type AddableMeal = { name: string; time: string | null; items: string }`, in `types.ts`.
- `BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode })`
  - Portal to `document.body`, about 55vh tall, scrolls inside, with a "Bitti" button.
  - Esc and a backdrop click close it.
  - The page behind it does not scroll while it is open.
- `ItemPicker({ library, loadError, targetName, optionMode, onOptionModeChange, onAddItem, onEdit }: { library: DietLibrary | null; loadError: unknown; targetName: string | null; optionMode: boolean; onOptionModeChange: (v: boolean) => void; onAddItem: (text: string) => void; onEdit: () => void })`
  - Header: `diet.editor.itemsFor` ("Maddeler → {{name}}").
  - Search input.
  - The option-mode checkbox (`diet.editor.addAsOption`) and the "Düzenle" button (`diet.editor.editLibrary`).
  - Categories stacked: each has a heading and `+ text` buttons.
  - Search filters items by `toLocaleLowerCase('tr')` `includes` and hides empty categories.
  - `targetName === null` disables the buttons and shows `diet.editor.addMealFirst`.
- `AddMealOptions({ library, onAdd })`, exported from `MealList.tsx` and reused by `MealStrip`:
  - template buttons (`name · time`) plus "+ Boş öğün" (`diet.editor.emptyMeal`);
  - shown even when `library` is null.
- `MealList({ meals, selectedKey, library, onSelect, onMove, onAdd }: { meals: EditorMeal[]; selectedKey: string | null; library: DietLibrary | null; onSelect: (key: string) => void; onMove: (key: string, dir: -1 | 1) => void; onAdd: (meal: AddableMeal) => void })`
  - Rows show: name (or `diet.editor.unnamedMeal`), time, and the item count (non-empty lines).
  - The selected row is `bg-brand text-cream` with up/down arrows.
  - An empty day shows `diet.editor.dayEmpty`.
  - Below the rows: `diet.editor.addMealTitle` + `AddMealOptions`.
- `MealStrip({ meals, selectedKey, library, onSelect, onAdd })`
  - A horizontal `overflow-x-auto` row of chips (name · count) and a "+ Öğün" chip (`diet.editor.addMealShort`).
  - That chip opens a `BottomSheet` with `AddMealOptions`; the sheet closes after adding.
- `MealEditor({ meal, isWeekly, isFirst, isLast, flash, templateBusy, libraryReady, notice, templateMatch, onChange, onMove, onRemove, onSaveTemplate, onAddToAllDays, onStoreTemplate, onCancelTemplate }: …)`
  - `meal: EditorMeal | null`. When it is null, it shows the empty state `diet.editor.startHint`.
  - Large name and time inputs (`inputClass`).
  - Items `textarea` with `rows={Math.max(10, lines + 1)}`.
  - Actions:
    - "Hazır öğün yap" and, weekly only, "Tüm günlere ekle";
    - up/down arrows (visible `< lg` only);
    - "Öğünü sil" in red.
  - Template update/add-new choice and notice rendering are moved from the page unchanged.
  - The `flash` prop gives `bg-mint/40`.
  - Prop types:
    - `notice`: `{ messageKey: string; isError: boolean; error?: unknown } | null`
    - `templateMatch`: `MealTemplate | null`
    - `onStoreTemplate(replaceId: number | null)`
- New i18n keys, TR / EN:
  - `itemsFor`: "Maddeler → {{name}}" / "Items → {{name}}"
  - `search`: "Madde ara" / "Search items"
  - `addMealTitle`: "Öğün ekle" / "Add a meal"
  - `addMealShort`: "Öğün" / "Meal"
  - `addItemShort`: "Madde" / "Item"
  - `unnamedMeal`: "Adsız öğün" / "Unnamed meal"
  - `dayEmpty`: "Bu gün için öğün yok. Aşağıdan ekleyin." / "No meals for this day yet. Add one below."
  - `startHint`: "Soldan bir öğün ekleyerek başlayın." / "Start by adding a meal."
  - `mealsOfDay`: "Günün öğünleri" / "Meals of the day"
  - `done`: "Bitti" / "Done"
  - `confirmRemoveMeal`: "\"{{name}}\" öğünü silinsin mi?" / "Delete the meal \"{{name}}\"?"
  - `noSearchResult`: "Eşleşen madde yok" / "No matching items"
  - Keep existing keys: `addAsOption`, `editLibrary`, `emptyMeal`, `addMealFirst`, `saveAsTemplate`, `addToAllDays`, `moveUp`, `moveDown`, `removeMeal`, `templateExists`, `updateExisting`, `addAsNew`, `mealName`, `mealTime`, `items`, `itemsPlaceholder`.

- [ ] **Step 1:** Create the five components and `types.ts` with the props above.
- [ ] **Step 2:** Add the i18n keys to both locale files.
- [ ] **Step 3:** Run `npm run build && npm run lint`. Expected: clean. Unused components are fine at this step.

### Task 2: Rewire `DietPlanEditorPage` and the responsive layout

**Files:**
- Modify: `client/src/pages/DietPlanEditorPage.tsx`
- Delete: `client/src/components/diet/QuickPanel.tsx`

**Interfaces (Consumes):** everything from Task 1.

**Behaviour changes:**
- **New program starts empty:**
  - `days` initial value is `{ 0: [] }`;
  - remove `starterMeals`;
  - weekly days start as `[]`.
- **Selection rule:** add `selectFirstOf(dayIndex, daysState)`, which sets `selectedKey` to the first meal key of that day, or `null`. Call it after:
  - `loadPlan` (edit and "Mevcut programdan başla");
  - `changeType`;
  - a day change;
  - `copyDay` (stays on the current day).
- **`addMeal`:** selects the new meal (as today).
- **`removeMeal(key)`:**
  - if the meal has non-blank items, first `await confirm({ title: t('diet.editor.confirmRemoveMeal', { name }), confirmLabel: t('common.delete'), danger: true })`;
  - after removal, select the next meal, else the previous one, else `null`.
- **`addQuickItem`:** targets only `meals.find(m => m.key === selectedKey)`. The fallback to the last meal is removed; the picker is disabled without a target.
- **Save validation:** on an incomplete meal, switch to its day (weekly) and set `selectedKey` to that meal's key. Also show the error with `toast(message, 'error')`, besides the inline text.
- **Layout:**
  - Page body width: wrap the editor content in `-mx-…`, or use a wider container (for example `lg:max-w-7xl`), so three columns fit.
  - **Top card:**
    - type toggle, title, start date and a **Kaydet** button (top right on ≥ md, full width at the bottom on phone);
    - a `<details>` for Notes, open when the notes are not empty.
  - **"Mevcut programdan başla":** above the top card.
  - **Weekly:** `DayTabs` and "Bu günü kopyala" with its panel, as today.
  - **≥ lg:** `grid grid-cols-[220px_minmax(0,1fr)_280px] gap-4`:
    - `MealList` and `ItemPicker` are `sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto`;
    - `MealEditor` is in the middle.
  - **md:**
    - `MealStrip` on top;
    - below it `grid grid-cols-[minmax(0,1fr)_260px] gap-4`, with `MealEditor` and a sticky `ItemPicker`.
  - **< md:**
    - `MealStrip`, then `MealEditor`;
    - a fixed "+ Madde" button rendered through a portal, `bottom: calc(6rem + env(safe-area-inset-bottom))`; at `sm` (no tab bar) use `bottom: calc(1.5rem + env(safe-area-inset-bottom))`;
    - the button opens a `BottomSheet` with `ItemPicker`. The sheet stays open after adding.
  - Visibility: use Tailwind `hidden lg:block` / `md:block lg:hidden` / `md:hidden`. Render the editor once and only move it between grid wrappers. Rendering `MealEditor` in several wrappers would duplicate the textarea focus.
    - Recommended: one grid with responsive `grid-cols-*`, where `MealList` is `hidden lg:block` and `MealStrip` is `lg:hidden`.
- `LibrarySheet` usage: unchanged.

- [ ] **Step 1:** Apply the behaviour changes and the layout; delete `QuickPanel.tsx` and its import.
- [ ] **Step 2:** Run `npm run build && npm run lint`. Expected: clean.
- [ ] **Step 3: Browser check at 1180×820** (test API on :8081, temporary dietitian and client):
  - a new program opens with no meals and the middle shows `startHint`;
  - adding "Kahvaltı" from the left selects it; clicking an item in the right column appends it;
  - option mode appends " / item" to the last line;
  - a weekly switch and a day change select that day's first meal or none, and picker buttons are disabled on an empty day;
  - deleting a meal with items asks first, and its neighbour gets selected;
  - "Hazır öğün yap" and "Tüm günlere ekle" still work;
  - saving with an empty meal on another day jumps to it and selects it;
  - editing an existing plan loads it with the first meal selected.

### Task 3: Tablet portrait, phone, edge cases, docs

**Files:**
- Modify: `CLAUDE.md` (Diet programs section: describe the new layout and the components; remove the `QuickPanel` mention).
- Modify: `DEVAM_NOTU.md` (a line about the editor layout).

- [ ] **Step 1: Browser check at 820×1180:**
  - the strip on top, the open meal and the item column side by side;
  - the "+ Öğün" sheet adds a meal.
- [ ] **Step 2: Browser check at 375×812:**
  - strip, editor and the "+ Madde" button above the tab bar;
  - the sheet stays open across several adds, and "Bitti" closes it;
  - a long meal name and a long item wrap, with no horizontal page scroll (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] **Step 3: Library failure.** Block `/diet-library` with the browser's request blocking, or test the error state by stopping nothing and temporarily pointing the test proxy at a bad path:
  - "+ Boş öğün" still works and the picker shows the error;
  - a program with typed items saves.
- [ ] **Step 4:** Update the docs, then run `npm run build && npm run lint` once more.
- [ ] **Step 5:** Clean up the temporary users (`cleanup.sql`), the test servers and `vite.claude-test.config.ts`. Give the user the commit message: "Diet editor: tablet-first layout with meal list, open meal and item column".
