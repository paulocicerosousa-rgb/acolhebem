const { getSheets, SPREADSHEET_ID } = require('./_sheets');

const RANGE = 'Base de Reservas!A:P';

// Colunas da planilha (0-indexed)
// A=ID, B=HÓSPEDE, C=VALOR DIÁRIA, D=VALOR ENTRADA, E=FORMA PAGAMENTO,
// F=VALOR TOTAL, G=TIPO CAMA, H=QUARTO, I=ADULTOS, J=CRIANÇAS,
// K=OBSERVAÇÕES, L=CHECK-IN, M=CHECK-OUT, N=STATUS,
// O=DATA PROPOSTA, P=STATUS BLOQUEIO

function rowToReserva(row, index) {
  return {
    id: row[0] || index + 1,
    hospede: row[1] || '',
    valorDiaria: row[2] || '',
    valorEntrada: row[3] || '',
    formaPagamento: row[4] || '',
    valorTotal: row[5] || '',
    tipoCama: row[6] || '',
    quarto: row[7] || '',
    adultos: row[8] || '',
    criancas: row[9] || '',
    observacoes: row[10] || '',
    checkin: row[11] || '',
    checkout: row[12] || '',
    status: row[13] || '',
    dataProposta: row[14] || '',
    statusBloqueio: row[15] || '',
  };
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sheets = await getSheets();

    // GET - Listar todas as reservas
    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      });

      const rows = response.data.values || [];
      // Pula a linha 1 (cabeçalho)
      const reservas = rows.slice(1)
        .filter(row => row && row[1]) // só linhas com hóspede
        .map((row, i) => rowToReserva(row, i));

      return res.status(200).json({ success: true, data: reservas });
    }

    // POST - Criar nova reserva
    if (req.method === 'POST') {
      const body = req.body;

      // Busca o próximo ID
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Base de Reservas!A:A',
      });
      const rows = response.data.values || [];
      const nextId = rows.length; // linha 1 = cabeçalho, então próximo ID = total de linhas

      const hoje = new Date().toLocaleDateString('pt-BR');

      const novaLinha = [
        nextId,                          // A - ID
        body.hospede || '',              // B - HÓSPEDE
        body.valorDiaria || '',          // C - VALOR DIÁRIA
        body.valorEntrada || '',         // D - VALOR ENTRADA
        body.formaPagamento || '',       // E - FORMA PAGAMENTO
        body.valorTotal || '',           // F - VALOR TOTAL
        body.tipoCama || '',             // G - TIPO CAMA
        body.quarto || '',               // H - QUARTO
        body.adultos || '',              // I - ADULTOS
        body.criancas || '',             // J - CRIANÇAS
        body.observacoes || '',          // K - OBSERVAÇÕES
        body.checkin || '',              // L - CHECK-IN
        body.checkout || '',             // M - CHECK-OUT
        body.status || 'Reservado',      // N - STATUS
        hoje,                            // O - DATA PROPOSTA
        '',                              // P - STATUS BLOQUEIO
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Base de Reservas!A:P',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [novaLinha] },
      });

      return res.status(201).json({ success: true, message: 'Reserva criada com sucesso!', id: nextId });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
};
