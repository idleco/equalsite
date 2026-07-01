# Equalsite — design system & MVP page architecture

This doc exists so anyone (including Claude Code, working from the repo with no chat
history) can pick up the frontend work with full context. It captures brand identity,
tokens, and the information-architecture decisions behind the three MVP screens.
Static Tailwind reference mockups live alongside this doc: `index.html` (landing/audit
request), `progress.html` (live progress — now a 3-state machine, see §5.5), `result.html`
(audit result).

---

## 1. Product framing

Equalsite is a free, no-signup web accessibility diagnostic. Flow:

```
audit request form → crawler (queued → crawling → complete) → audit result
```

No auth, no dashboard, no billing in MVP — those are phase 2. An audit's UUID is its
own access credential (same pattern as PageSpeed Insights / GTmetrix).

## 2. Brand identity

- **Wordmark:** lowercase `equalsite`, set in Lexend.
- **Mark:** an equals sign whose top bar resolves into a checkmark hook — "equal
  access, verified." Simplify to two rounded bars at small sizes (favicon).
- **Voice:** direct, sentence case, plain verbs, no jargon, no fear-mongering.
  Errors and empty states explain what happened and what to do next — never
  apologetic, never a raw exception string.
- **Positioning line:** "see your site the way everyone does."

## 3. Color

Chosen so every semantic color maps 1:1 onto default Tailwind values — no custom
palette needed in `tailwind.config`.

| Role | Hex | Tailwind |
|---|---|---|
| Brand / primary CTA | `#4338CA` | `indigo-700` |
| Critical severity | `#DC2626` | `red-600` |
| Serious severity | `#EA580C` | `orange-600` |
| Moderate severity | `#CA8A04` | `yellow-600` |
| Minor severity | `#64748B` | `slate-500` |
| Pass / healthy | `#059669` | `emerald-600` |
| Ink (light mode) | `#12131A` | `slate-900` |
| Surface (light) | `#FAFAF9` | `stone-50` |
| Surface (dark) | `#0B0D12` | custom `#0B0D12`, close to `slate-950` |

Rule: **severity is never color-only.** Every severity badge pairs color with an
icon and a text label (critical / serious / moderate / minor).

Dark mode is a real accessibility feature here (photosensitivity, low vision), not
cosmetic — implement with Tailwind's `class` strategy, ship both modes at MVP, not
as a fast-follow.

## 4. Typography

- **Lexend** — headlines, the narrative score sentence, nav wordmark. Chosen
  deliberately: it's a typeface developed from reading-proficiency research, which
  is a quiet on-brand detail for an accessibility product.
- **Inter** — everything else (UI labels, body copy, data). Dense legibility at
  small sizes, wide language support.
- Two weights only in UI chrome: 400 regular, 500 medium. Avoid 600/700 — reserve
  heavier weight for the one narrative headline per page.

## 5. Information architecture decisions (locked)

These came out of UX review and should be treated as settled unless revisited:

1. **Lead with a story, not a bare score.** The health score circle is always
   paired with a one-sentence, plain-English headline naming the worst concrete
   consequence ("3 critical issues block checkout for screen reader users").
2. **Primary grouping is by affected user type**, not by axe rule ID: screen
   reader users, keyboard users, low vision users, etc. This is how a site owner
   actually triages, not how an auditor tags things.
3. **Within each group, issues sort quick-wins-first, then structural work.**
   This is the primary sort order for the whole issue list inside every expanded
   group — severity stays as a per-issue badge, not a section split, so a
   critical 5-minute fix and a critical rebuild aren't implied to carry equal
   next-step effort.
4. **Progressive disclosure.** Groups render collapsed by default except the
   single most severe group, which starts expanded. Each issue row is a summary
   (title, one-line plain-English consequence, page count, fix-time estimate,
   screenshot slot) — full DOM/selector detail lives one level deeper, not on
   this view.
