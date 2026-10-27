const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const result = spawnSync(process.execPath, [
  'node_modules/@cucumber/cucumber/bin/cucumber.js',
  '.audit/diagnostic.feature',
  '--require', '.audit/diagnosticSteps.js',
  '--tags', '@diagnostic',
  '--format', 'json:reports/diagnostic.json',
  '--format', 'html:reports/diagnostic.html',
], { stdio: 'inherit', timeout: 120000 });
assert.equal(result.status, 1, 'The controlled scenario must fail');
const report = JSON.parse(fs.readFileSync('reports/diagnostic.json', 'utf8'));
assert.equal(report.flatMap(feature => feature.elements || []).length, 1);
assert.match(JSON.stringify(report), /Controlled failure to verify diagnostics/);
const stack = [report];
const embeddings = [];
while (stack.length) {
  const value = stack.pop();
  if (value && typeof value === 'object') {
    if (value.mime_type === 'image/png') embeddings.push(value.data);
    stack.push(...Object.values(value).filter(v => v && typeof v === 'object'));
  }
}
assert.ok(embeddings.length > 0, 'Failure PNG must be attached to the Cucumber report');
assert.equal(Buffer.from(embeddings[0], 'base64').subarray(1,4).toString(), 'PNG');
assert.ok(JSON.stringify(report).includes('application/json'), 'Failure media state must be attached');
assert.ok(fs.statSync('reports/diagnostic.html').size > 1000);
assert.ok(fs.readdirSync('reports').some(name => /^failure-.*\.png$/.test(name)));
console.log('Controlled diagnostic failure verified: HTML, embedded PNG, saved PNG, URL and media state.');
