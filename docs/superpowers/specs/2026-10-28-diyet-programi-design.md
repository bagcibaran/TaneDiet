# Diyet programları ve menüler — design

Date: 2026-10-28 · Status: approved in chat ("evet uygun, sen yaz… geliştirmeler yapacağız"). First version; the user will refine it after trying it.

## Why

The dietitian (Betül Bağcı, "tane.diyet") writes a diet list for each client and sends it as a designed image/PDF over WhatsApp. A sample list (one day) has meals with free names and times — "Uyanış (10.30)", "Kahvaltı (14.00)", "Ara öğün (16.00)", "Akşam (19.00)", "Ara öğün (21.00)" — each a bullet list of items with portions (adet, KB, YK, gr, ml, dilim, kase, kepçe) and alternatives separated by "/" or "veya" ("4 köfte kadar et / 1 parça tavuk göğsü / 8 YK sebze yemeği"). Clients choose among alternatives rather than eating one fixed thing. Moving lists into the app lets clients always see their current menu on their phone and lets the dietitian write it faster.

## Goals

- Two program types:
  - **Günlük (DAILY):** one list, the same every day.
  - **Haftalık (WEEKLY):** a separate list for each weekday, Monday–Sunday.
- A day is an ordered list of **meals**; each meal has a free **name**, an optional **time** (HH:MM) and **items** (one per line; alternatives inside a line separated by "/").
- A program has a title (default "Diyet Listesi"), a start date and an optional general note.
- The **latest** program of a client is the active one until the dietitian writes a new one; older programs are kept as history.
- **Dietitian** (client page): sees the active program and history, creates a new program (optionally starting from a copy of the current one), edits or deletes programs.
- **Editor speed:** quick-pick meal presets (name + typical time) and a categorized quick-pick list of common items (seeded from the sample list) at the top; tapping an item adds a line to the selected meal, or appends it as an alternative ("/") in "add as option" mode. In weekly programs, **"copy this day to…"** other days.
- **Client:** new **"Menüm"** tab. Daily: the list. Weekly: today's menu (phone's weekday), with weekday buttons to see other days. Meals render as cards like the sample (green header "Kahvaltı · 14:00", bullet items, alternatives shown as separate "veya" options). Read-only.
- Client cards in the dietitian's list show a **✓** when the client has a program.
- TR/EN UI strings; menu content itself is whatever the dietitian types.

## Non-goals (this version)

Calories/macros, food database, reusable templates library, client "ate it" checkmarks, PDF/print export (noted: the sample's branded layout would make a nice export later), "new menu" notification to the client, program end dates / expiry.

## Decisions

- Weekly days are weekdays (Mon–Sun), not dates; "today" is the client's device weekday.
- Items are stored as plain text (one line per item) — no structured food rows.
- Only dietitians write programs; clients only read the latest one.
- Switching a program from daily to weekly copies the daily list to all seven days; weekly to daily keeps the currently selected day (after confirmation).