5. **Live progress must feel alive.** Real page paths streaming into an activity
   feed as they're scanned, with live-updating counts, not a static spinner.
6. **Visual evidence over selector strings.** Every issue row has a screenshot
   thumbnail slot (Playwright already renders the page — capture it with the
   offending element highlighted).

### 5.5 Progress page is a 3-state machine

`progress.html` covers the full audit lifecycle behind one URL, not just the
crawling phase. States, in order:

**1. `waiting`** — job accepted, sitting in the BullMQ queue (concurrency is
capped at 2 Playwright instances per the deployment plan, so queuing is expected
under load, not an error state). Shows:
- Queue position (integer) and an estimated wait (position × average job
  duration — a rough heuristic is fine, don't over-engineer this for MVP).
- A relative-progress dot strip (visual "getting closer," no false-precision
  numbers).
- An explainer line stating *why* there's a queue ("2 audits run at a time so
  every scan gets a full, accurate crawl") — reframes the wait as a trust
  signal instead of looking broken.
- A reminder that the URL is bookmarkable and the person doesn't need to keep
  the tab open, reinforcing the no-auth/URL-is-the-credential pattern.

**2. `crawling`** — the existing live activity feed: real page paths streaming
in, running counts (pages found / scanned / issues so far), progress bar.

**3. `complete`** — brief success badge, then redirect to `result.html`.

State transitions happen in place on one page (no interstitial redirect between
`waiting` and `crawling` — they're the same audit lifecycle, so treat them as one
continuous experience). In production this is driven by Redis Stream events
(`audit.started` fires the waiting → crawling transition, `audit.progress` /
`audit.page.completed` drive the feed, `audit.completed` drives the redirect);
queue position comes from Horizon/BullMQ's own queue depth for that job.

### Fix-time estimate

MVP: hardcoded `axe rule ID → effort tier` lookup table (quick win / structural),
maintained by hand. Don't build dynamic effort scoring for MVP — not enough signal
yet, and a static map is fast to ship and good enough to sort by.

## 6. Component patterns (see HTML mockups for exact markup)

- **Severity badge** — pill, `bg-{color}-100 text-{color}-700` light /
  `bg-{color}-900/40 text-{color}-300` dark, icon + label, never bare color.
- **Metric card** — `bg-slate-100 dark:bg-slate-800/60`, no border, rounded-lg,
  label 12px muted above a 22–24px/500 number.
- **Queue stat pair** — same metric-card family, two values side by side
  separated by a hairline divider, used only in the `waiting` state.
- **Group header (collapsible)** — icon for the affected-user type, title,
  subtitle, severity-count badge, chevron. `aria-expanded` + `aria-controls`
  wired for screen reader users, since this is an accessibility tool auditing
  itself in real time.
- **Issue row** — screenshot thumbnail (64×48), title + severity badge, one-line
  plain-English impact, meta row (page count + fix-time).
- **Sub-section divider** — small icon + label ("quick wins" / "structural
  work") + hairline rule, not a heavy section header.

## 7. Implementation note for Claude Code

The production app is Laravel 13 + React 19 (Inertia). The three HTML files here
are static Tailwind references, not the final components — translate each into an
Inertia page + React components under `apps/web/resources/js/`, keeping:

- Tailwind config additions: `fontFamily.display = Lexend`, `fontFamily.sans =
  Inter`. No custom color palette needed (see §3 table).
- The collapsible group behavior (vanilla JS in the mockup) becomes a
  `<Disclosure>`-style React component with proper `aria-expanded` state.
- `progress.html`'s state machine (`waiting` → `crawling` → `complete`) becomes
  React state driven by the real Soketi/Redis Stream subscription, not the
  mockup's `setTimeout`/`setInterval` demo logic — those are only there to
  preview the intended feel and timing.
- Queue position for the `waiting` state should come from Horizon/BullMQ's
  queue depth API, scoped to the job's position among pending jobs — not
  something the frontend estimates on its own.
