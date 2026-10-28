# Diyet Programı Implementation Plan

> Executed inline by Claude at the user's request ("sen yaz"); the user commits.

**Goal:** Dietitians write daily or weekly diet programs (meals with free names/times and item lines) per client with quick-pick helpers; clients read their current menu in a "Menüm" tab; client cards show ✓ when a program exists.

**Spec:** `docs/superpowers/specs/2026-10-28-diyet-programi-design.md`

## Global constraints
- `day_index`: 0 = every day (DAILY only); 1–7 = Monday–Sunday (WEEKLY only). Mixed or out-of-range → 400.
- Meal time optional, format `HH:MM`; meal name ≤ 60; items ≤ 4000 chars, non-blank; title ≤ 100.
- Active program = latest `created_at` for the client.
- Ownership: client program read from token; dietitian access through `findClientById` (404 for non-clients); a plan id of another client → 404.
- Theme tokens, `components/ui.ts`, TR+EN strings, phone width first.

## Review focus
1. A weekly program missing some days → the client sees an empty-day message, not a crash.
2. Editor: switching daily↔weekly does not silently lose meals.
3. Client with no program → friendly empty state in "Menüm" (204).
4. Alternatives "a / b / c" render as separate options; a single "/" inside "1/2 elma" style text is not split (split only on " / " with spaces).
5. Saving with an empty meal or bad time → message on the editor, not a silent failure.

## Tasks
1. **V6 + entities:** `diet_plan` (client, created_by, plan_type ENUM('DAILY','WEEKLY'), title, start_date, notes TEXT, created_at, updated_at) and `diet_plan_meal` (plan FK ON DELETE CASCADE, day_index, position, name, meal_time, items TEXT); `DietPlan` (`@OneToMany` meals, cascade, orphanRemoval, ordered by day_index, position), `DietPlanMeal`, `DietPlanRepository`.
2. **Service + DTOs (TDD):** `DietPlanRequest`/`DietMealRequest` (validation), `DietPlanResponse`; `DietPlanService`: `getMyActivePlan`, `listClientPlans`, `createPlan`, `updatePlan`, `deletePlan`; day-index rule → `DietPlanInvalidException` (400). `ClientOverviewResponse.hasPlan`.
3. **Endpoints:** `GET /diet-plan` (CLIENT, 204 if none); `/clients/{clientId}/diet-plans` GET/POST, `/{planId}` PUT/DELETE (DIETITIAN). HTTP checks.
4. **Frontend data + client "Menüm":** types, `dietService`, `MenuPage`, tab, alternatives rendering.
5. **Dietitian editor:** `DietPlanEditorPage` (presets, quick picks, add-as-option mode, copy day, type switch), `DietPlanSection` on the client page, ✓ on client cards, i18n.
6. **Verify** (phone width, both roles), notes, commit list for the user.
