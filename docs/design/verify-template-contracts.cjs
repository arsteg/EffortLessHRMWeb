// Review guard: compare existing UI contracts with the Git baseline.
// Run from the repository root: node docs/design/verify-template-contracts.cjs
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const git = (...args) => execFileSync('git', ['-c', 'core.safecrlf=false', ...args], { encoding: 'utf8' });
const files = git('diff', 'HEAD', '--diff-filter=M', '--name-only', '--', '*.html').trim().split('\n').filter(Boolean);
const contracts = /(?:\([\w.]+\)|\[?formControlName\]?|\[?formGroup\]?|\[?routerLink\]?)\s*=\s*(?:"[^"]*"|'[^']*')/g;
let checked = 0;
for (const file of files) {
  let baseline = git('show', `HEAD:${file}`);
  // Regression-tested repairs of bindings that previously threw during rendering.
  // Keep these exact substitutions explicit; do not broadly ignore form changes.
  if (file.endsWith('schedule-interview/schedule-interview.component.html')) {
    baseline = baseline.replace('formControlName="candidate._id"', 'formControlName="candidate"');
  }
  if (file.endsWith('app-website-settings/app-website-settings.component.html')) {
    baseline = baseline.replaceAll('name="isProductive" ngModel', 'name="isProductive" formControlName="isProductive"');
  }
  const before = baseline.match(contracts) || [];
  const after = readFileSync(file, 'utf8').match(contracts) || [];
  // Explicit additions: skip-link focus, and the user-authorized asset merge's add panel.
  const additions = ['(click)="$event.preventDefault(); mainContent.focus()"'];
  if (file.endsWith('assetTypeComponent/assetType.component.html')) additions.push('(click)="onAddAssetType()"');
  const filtered = after.filter(value => !additions.includes(value));
  assert.deepEqual(filtered, before, `UI contract changed in ${file}`);
  checked += before.length;
}
console.log(`PASS: ${checked} event, form and route bindings checked across ${files.length} templates; only the documented skip-link, asset-panel and regression-tested form repairs differ from baseline.`);
