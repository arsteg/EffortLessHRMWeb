import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseTemplate } from '@angular/compiler';

function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)]);
}
const results = walk('src/app').filter(file => file.endsWith('.html')).map(file => {
  const source = readFileSync(file, 'utf8');
  const parsed = parseTemplate(source, file);
  const active = source.replace(/<!--[\s\S]*?-->/g, '');
  return {
    file: file.replaceAll('\\', '/'),
    parseErrors: (parsed.errors ?? []).map(error => error.toString()),
    forms: (active.match(/<form\b/g) ?? []).length,
    tables: (active.match(/<(?:table|hrm-table)\b/g) ?? []).length,
    // These are review candidates, not a claim that every occurrence is an error.
    clickOnlyNonButtons: (active.match(/<(?:a|div|span|li)\b(?=[^>]*\(click\))(?!(?:[^>]*(?:routerLink|href=|tabindex=|\(keydown|\(keyup)))[^>]*>/g) ?? []).length,
    browserReview: 'See template-inventory.csv; parser coverage is not visual or workflow validation.'
  };
});
writeFileSync('docs/design/template-audit.json', JSON.stringify(results, null, 2));
const errors = results.reduce((total, result) => total + result.parseErrors.length, 0);
console.log(`Parsed ${results.length} templates; ${errors} Angular parser errors.`);
if (errors) process.exitCode = 1;
