const {
  AppError, configureResponse, getRequestEmail, getSheets,
  obterPlanilhaIdPorEmail, sendError,
} = require('./_sheets');

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
    const queryDate = parseDateBR(req.query.data);
    if (!queryDate) throw new AppError(400, 'INVALID_DATE', 'Informe uma data válida.');
    const email = getRequestEmail(req);
    const spreadsheetId = await obterPlanilhaIdPorEmail(email);
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Base de Reservas!A:N' });
    const guests = (response.data.values || []).slice(1).filter(row => {
      if (!row[1] || ['Expirado', 'Cancelado'].includes(String(row[13] || '').trim())) return false;
      const start = parseDateBR(row[11]);
      const end = parseDateBR(row[12]);
      return start && end && start <= queryDate && end > queryDate;
    }).map(row => ({
      hospede: row[1], quarto: row[7], adultos: Number.parseInt(row[8], 10) || 0,
      criancas: Number.parseInt(row[9], 10) || 0, status: row[13],
    })).sort((a, b) => Number(a.quarto) - Number(b.quarto));
    const totalAdultos = guests.reduce((sum, guest) => sum + guest.adultos, 0);
    const totalCriancas = guests.reduce((sum, guest) => sum + guest.criancas, 0);
    return res.status(200).json({
      success: true, data: req.query.data,
      resumo: { totalAdultos, totalCriancas, totalGeral: totalAdultos + totalCriancas, totalQuartos: guests.length },
      hospedes: guests,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports._test = { parseDateBR };
