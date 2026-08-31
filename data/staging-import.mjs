import fs from 'node:fs/promises';
const fixture = JSON.parse(await fs.readFile(new URL('./staging-fixture.json', import.meta.url), 'utf8'));
const seen = new Set(); const accepted = []; const rejected = [];
for (const row of fixture.sheets) {
  if (!row.id || seen.has(row.id) || new Date(row.checkin) >= new Date(row.checkout)) { rejected.push({ id: row.id || null, reason: 'invalid_or_duplicate' }); continue; }
  seen.add(row.id); accepted.push({ ...row, imported_at: new Date().toISOString() });
}
console.log(JSON.stringify({ mode: 'staging', read: fixture.sheets.length, accepted: accepted.length, rejected: rejected.length, rows: accepted }, null, 2));
