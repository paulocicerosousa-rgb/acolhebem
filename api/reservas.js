const { getSheets, SPREADSHEET_ID } = require('./_sheets');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sheets = await getSheets();

    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Base de Reservas!A:P',
      });
      const rows = (response.data.values || []).slice(1);
      const reservas = rows.filter(r => r && r[1]).map((r, i) => ({
        id: r[0] || i+1,
        hospede: r[1] || '',
        valorDiaria: r[2] || '',
        valorEntrada: r[3] || '',
        formaPagamento: r[4] || '',
        valorTotal: r[5] || '',
        tipoCama: r[6] || '',
        quarto: r[7] || '',
        adultos: r[8] || '',
        criancas: r[9] || '',
        observacoes: r[10] || '',
        checkin: r[11] || '',
        checkout: r[12] || '',
        status: r[13] || '',
        dataProposta: r[14] || '',
      }));
      return res.status(200).json({ success: true, data: reservas });
    }

    if (req.method === 'POST') {
      const body = req.body;
      const resp2 = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Base de Reservas!A:A',
      });
      const nextId = (resp2.data.values || []).length;
      const hoje = new Date().toLocaleDateString('pt-BR');
      const linha = [
        nextId, body.hospede||'', body.valorDiaria||'',
        body.valorEntrada||'', body.formaPagamento||'',
        body.valorTotal||'', body.tipoCama||'',
        body.quarto||'', body.adultos||'',
        body.criancas||'', body.observacoes||'',
        body.checkin||'', body.checkout||'',
        body.status||'Reservado', hoje, '',
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Base de Reservas!A:P',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [linha] },
      });
      return res.status(201).json({ success: true, message: 'Reserva criada!', id: nextId });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
};
