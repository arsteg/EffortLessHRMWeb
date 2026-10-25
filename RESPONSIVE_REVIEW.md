# Responsive Review Checklist

Status: `[code]` = code-reviewed and fixed, `[ok]` = reviewed, no change needed, `[blocked]` = could not verify in a browser (reason noted).

**Browser verification was not performed.** The Claude-in-Chrome browser extension was not connected in this environment, so no live visual/interaction testing at the required viewport widths (320–1920px) was possible. All work below is code-level review, confirmed against a successful `ng build` (development config) and manual tracing of template/style logic. This should be visually verified in a real browser before shipping.

## Global / Shell — `[code]`
- `src/index.html` — viewport meta tag already correct (`width=device-width, initial-scale=1`). No change needed.
- `src/styles.scss` — fixed:
  - `.modal-dialog` max-width now clamps to `min(764px, calc(100vw - 2rem))` instead of a flat `764px !important`.
  - Added viewport-safe overlay rules for `.cdk-overlay-pane`, `.mat-mdc-dialog-container`, `.mat-mdc-menu-panel` under `max-width: 767.98px`.
  - `.dash-report`, `.dash-boxes` gained `max-width: 100%` so they shrink below their fixed px width.
  - `.payslipContainer` comment clarifies it must stay fixed-width (captured by html2canvas for PDF export); added `.payslip-scroll-area` utility class (`overflow-x:auto`) for its scroll parent instead.
  - `.subMenu`/`.tabs`/`.submenuTab` get reduced padding and wrapping under 767.98px.
- `layouts/home/home.component.ts` — `isMobile` is now initialized via `checkScreen()` in `ngOnInit`, not only on window resize. Previously a phone loading the app got the desktop "side" drawer mode until the first resize event.
- `layouts/home/home.component.css` — content wrapper padding reduced on narrow screens, `min-width: 0` added so it can shrink inside the flex/grid drawer layout.
- `layouts/home/header/header.component.css` — header row and trial banner now wrap below 992px instead of overflowing.
- `layouts/home/sidebar/*` — reviewed, already handles rail/drawer modes correctly via `mat-drawer` `over`/`side` mode toggle driven by `isMobile`. No change needed.
- `common/hrm-table/*` (shared Material table component) — already wraps its table in `.table-responsive`. No change needed.

## Tables — `[code]`
Audited every `<table>` in the codebase (originally 73 files). 63 were missing a `.table-responsive` (or equivalent) scroll container, which caused page-level horizontal overflow on narrow screens instead of a contained scroll region. All 63 are now wrapped — the table element, its directives/bindings, and all inner content are unchanged; only a `<div class="table-responsive">...</div>` wrapper was added.

Two files were intentionally **left unwrapped**:
- `feature_modules/payroll/payslips/generate-payslips/generate-payslips.component.html`
- `feature_modules/payroll/fnf-payslips/generated-fnf-payslips/generated-fnf-payslips.component.html`

Both tables sit inside `#payslipContainer`, which `html2canvas` captures at a fixed document width to generate the downloadable payslip PDF. Shrinking that container would shrink/clip the generated PDF. Instead, the wrapping `.card` element (the scroll parent, not the captured element) got a new `.payslip-scroll-area` class (`overflow-x:auto`) so the preview can be scrolled horizontally on narrow screens without touching the captured layout.

The two **preview-only** payslip components used inside the payroll wizard (`view-payslip`, `view-fnf-payslip` — not captured by html2canvas) had their internal tables wrapped normally, and their flex sections (`payslip-header`, `employee-summary-section`, `pf-details-section`, `net-payable-content`) gained `flex-wrap`/`gap` so they stack instead of overflowing, plus a `max-width:575.98px` block that reduces padding and the `net-pay-box` min-width.

