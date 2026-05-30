const { getSheets, SPREADSHEET_ID } = require('./_sheets');

const QUARTOS = [1,2,3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21];

function parseDateBR(str) {
  if (!str) return null;
  // Aceita DD/MM/AAAA ou AAAA-MM-DD
  if (str.includes('/')) {
    const [d, m, y] = str.split('/');
    return new Date(`${y}-${m}-${d}`);
  }
  return new Date(str);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { checkin, checkout } = req.query;

    if (!checkin || !checkout) {
      return res.status(400).json({ error: 'Informe checkin e checkout' });
    }

    const dtCheckin  = new Date(checkin);
    const dtCheckout = new Date(checkout);

    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Base de Reservas!A:N',
    });

    const rows = (response.data.values || []).slice(1);
    const reservasAtivas = rows.filter(r => r[1] && r[13] !== 'Expirado');

    const resultado = QUARTOS.map(quarto => {
      const conflitos = reservasAtivas.filter(r => {
        if (String(r[7]).trim() !== String(quarto)) return false;
        const ci = parseDateBR(r[11]);
        const co = parseDateBR(r[12]);
        if (!ci || !co) return false;
        return ci < dtCheckout && co > dtCheckin;
      });

      if (conflitos.length === 0) {
        return { quarto, status: 'LIVRE', hospede: null };
      }

      const c = conflitos[0];
      return {
        quarto,
        status: 'OCUPADO',
        hospede: c[1],
        checkin: c[11],
        checkout: c[12],
        tipoCama: c[6],
        adultos: c[8],
        statusReserva: c[13],
      };
    });

    const livres   = resultado.filter(r => r.status === 'LIVRE').length;
    const ocupados = resultado.filter(r => r.status === 'OCUPADO').length;

    return res.status(200).json({
      success: true,
      periodo: { checkin, checkout },
      resumo: { livres, ocupados, total: QUARTOS.length },
      quartos: resultado,
    });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
};
