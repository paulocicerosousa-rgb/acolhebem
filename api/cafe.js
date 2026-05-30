const { getSheets, SPREADSHEET_ID } = require('./_sheets');

function parseDateBR(str) {
  if (!str) return null;
  if (str.includes('/')) {
    const [d,m,y] = str.split('/');
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
    const { data } = req.query;
    if (!data) return res.status(400).json({ error: 'Informe a data' });

    const dtConsulta = new Date(data);
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Base de Reservas!A:N',
    });

    const rows = (response.data.values || []).slice(1);
    const hospedes = rows
      .filter(r => {
        if (!r[1]) return false;
        if (r[13] === 'Expirado') return false;
        const ci = parseDateBR(r[11]);
        const co = parseDateBR(r[12]);
        if (!ci || !co) return false;
        return ci < dtConsulta && co >= dtConsulta;
      })
      .map(r => ({
        hospede: r[1],
        quarto: r[7],
        adultos: parseInt(r[8]) || 0,
        criancas: parseInt(r[9]) || 0,
        status: r[13],
      }))
      .sort((a,b) => Number(a.quarto) - Number(b.quarto));

    const totalAdultos = hospedes.reduce((s,h) => s+h.adultos, 0);
    const totalCriancas = hospedes.reduce((s,h) => s+h.criancas, 0);

    return res.status(200).json({
      success: true,
      data,
      resumo: {
        totalAdultos,
        totalCriancas,
        totalGeral: totalAdultos + totalCriancas,
        totalQuartos: hospedes.length,
      },
      hospedes,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
};
