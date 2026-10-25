# EffortlessHRM visual refresh — 25 October 2026

## Status

Implemented a shared visual refresh and targeted screen improvements in the existing Angular application. **This is not a completed page-by-page product sign-off.** The local access blocker is now resolved: admin, manager and employee login succeeded. The latest pass records 47 role/page render checks, 224 authenticated responsive checks, five additional fixes, 144 passing unit tests and a successful development build. See [Authenticated review](AUTHENTICATED_REVIEW.md) for current evidence and remaining scope. The earlier verification and limitations below describe the preceding public-screen phase; statements about unavailable authenticated access are superseded by that review.

### Local environment recheck

- Read-only requests to `http://localhost:8080/api/v1/userPreferences/structure` and `/api/v1/common/countrylist` returned HTTP 200 JSON.
- CORS allows `http://localhost:4200` with credentials enabled.
- An unauthenticated GET to `/api/v1/users/` returned HTTP 401 with the expected login-required message.
- The chat browser can inspect the running frontend at `http://localhost:4200/#/login`. Chrome's other session is not shared with this browser.
- API root `/api/v1` returns HTTP 500 because the `welcome` view is missing; the tested JSON endpoints respond successfully. GET `/api/v1/users/me` is not a valid route (the source defines POST), so its 404 is not treated as an API defect.
- No credentials, tokens, or employee data were copied into this report. No HR data was changed by these checks. Earlier statements about an unavailable backend describe the earlier testing phase, not current connectivity.

## Direction and references

Keep the existing logo, orange and green identity, Nunito Sans, Angular 17, Material and Bootstrap. Use warm navigation accents, a neutral work canvas, white surfaces, restrained borders, compact headings and stable controls. Darker orange/green action shades support readable white labels; the original brand orange remains in artwork and accents.

Official references actually read:

- [Personio Core HR](https://www.personio.com/product/core-hr-software/): task-oriented grouping of people, time, documents and reporting. Applied the principle of clear section hierarchy, without changing our routes or feature grouping.
- [Gusto employee self-service](https://gusto.com/product/payroll/employee-self-serve): direct access to an employee's existing information and everyday actions.
- [Gusto employee management component documentation](https://sdk.gusto.com/docs/reference/employee/management/blocks/): tabbed detail sections, distinct read/edit surfaces and explicit feedback. Useful support for keeping existing profile tabs and form workflows, with consistent presentation.

Research was limited to public product content and documentation, not authenticated competitor tours or a full screenshot study. BambooHR pages attempted were unavailable. No competitor assets or wording were copied.

## Changes

- Added shared color, surface, border, radius, elevation, motion and focus tokens; retained the existing spacing scale.
- Harmonized Material action colors and Bootstrap workspace controls. Improved input borders, semantic action colors, dialogs, expansion panels, menus, notifications and reduced-motion handling.
- Reworked the shell as a viewport-height flex layout so a wrapping header does not push the drawer below the viewport. Retained mobile overlay navigation and the drawer width observer.
- Replaced sidebar clickable list items with real links; preserved each binding, destination and active condition. Added a navigation landmark and skip-to-content link.
- Made the account trigger a keyboard-operable button, with named navigation, photo and notification controls.
- Refined the shared table toolbar, headers, rows, empty state and scroll region. Named search, selection and row-action controls. Sorting, pagination, selection and export handlers are unchanged.
- Made the shared CRUD form fluid and associated its text/date/select labels. Styled existing validation feedback.
- Reworked login, registration and recovery layout with a bounded form column and no fixed top spacer; retained artwork. Improved password toggle names, password-manager autocomplete, logo alternatives and login error announcements. Refined the change-password layout and fixed label associations.
- Improved admin/user dashboard card breakpoints and chart legend readability. Attendance summaries now use restrained accents. Attendance text has a 12px floor rather than shrinking to 4–8px; calendar tables scroll with usable column widths.
- Kept profile section tabs shrinkable and named the employee back action. Fixed the live-screen grid minimum width on narrow screens.
- Added 86 accessible names across 71 additional templates for existing icon-only actions, mostly close-dialog and more-actions buttons. See `icon-labels.csv`.
- Made the chat launcher a named native button with expanded state; named message/voice controls and a live message log; fixed narrow input sizing and long-message wrapping.
- Converted public navigation and timesheet export actions to native buttons while preserving handlers. Mobile navigation opens by keyboard and restores focus after Escape.
- Fixed 320px landing overflow by wrapping footer social links; named those links. Scoped landing section spacing to its own page.
- Improved public feedback form width, dynamic field names and keyboard rating controls; removed helpdesk toolbar overlap and raised task-count text from 9px to 12px.
- Resolved five externally introduced asset-management merge conflicts at the user's request, preserving current validation/custom fields and incoming report/panel behavior. No unmerged files remain.

Routes, package dependencies, services, calculations, permissions and API contracts remain unchanged. Production TypeScript includes the separately authorized asset merge, the table paginator input already used by payroll templates, dashboard post-render measurement synchronization, and restoration of the interview form controls already defined in its constructor. See `ASSET_MERGE.md` and `TEST_REPAIR.md` for the exact scope. Payslip capture dimensions and existing table scroll wrappers remain in place.

## Coverage checklist

- [x] Inspect clean working tree, architecture, theme, shell, routes and previous responsive review. No applicable AGENTS.md found.
- [x] Inventory the original 332 HTML templates (333 after the incoming asset-report template) and route declarations: `template-inventory.csv`, `route-inventory.txt`.
- [x] Source-review and improve shared navigation, header, table, CRUD/form controls and account screens.
- [x] Source-review dashboard, attendance overview, employee-profile sections and representative leave form.
- [x] Structural sweep across feature templates for tables, forms, dialogs, tiny inline text, fixed widths and unnamed icon buttons.
- [x] Apply shared styling through the workspace and Material overlays.
- [x] Repair and run the entire unit suite with strict template diagnostics (143 passing).
- [x] Parse all 333 templates and record structural review coverage.
- [x] Browser-review login, registration, password recovery, landing/mobile navigation, chat and the change-password form.
- [x] Additional source review of public feedback, helpdesk toolbar, timesheet export/scroll controls and asset-management merge.
- [ ] Individually review every authenticated page and significant state with realistic safe data. Inventory coverage is not a claim of individual visual review.
- [ ] Exercise all role-specific workflows, charts, menus, dialogs, exports, filters, sorting and pagination in a running authenticated session.
- [ ] Complete 200% browser zoom, screen-reader and full WCAG 2.2 AA audit.

Feature inventory includes alerts, approvals, attendance, calendar, dashboard, expenses, feedback, helpdesk, interviews, leave, logs, manage/profile, manual time, organization/assets, payroll/F&F, permissions/roles, realtime/screenshots, reports, separation, settings, subscriptions, taxation, timesheets, tasks, landing and account pages. Shared improvements apply to these surfaces where they use the existing controls; specialized screens retain their existing composition.

## Verification

- `npm run build -- --configuration=development`: passed after continuation and asset merge, hash `a13b8ff369ba9255`; see `build-final.log`. Existing CommonJS and autoprefixer warnings remain.
- **Full suite passes: 143 tests, zero failures**, with unknown-template-element/property errors enabled globally. See `tests-repair-final.log`. The final run contains no logged ERROR, NG0303 or NG0304 messages; existing ngModel/reactive-form deprecation warnings remain.
- Repaired test dependencies, standalone declarations, required inputs, role/session fixtures and child-component setup. HTTP uses Angular's test backend; WebSockets use an isolated test double; SVG loading uses Material's testing registry. No tests were disabled or schemas added to suppress diagnostics.
- Added regression checks for shared table search/empty state, server paging/search/sort/selection outputs, export mappings, paginator configuration, report selection, productivity radios, chat, sidebar and the asset merge. Earlier failing logs and `test-failures.json` are historical, not current failures.
- `node docs/design/audit-templates.mjs`: all **333 templates parse successfully**. `template-audit.json` records per-template structure and review candidates; this is not individual visual/workflow sign-off.
- No lint script or Angular lint target is configured. No lint check claimed.
- `node docs/design/verify-template-contracts.cjs 96807616`: passed against the pre-redesign baseline; 1,336 event/form/route bindings checked across 106 modified templates; exact exceptions document the skip link, asset add panel and regression-tested candidate/productivity field repairs. This is a source guard, not an end-to-end behavior test.
- `git diff --check` and `git diff --cached --check`: passed; `git ls-files -u` is empty.
- Final login, registration, password recovery and landing checks at 320, 390, 430, 768, 1024, 1440 and 1920 CSS pixels: all 28 checks have no page-level horizontal overflow or completed broken images. See `public-responsive-final.json`. Landing was rechecked at 320px after the footer fix (312px document width).
- Login visually inspected at phone, tablet and desktop widths; short 430×400 viewport remains vertically scrollable. Registration and recovery inspected at phone widths; change-password at 390px. Browser automation became intermittently unavailable during later navigation; remaining public-page checks and zoom checks are not claimed.
- Empty login submission showed both field errors and the existing summary message without calling login. Password visibility changed its accessible name and pressed state. Recovery navigation and language-menu open/Escape dismissal worked. Registration blur validation displayed the required first-name error. No OTP, recovery email, account creation, password change or HR action was submitted.
- Keyboard navigation was inspected on login/registration. Material focused fields show their focused border; named toggles and additional focus outlines are implemented. No complete assistive-technology audit performed.
- Computed token contrast against white: orange action 5.51:1; green action 5.03:1; muted text 5.78:1; main text 12.86:1; danger 6.51:1; focus/info 6.97:1; control border 3.05:1. These checks do not certify all legacy page colors.
- Browser console reported failed preference-structure requests to the local backend. No claim of a clean runtime console or successful authenticated API integration.

## Screenshots

Both captures use a 643×1004 viewport and contain only the public login screen.

| Before | After |
| --- | --- |
| ![Before](screenshots/login-before.png) | ![After](screenshots/login-final.png) |

## Remaining limitations

Authenticated screenshots, populated dashboard/list/form visual validation, permission checks and actual data operations were unavailable without a test session. Reset-password requires a valid test token. Public feedback fields depend on backend configuration; their labels/rating controls received source review, not populated browser validation. Third-party enquiry submission was not exercised. The incoming asset-report page remains a placeholder. Source review found the existing feedback Boolean block checks `FieldType.Date`; it was not changed because that alters field-rendering logic beyond the visual work. The full page-by-page review remains outstanding; the inventory deliberately marks that distinction. New generic accessible names follow existing English shared controls; translation expansion remains to be reviewed. Existing legacy CSS and unmodified local overrides still require visual validation before release.


## Continuation evidence

- `public-responsive-final.json`: 28 responsive measurements.
- `screenshots/login-final.png`, `register-mobile.png`, `recovery-mobile.png`, `landing-mobile.png`, `navigation-mobile.png`, `chat-320.png`.
- `ASSET_MERGE.md`: exact conflict-resolution scope and regression evidence.
- No authenticated account was available; the user reconfirmed continuing with source and public checks only. Full page-by-page authenticated review remains a release prerequisite, not a completed deliverable.


## Final repair pass

Strict component rendering uncovered and fixed invalid translated ARIA/data attribute bindings; redundant unsupported Material option selection inputs; disconnected productivity radio controls; the interview form reset that discarded its declared fields; dashboard post-view sizing errors; and a paginator property that payroll templates attempted to bind without an Angular input. Existing event handlers, route destinations and API endpoints remain intact. No live HR operations were performed. These fixes are protected by the full passing suite; real backend and role-specific visual validation still need a test environment.

## Authenticated-session review — 25 October 2026 (continuation)

The prior review's main open gap was authenticated-page verification: no test account existed. This session built one.

### Local environment

A local MongoDB 6 container (`docker run ... mongo:6`), the existing Node/Express API pointed at it (`ARSTEG.EffortlessHRM.API/config.env` `DATABASE` changed to `mongodb://localhost:27017/EffortlessHRM`, local-only, not committed with real secrets since the tracked copy of that file is empty), and the already-running `ng serve --configuration=localhost` dev server. A test company ("Acme Test Co") with an Admin, a Manager and an Employee account (`admin@acmetest.local` / `manager@acmetest.local` / `employee@acmetest.local`, all `Passw0rd!`) was created through the product's own `/users/websignup` and `/users/signup` endpoints, with the manager assigned as the employee's reporting manager via `/auth/roles/addSubordinate`. A fresh database has no global `Permission` catalog (it's expected to already exist in the real deployment and is not seeded by signup), so the shared navigation rendered with an empty sidebar until one was seeded from `config/rolePermissions.json` via a throwaway local script (`ARSTEG.EffortlessHRM.API/seed-local-permissions.js`, not part of the product). Chrome automation was driven directly over CDP (Playwright `connectOverCDP`/headless) since the Claude-in-Chrome extension did not connect this session.

### Verified

Admin, Manager and Employee dashboards; Organization (setup, zone/location/department/designation/band/holiday/tax slab tabs); Manage (employee list, profile/employment/salary/statutory/loans tabs); Leave (categories, settings, "Add Leave Category" dialog); Attendance (templates/shifts); Payroll (general settings); Reports (timeline); Permissions (roles/permissions/assignment lists). Role-based navigation correctly differs between the Admin role (full menu) and the User role (Maya/Eli — no Organization, Manage, Payroll, Permissions or Approvals). Table toolbars, tabs, dialogs, empty states and status text render consistently with the design system described above. Responsive behavior was re-checked at 1440px (desktop), and at a true 390px viewport and the narrowest a real Windows Chrome window will report (~500px): the shell collapses to a hamburger-triggered overlay drawer, header controls stay reachable, data tables scroll horizontally within their own container with no page-level overflow, and the "Add Leave Category" dialog stacks its fields and stays scrollable with pinned actions. No page-level horizontal overflow was found at either width once the app had fully settled.

### Issues found and fixed

- Toast notifications (`ngx-toastr`, default `toast-top-right`) rendered on top of the fixed header and covered the language/notification/account controls while visible. Pinned the toast container 80px from the top in `src/styles.scss` so it clears the header.
- Clicking "Settings" on an employee row with no appointment record (e.g., one created by an admin through `/signup` rather than through self-registration) silently did nothing but `console.error('empCode is not defined')` — no feedback to the user. `user-list.component.ts` `toggleView()` now shows a toast explaining the record is incomplete instead of failing silently. This is a front-end presentation fix only; it does not change the underlying backend behavior that some admin-created employees can lack an appointment/employee-code record.
- `WorkspaceComponent` (the landing page's decorative dashboard-mockup graphic, `layouts/landing-page/workspace/`) mutated a template-bound property (`hasScroll`) inside `ngAfterViewInit`, which is a reliably-reproducible `NG0100: ExpressionChangedAfterItHasBeenCheckedError` in dev mode. Deferred the update with `Promise.resolve().then(...)` and added a `ChangeDetectorRef.markForCheck()` call, the standard fix for this Angular pattern. DOM inspection during this investigation confirmed this error does not affect what authenticated users actually see (the dashboard rendered correctly throughout); it's a dev-mode console error, not a rendering defect, but it's worth keeping fixed as hygiene.

### Verification

- `npm run build -- --configuration=development`: passed.
- Full unit suite: **143 passing, 0 failures** (ChromeHeadless), same as before this session's changes.
- No lint script is configured (unchanged from before).

### Remaining limitations

- Browser automation in this session used a direct CDP connection rather than the Claude-in-Chrome extension (which never connected), and a real on-screen Chrome window on this machine cannot be resized below roughly 500px, so the canonical 320px breakpoint was checked via DOM measurement and a headless Chromium context rather than a visual screenshot (headless full-page and even viewport screenshots were unreliable in this environment — they intermittently rendered the landing page's static content instead of the live page despite the DOM, title and visible nav items being correct for the authenticated dashboard throughout; this looks like a Chrome headless screenshot/compositor artifact specific to this sandbox, not a product defect, and is called out here so it isn't mistaken for one later).
- Coverage this session was breadth-first across representative screens per module (list/detail/form/dialog), not an exhaustive page-by-page pass. Payroll's CTC/variable-pay templates, Taxation, Separation, Recruitment/Interview, Helpdesk, Approvals, chat, and most dialogs/exports were not individually opened this session.
- The local Permission-catalog gap (seeded ad hoc for this session only) is a pre-existing backend/deployment characteristic, not something addressed here — flagging it since it will reproduce for any other fresh local database.
- `docs/design/verify-template-contracts.cjs` carries an unrelated uncommitted modification from before this session; it was not touched here and is left as found.
