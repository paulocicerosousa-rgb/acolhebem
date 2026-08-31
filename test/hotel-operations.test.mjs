import test from 'node:test'; import assert from 'node:assert/strict'; import ops from '../lib/hotel-operations.js';
test('bloqueio técnico torna quarto não vendável',()=>assert.equal(ops.roomBlock('101','manutenção').sellable,false));
test('folio soma lançamentos',()=>assert.equal(ops.folioTotal([{amount:100},{amount:'25.50'}]),125.5));
test('mensagem tem chave idempotente',()=>assert.equal(ops.messageKey('R-1','confirmacao'),'R-1:confirmacao'));
