# Hazır öğünler ve düzenlenebilir hızlı maddeler — design

Date: 2026-10-28 · Status: idea approved in chat after a mockup ("evet uygun, böyle yapalım"). Builds on `2026-10-28-diyet-programi-design.md`.

## Why

The dietitian (Betül) finds writing a program slow: **she types the same meals again and again, day after day.** A meal is usually the same as last time, with a few items changed for the specific client. The current editor only offers fixed quick-pick *items* (one line at a time, hard-coded in `client/src/diet/quickPicks.ts`) and fixed meal *names* (`MEAL_PRESETS`, name + time with no items). She cannot change any of them. The "copy this day" button exists but she still rebuilds meals line by line.

She wants her **own** quick buttons: whatever she writes often, she saves once and adds with one tap. The examples we seeded become her starting set, and she can edit, add (＋) and delete them.

## Goals

1. **Hazır öğünlerim (saved meals).** A per-dietitian library of whole meals: name, optional time (HH:MM), items (same text format as plan meals: one item per line, alternatives with " / "). Items may be empty (then it works like today's meal-name presets).
   - In the editor, one tap adds a copy of the saved meal to the current day. She then edits that copy for the client; the saved meal does not change.
2. **"Hazır öğün yap" on a meal card.** Saves the meal as written (name, time, items) with one tap and a short confirmation.
   - If she already has a saved meal with the same name **and** time (trimmed, case-insensitive name; an empty time matches only an empty time), the app asks **"Eskisini güncelle / Yeni olarak ekle"** (user's choice: ask).
   - If several saved meals match, the first one is updated.
   - Name + time is not a DB-unique key. The seed already has three "Ara öğün" at different times, and "Yeni olarak ekle" may create exact duplicates on purpose.
3. **"Tüm günlere ekle" on a meal card** (weekly programs only). Puts a copy of this meal on all other six days. On a day that already has a meal with the same name *and* time, that meal's items are replaced; otherwise the meal is appended. Pressing it twice therefore does not create duplicates.
4. **Editable quick items.** The categorized item chips (Kahvaltılık, Protein, …) become the dietitian's own data:
   - add, rename and delete categories;
   - add, edit and delete items in a category.
   Tapping an item works as today (adds a line to the selected meal, or appends with " / " in "add as option" mode).
5. **Library page** where she manages both lists. It is reachable as a new dietitian tab, **"Hazırlar"** (so the dietitian's bottom tab bar comes back, with 2 tabs). From the editor, a "Düzenle" link opens the same management UI **without leaving the editor and without losing the unsaved program** (a full-screen sheet/modal on top of the editor that reuses the library component). When she closes it, the editor shows the updated lists.
6. **Starting data.** Each dietitian starts with today's examples:
   - the `QUICK_PICKS` categories and items;
   - the `MEAL_PRESETS` as saved meals with empty items.
   **Examples she deletes must never come back.** Moving the data to the backend removes `quickPicks.ts`.
7. Stored in the DB, scoped to the dietitian (owner from the token), so it is the same on phone and computer.
8. Works at phone width; TR/EN UI strings. Library content itself is whatever she types: category names are free text, no longer i18n keys.

## Editor layout (changes)

- The sticky quick panel at the top gets two tabs: **Öğünler** (saved meals as chips/cards plus "Boş öğün") and **Maddeler** (categories + item chips, as today, with the "add as option" toggle). A small "Düzenle" link opens the management sheet.
- The bottom "Öğün ekle" box (fixed presets) is removed; adding meals happens from the Öğünler tab.
- Each meal card's action row gains:
  - "Hazır öğün yap" (☆), on all programs;
  - "Tüm günlere ekle", on weekly programs only;
  next to the existing up / down / delete.
- Everything else in the editor stays as it is: program type, title, date, day tabs, copy day, notes, save, validation.

## Non-goals (this version)

- Calories or macros for items and meals. The user wants this **later**: keep it possible, but don't build it.
- Reordering saved meals, categories or items by drag. New ones go to the end. Saved meals are listed by time, with empty time last.
- Sharing libraries between dietitians, client-visible anything, and whole-day or whole-week templates.
- Changing how plans are stored. Plans keep copies of the text; editing a saved meal never changes existing programs.

## Anti-goals

- Losing a half-written program because she went to edit her buttons.
- Deleted examples reappearing.
- The editor getting more crowded than now on a phone. The two-tab panel must not be taller than today's quick panel.

## Constraints

Follow the project conventions in `CLAUDE.md`:
- a new Flyway migration (V7) with named constraints;
- DTO-only API with `fail-on-unknown-properties`;
- `DIETITIAN`-only controller, with the owner from `Authentication.getName()`, never from the body; another dietitian's row → 404;
- `GlobalExceptionHandler` mappings;
- Mockito unit tests for the service rules;
- frontend through `apiRequest`; types in `src/types`;
- load effects must not depend on `t`;
- `npm run build` and `lint` clean.

Size limits:
- saved meal name ≤ 60 characters (same as plan meals, so a saved meal always fits into a plan); items ≤ 4000;
- category name ≤ 50;
- item text ≤ 255;
- names and items trimmed and not blank. Saved-meal items may be blank.

## Calls made by Claude (check these)

- Seeded category names are **Turkish** free text, whatever the UI language, matching the Turkish items.
- "Tüm günlere ekle" uses the same name+time match as "Hazır öğün yap".
- The library is a new dietitian tab, "Hazırlar".
- The editor's quick panel is split into two tabs, **Öğünler** and **Maddeler**.
- The bottom "Öğün ekle" box is removed.

## Left to the builder

- Table and endpoint shapes. For example: `meal_template`; `quick_pick_category` + `quick_pick_item` (position columns for stable order); `/diet-library` routes.
- How "seed once" is recorded. It must survive her deleting everything.
- Whether the library loads with one call or several.
- Exact visuals within the brand tokens; the mockup is `.superpowers/brainstorm/*/content/diet-editor-idea.html`.
