import test from 'node:test'; import assert from 'node:assert/strict'; import rules from '../lib/reservation-rules.js';
test('estadas adjacentes não conflitam',()=>assert.equal(rules.overlaps('2026-09-01','2026-09-03','2026-09-03','2026-09-05'),false));
test('estadas sobrepostas conflitam',()=>assert.equal(rules.overlaps('2026-09-01','2026-09-04','2026-09-03','2026-09-05'),true));
test('checkout posterior',()=>assert.equal(rules.validStay('2026-09-04','2026-09-01'),false));
