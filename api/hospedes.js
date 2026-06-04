const { getSheets, SPREADSHEET_ID } = require('./_sheets');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sheets = await getSheets();

    // =========================
    // LISTAR HÓSPEDES
    // =========================
    if (req.method === 'GET') {

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Hospedes!A:G',
      });

      const rows = (response.data.values || []).slice(1);

      const hospedes = rows.map((r, i) => ({
        id: r[0] || i + 1,
        nome: r[1] || '',
        telefone: r[2] || '',
        cidade: r[3] || '',
        email: r[4] || '',
        dataCadastro: r[5] || '',
        totalHospedagem: r[6] || '0'
      }));

      return res.status(200).json({
        success: true,
        data: hospedes
      });
    }

    // =========================
    // CADASTRAR HÓSPEDE
    // =========================
    if (req.method === 'POST') {

      const body = req.body;

      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Hospedes!A:A',
      });

      const nextId = (resp.data.values || []).length;

      const hoje = new Date().toLocaleDateString('pt-BR');

      const linha = [
        nextId,
        body.nome || '',
        body.telefone || '',
        body.cidade || '',
        body.email || '',
        hoje,
        1
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Hospedes!A:G',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [linha]
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Hóspede cadastrado!'
      });
    }

    // =========================
    // EDITAR HÓSPEDE
    // =========================
    if (req.method === 'PUT') {

      const body = req.body;

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Hospedes!A:G',
      });

      const rows = response.data.values || [];

      const linhaIndex = rows.findIndex(
        row => String(row[0]) === String(body.id)
      );

      if (linhaIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Hóspede não encontrado'
        });
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Hospedes!A${linhaIndex + 1}:G${linhaIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            body.id,
            body.nome || '',
            body.telefone || '',
            body.cidade || '',
            body.email || '',
            rows[linhaIndex][5] || '',
            rows[linhaIndex][6] || '0'
          ]]
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Hóspede atualizado com sucesso!'
      });
    }

    return res.status(405).json({
      error: 'Método não permitido'
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }
};
