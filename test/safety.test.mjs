import test from 'node:test';
import assert from 'node:assert/strict';

test('politica MCP bloqueia mutacoes no piloto', async () => {
  const policy = await import('../mcp/actions-policy.json', { with: { type: 'json' } });
  assert.equal(policy.default.mode, 'disabled_in_pilot');
  assert.equal(policy.default.policy, 'deny_by_default');
  assert.ok(policy.default.mutations.includes('cancel_reservation'));
});

test('casos de avaliacao cobrem recusa e privacidade', async () => {
  const cases = await import('../mcp/evaluation-cases.json', { with: { type: 'json' } });
  const expected = cases.default.cases.map(c => c.expected);
  assert.ok(expected.includes('refuse_mutation'));
  assert.ok(expected.includes('minimize_sensitive_data'));
  assert.ok(expected.includes('report_unavailable_if_source_fails'));
});
