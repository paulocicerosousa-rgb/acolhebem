const STATES = Object.freeze(['Reservado','Confirmado','Check-in','Check-out','No-show','Cancelado']);
const TRANSITIONS = {
  Reservado: ['Confirmado','Cancelado'], Confirmado: ['Check-in','Cancelado'],
  'Check-in': ['Check-out'], 'Check-out': [], 'No-show': [], Cancelado: []
};
function canTransition(from, to) { return STATES.includes(from) && TRANSITIONS[from].includes(to); }
function isRoomSellable(blocked) { return blocked !== true; }
function calcMetrics(reservations, roomNights, revenue) {
  const active = reservations.filter(r => !['Cancelado','No-show'].includes(r.status));
  const adr = roomNights ? revenue / roomNights : 0;
  return { activeReservations: active.length, roomNights, revenue, adr, revpar: roomNights ? revenue / roomNights : 0 };
}
module.exports = { STATES, canTransition, isRoomSellable, calcMetrics };
