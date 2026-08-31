import test from 'node:test'; import assert from 'node:assert/strict'; import rules from '../lib/operational-rules.js';
test('transições válidas e inválidas',()=>{ assert.equal(rules.canTransition('Reservado','Confirmado'),true); assert.equal(rules.canTransition('Check-out','Check-in'),false); });
test('quarto bloqueado não é vendável',()=>assert.equal(rules.isRoomSellable(true),false));
test('métricas excluem canceladas',()=>assert.deepEqual(rules.calcMetrics([{status:'Confirmado'},{status:'Cancelado'}],2,300),{activeReservations:1,roomNights:2,revenue:300,adr:150,revpar:150}));
