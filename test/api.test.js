const test = require('node:test');
const assert = require('node:assert/strict');

const sheetsModule = require('../api/_sheets');
const reservas = require('../api/reservas');
const disponibilidade = require('../api/disponibilidade');
const cafe = require('../api/cafe');

function responseRecorder() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; },
  };
}

test('Google Sheets reports a controlled configuration error', () => {
  const previousEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const previousKey = process.env.GOOGLE_PRIVATE_KEY;
  delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  delete process.env.GOOGLE_PRIVATE_KEY;
  assert.throws(() => sheetsModule.getSheets(), error => {
    assert.equal(error.status, 503);
    assert.equal(error.code, 'SHEETS_NOT_CONFIGURED');
    return true;
  });
  if (previousEmail) process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = previousEmail;
  if (previousKey) process.env.GOOGLE_PRIVATE_KEY = previousKey;
});

test('reservations reject unidentified access before reading a sheet', async () => {
  const req = { method: 'GET', headers: {}, query: {}, body: undefined };
  const res = responseRecorder();
  await reservas(req, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, 'EMAIL_REQUIRED');
});

test('availability rejects an invalid date range', async () => {
  const req = { method: 'GET', headers: { 'x-user-email': 'admin@example.com' }, query: { checkin: '2026-08-12', checkout: '2026-08-11' } };
  const res = responseRecorder();
  await disponibilidade(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, 'INVALID_DATE_RANGE');
});

test('date parsing supports ISO and Brazilian formats', () => {
  assert.equal(disponibilidade._test.parseDateBR('13/08/2026').toISOString(), '2026-08-13T00:00:00.000Z');
  assert.equal(cafe._test.parseDateBR('2026-08-13').toISOString(), '2026-08-13T00:00:00.000Z');
  assert.equal(reservas._test.parseDate('14/08/2026').toISOString(), '2026-08-14T00:00:00.000Z');
});