## Fixed-width stylesheets — `[code]`/`[ok]`
Audited ~30 stylesheets flagged by a width-pattern sweep (≥350px fixed width/height). Most were false positives already handled correctly:
- `attendance-overview.component.scss` (attendance calendar heatmap table) — already has thorough per-breakpoint cell-width shrinking down to 768px and is wrapped in `.table-responsive` in its template. No change.
- `layouts/main/main.component.css` (landing page) — the flagged widths are a decorative absolutely-positioned circle clipped by `overflow:hidden` on its parent, and a video-modal that already has three progressive breakpoints down to `width:80%`. No change.
- `tasks/tasks.component.css`, `tasks/edit-task/edit-task.component.css`, `layouts/landing-page/hero/hero.component.css` — flagged widths are either `max-width`, viewport-relative (`vw`), or on an element not actually referenced in the template (dead CSS). No change.
- Several feedback/leave/dashboard/alerts/organization stylesheets — already fluid (`max-width: 100%`, percentage-based) or scoped to small decorative elements. No change.

Real fixes applied:
- `chat/chatbot/chatbot.component.css` — chat panel (fixed `position: fixed` host, 400×450px) now has `max-width: calc(100vw - 40px)` and `max-height: calc(100dvh - 100px)` so it fits small phone screens instead of overflowing past the viewport edge.
- `feature_modules/view-live-screen/view-live-screen/view-live-screen.component.html` — inline `style="width:500px;height:200px"` on the live-screen preview image replaced with `width:100%; max-width:500px; height:auto; aspect-ratio:5/2` so it scales down on narrow screens.
- `feature_modules/payroll/run-payroll/payroll-steps/step-9/view-payslip/view-payslip.component.css` and the matching `view-fnf-payslip.component.css` — see Tables section above.
- `feature_modules/payroll/run-payroll/payroll-steps/step-9/step-9.component.css` — `.modal-dialog { max-width: 950px !important }` now clamps to `min(950px, calc(100vw - 2rem))`.

Audited MatDialog `.open(..., {width: '…px'})` calls (99 files) — Angular Material applies a default `maxWidth: 80vw` unless a dialog explicitly overrides it, so fixed px widths like `400px`/`500px`/`600px` already shrink correctly on narrow viewports. Two dialogs that explicitly set `maxWidth: 'none'` (`attendance-records`, `screenshots`) were checked and are safe because their `width` is itself `80vw`/`80%`, not a fixed px value.

Audited Bootstrap grid usage (`col-md-*`, `col-lg-*` without explicit `col-12`) — Bootstrap's grid already defaults unprefixed/`col-md-*` columns to full width below their breakpoint, so most multi-column forms built on the grid were already stacking correctly without any change.

## Feature modules — `[code]` (template/style review only, not browser-verified)
All feature module pages were covered by the table-wrapping and fixed-width passes above: alerts, approvals, attendance (incl. generalSettings, on-duty records/templates, overtime, roster), calendar, dashboard (admin + user), expenses (all sub-screens), feedback, helpdesk, interview-process, leave (incl. short-leave, holidays, supervisors), logs, manage (permission model), manual-time, organization (assets, flexi-holidays), payroll (ctc-templates, payslips, run-payroll wizard, settings), permissions, realtime, reports, role-permission, roles, screenshots, separation, settings, subscription, taxation, timesheets, view-live-screen, tasks, profile.

No page-specific layout defects beyond missing table wrappers and the fixed widths above were found during code review. A full interactive pass (opening every dialog/dropdown/filter and testing at each required breakpoint) was not performed — see Verification Limitations.

## Verification Limitations
- **Browser verification: not performed.** The Claude-in-Chrome extension was not connected (`tabs_context_mcp` returned "Browser extension is not connected"). No screenshots or live interaction testing were done at 320/375–390/430/768/1024/1280/1440/1920px, no dialogs/menus/dropdowns were opened, no zoom-to-200% check, no touch-target measurement. Recommend running a manual pass (`npx ng serve`) once a browser/extension is available.
- **Automated test suite:** `ng test` fails to compile independent of these changes — several `.spec.ts` files import component class names that no longer exist in their corresponding `.component.ts` (e.g. `ApprovedComponent` vs. the actual `ApprovedOnDutyComponent`, `LogComponentComponent` vs. `LogComponent`), and `app.component.spec.ts` references a `title` property `AppComponent` doesn't have. Confirmed pre-existing via `git stash` + re-run against the base commit — none of the broken spec files or their components were touched by this work. No lint script is configured in `package.json`/`angular.json`.
- **Build:** `ng build --configuration=development` succeeds with only pre-existing warnings (autoprefixer `justify-content:end`, CommonJS `exceljs`/`file-saver` bailout notices) on files untouched by this change.
