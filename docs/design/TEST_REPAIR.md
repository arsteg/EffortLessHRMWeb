# Full-suite repair and UI regression coverage

Final result: **143 passing tests, zero failures** in ChromeHeadless. Log: `tests-repair-final.log`. The full development build passes (`build-final.log`, hash `a13b8ff369ba9255`).

## Test infrastructure

Generated smoke tests lacked actual Angular dependencies, imported non-standalone components as modules, omitted required inputs/dialog data, and rendered parents without their children. Fixtures now use real components and UI dependencies, Angular's HTTP testing backend, explicit employee/session fixtures, Material's icon testing registry, and an isolated WebSocket double. Session fixtures do not write browser storage or modify production authentication. No real API data is used.

Unknown elements and properties now throw globally in the test environment. No assertion was removed, no test disabled, and no schema added to hide errors. The obsolete commented-out layout-component test was replaced with a test of the actual sidebar directive.

## Product defects exposed by rendering tests

- Translated ARIA labels now bind HTML attributes; interpolated data attributes used by sorting do likewise.
- Material report options rely on the existing select's ngModel rather than an unsupported `selected` input. A test verifies that the selected user model selects the corresponding option.
- Productivity radios now bind the existing `isProductive` reactive control, avoiding the mixed-form registration error. A test verifies that choosing No produces `false` in the form.
- Interview initialization now retains the fields and validators already declared by its constructor instead of replacing them with an unrelated candidate-only form. The candidate select binds the actual `candidate` control. No API payload mapping or endpoint changed.
- The shared table now accepts the `showPaginator` input already present in payroll templates while preserving automatic pagination when omitted.
- Dashboard chart dimensions measured after view creation are synchronized before Angular's development check. Charts, calculations and data requests are unchanged.

## Added behavioral coverage

Shared table search and empty state; server search/paging/sort and row-selection outputs; export column mapping without downloading; explicit paginator visibility; report option selection; productivity radio value; native chat-button state and conditional panel; sidebar toggling; on-duty child configuration; feedback required fields; log subscription cleanup; and four asset-merge scenarios.

Tests do not replace authenticated employee/admin visual validation, real API integration, assistive-technology testing or 200% zoom checks. Existing ngModel/reactive-form deprecation warnings and build dependency warnings remain. Earlier failure logs are retained as historical evidence.
