function overlaps(checkin, checkout, existingCheckin, existingCheckout) {
  const start = new Date(checkin);
  const end = new Date(checkout);
  const existingStart = new Date(existingCheckin);
  const existingEnd = new Date(existingCheckout);
  return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && Number.isFinite(existingStart.getTime()) && Number.isFinite(existingEnd.getTime()) && start < existingEnd && existingStart < end;
}

function validStay(checkin, checkout) {
  const start = new Date(checkin);
  const end = new Date(checkout);
  return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && start < end;
}

module.exports = { overlaps, validStay };
