const {
  AppError, configureResponse, getRequestEmail, getSheets,
  obterPlanilhaIdPorEmail, sendError,
} = require('./_sheets');

const QUARTOS = [1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21];

function parseDateBR(value) {
  if (!value) return null;
  const text = String(value).trim();
  const parts = text.includes('/') ? text.split('/').reverse() : text.split('-');
  if (parts.length !== 3) return null;
  const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  return Number.isNaN(date.getTime()) ? null : date;
}

module.exports = async (req, res) => {
  if (configureResponse(req, res, ['GET'])) return;
  try {
    if (req.method !== 'GET') throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
    const { checkin, checkout } = req.query;
    const dtCheckin = parseDateBR(checkin);
    const dtCheckout = parseDateBR(checkout);
    if (!dtCheckin || !dtCheckout || dtCheckout <= dtCheckin) {
      throw new AppError(400, 'INVALID_DATE_RANGE', 'O check-out deve ser posterior ao check-in.');
    }
    const email = getRequestEmail(req);
    const spreadsheetId = await obterPlanilhaIdPorEmail(email);
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Base de Reservas!A:N' });
    const rows = (response.data.values || []).slice(1).filter(row => row[1] && !['Expirado', 'Cancelado'].includes(String(row[13] || '').trim()));
    const quartos = QUARTOS.map(quarto => {
      const conflict = rows.find(row => {
        if (String(row[7]).trim() !== String(quarto)) return false;
        const start = parseDateBR(row[11]);
        const end = parseDateBR(row[12]);
        return start && end && start < dtCheckout && end > dtCheckin;
      });
      return conflict ? {
        quarto, status: 'OCUPADO', hospede: conflict[1], checkin: conflict[11],
        checkout: conflict[12], tipoCama: conflict[6], adultos: conflict[8], statusReserva: conflict[13],
      } : { quarto, status: 'LIVRE' };
    });
    return res.status(200).json({
      success: true,
      resumo: { livres: quartos.filter(q => q.status === 'LIVRE').length, ocupados: quartos.filter(q => q.status === 'OCUPADO').length, total: quartos.length },
      quartos,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports._test = { parseDateBR };
