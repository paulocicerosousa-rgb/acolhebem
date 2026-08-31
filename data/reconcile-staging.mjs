import fs from 'node:fs/promises';
const fixture = JSON.parse(await fs.readFile(new URL('./staging-fixture.json', import.meta.url), 'utf8'));
const byId = rows => new Map(rows.map(row => [row.id, row]));
const sheets = byId(fixture.sheets); const postgres = byId(fixture.postgres); const issues = [];
for (const id of new Set([...sheets.keys(), ...postgres.keys()])) {
  if (!sheets.has(id)) issues.push({ id, type: 'missing_in_sheets' });
  else if (!postgres.has(id)) issues.push({ id, type: 'missing_in_postgres' });
  else for (const field of ['room','checkin','checkout','status']) if (sheets.get(id)[field] !== postgres.get(id)[field]) issues.push({ id, type: 'field_mismatch', field });
}
console.log(JSON.stringify({ source: 'staging-fixture', compared: sheets.size, divergences: issues }, null, 2));
if (issues.length) process.exitCode = 2;
