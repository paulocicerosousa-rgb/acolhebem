const { sheets, obterPlanilhaIdPorEmail } = require('./_sheets');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const email = req.headers['x-user-email'] || req.query.email || (req.body && req.body.email);
    const spreadsheetId = await obterPlanilhaIdPorEmail(email);

    // ==========================================
    // 1. LISTAR OCORRÊNCIAS (GET)
    // ==========================================
    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Logbook!A:D'
      });

      const rows = (response.data.values || []).slice(1);

      const ocorrencias = rows
        .filter(r => r && r[3]) // Filtra se tiver ocorrência
        .map((r, i) => ({
          id: r[0] || i + 1,
          dataHora: r[1] || '',
          recepconista: r[2] || '',
          ocorrencia: r[3] || ''
        }))
        .reverse(); // Mostra as mais recentes primeiro

      return res.status(200).json({
        success: true,
        data: ocorrencias
      });
    }

    // ==========================================
    // 2. REGISTRAR OCORRÊNCIA (POST)
    // ==========================================
    if (req.method === 'POST') {
      const body = req.body;

      if (!body.ocorrencia) {
        return res.status(400).json({ error: 'Informe a ocorrência' });
      }

      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Logbook!A:A'
      });

      const nextId = (resp.data.values || []).length;
      const agora = new Date().toLocaleString('pt-BR');

      const linha = [
        nextId,
        agora,
        body.recepcionista || 'Recepção',
        body.ocorrencia || ''
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Logbook!A:D',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [linha]
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Ocorrência registrada com sucesso!',
        id: nextId
      });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno',
      details: error.message
    });
  }
};
