const {
  AppError, configureResponse, getRequestEmail, getSheets,
  obterPlanilhaIdPorEmail, sendError,
} = require('./_sheets');

module.exports = async (req, res) => {
  if (configureResponse(req, res, ['GET', 'POST', 'PUT'])) return;
  try {
    if (!['GET', 'POST', 'PUT'].includes(req.method)) {
      throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
    }
    const email = getRequestEmail(req);
    const spreadsheetId = await obterPlanilhaIdPorEmail(email);
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Hospedes!A:G' });
    const allRows = response.data.values || [];
    const rows = allRows.slice(1);

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: rows.filter(row => row && row[1]).map((row, index) => ({
          id: row[0] || index + 1,
          nome: row[1] || '', telefone: row[2] || '', cidade: row[3] || '',
          email: row[4] || '', dataCadastro: row[5] || '', totalHospedagem: row[6] || '0',
        })),
      });
    }

    const body = req.body || {};
    if (!String(body.nome || '').trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Nome do hóspede é obrigatório.');
    }

    if (req.method === 'POST') {
      const ids = rows.map(row => Number.parseInt(row[0], 10)).filter(Number.isFinite);
      const nextId = ids.length ? Math.max(...ids) + 1 : 1;
      const today = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Fortaleza' }).format(new Date());
      await sheets.spreadsheets.values.append({
        spreadsheetId, range: 'Hospedes!A:G', valueInputOption: 'USER_ENTERED',
        resource: { values: [[nextId, body.nome, body.telefone || '', body.cidade || '', body.email || '', today, 1]] },
      });
      return res.status(201).json({ success: true, message: 'Hóspede cadastrado.', id: nextId });
    }

    if (!body.id) throw new AppError(400, 'VALIDATION_ERROR', 'ID do hóspede é obrigatório.');
    const rowIndex = allRows.findIndex(row => String(row[0]) === String(body.id));
    if (rowIndex < 1) throw new AppError(404, 'GUEST_NOT_FOUND', 'Hóspede não encontrado.');
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: `Hospedes!A${rowIndex + 1}:G${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[body.id, body.nome, body.telefone || '', body.cidade || '', body.email || allRows[rowIndex][4] || '', allRows[rowIndex][5] || '', allRows[rowIndex][6] || '0']] },
    });
    return res.status(200).json({ success: true, message: 'Hóspede atualizado.' });
  } catch (error) {
    return sendError(res, error);
  }
};
