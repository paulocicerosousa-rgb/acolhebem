function roomBlock(room, reason, until) { return { room: String(room), reason: String(reason || 'Bloqueio técnico'), until: until || null, sellable: false }; }
function folioTotal(items) { return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0); }
function messageKey(reservationId, template) { return `${reservationId}:${template}`; }
module.exports = { roomBlock, folioTotal, messageKey };
