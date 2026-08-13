const {
  AppError,
  configureResponse,
  getRequestEmail,
  getSheets,
  obterPlanilhaIdPorEmail,
  sendError,
} = require('./_sheets');

function parseDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const parts = text.includes('/') ? text.split('/').reverse() : text.split('-');
  if (parts.length !== 3) return null;
  const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  return Number.isNaN(date.getTime()) ? null : date;
}

function requireText(body, field, label) {
  const value = String(body[field] || '').trim();
  if (!value) throw new AppError(400, 'VALIDATION_ERROR', `${label} é obrigatório.`);
  return value;
}

function mapReserva(row, index) {
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
    telefone: row[16] || '',
    cidade: row[17] || '',
  };
}

module.exports = async (req, res) => {
  if (configureResponse(req, res, ['GET', 'POST'])) return;

  try {
    if (!['GET', 'POST'].includes(req.method)) {
      throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Método não permitido.');
    }

    const email = getRequestEmail(req);
    const spreadsheetId = await obterPlanilhaIdPorEmail(email);
    const sheets = getSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Base de Reservas!A:R',
    });
    const allRows = response.data.values || [];
    const rows = allRows.slice(1);

    if (req.method === 'GET') {
      const reservas = rows
        .filter(row => row && row[1])
        .map(mapReserva);

      return res.status(200).json({ success: true, data: reservas });
    }

    const body = req.body || {};
    const hospede = requireText(body, 'hospede', 'Nome do hóspede');
    const telefone = requireText(body, 'telefone', 'Telefone');
    const quarto = requireText(body, 'quarto', 'Quarto');
    const checkin = requireText(body, 'checkin', 'Check-in');
    const checkout = requireText(body, 'checkout', 'Check-out');
    const dtCheckin = parseDate(checkin);
    const dtCheckout = parseDate(checkout);

    if (!dtCheckin || !dtCheckout || dtCheckout <= dtCheckin) {
      throw new AppError(400, 'INVALID_DATE_RANGE', 'O check-out deve ser posterior ao check-in.');
    }

    const conflict = rows.find(row => {
      if (!row[1] || String(row[7]).trim() !== quarto) return false;
      if (['Expirado', 'Cancelado'].includes(String(row[13] || '').trim())) return false;
      const existingCheckin = parseDate(row[11]);
      const existingCheckout = parseDate(row[12]);
      return existingCheckin && existingCheckout
        && existingCheckin < dtCheckout
        && existingCheckout > dtCheckin;
    });

    if (conflict) {
      throw new AppError(409, 'ROOM_ALREADY_BOOKED', `O quarto ${quarto} já está reservado nesse período.`);
    }

    const numericIds = rows
      .map(row => Number.parseInt(row[0], 10))
      .filter(Number.isFinite);
    const nextId = numericIds.length ? Math.max(...numericIds) + 1 : 1;
    const today = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Fortaleza' }).format(new Date());

    const row = [
      nextId,
      hospede,
      body.valorDiaria || '',
      body.valorEntrada || '',
      body.formaPagamento || '',
      body.valorTotal || '',
      body.tipoCama || '',
      quarto,
      body.adultos || '',
      body.criancas || '',
      body.observacoes || '',
      checkin,
      checkout,
      body.status || 'Reservado',
      today,
      '',
      telefone,
      body.cidade || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Base de Reservas!A:R',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] },
    });

    // O cadastro de hóspede é auxiliar: uma falha nele não desfaz a reserva criada.
    try {
      const guestResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Hospedes!A:G',
      });
      const guestRows = (guestResponse.data.values || []).slice(1);
      const exists = guestRows.some(
        guest => String(guest[1] || '').trim().toLowerCase() === hospede.toLowerCase()
      );

      if (!exists) {
        const guestIds = guestRows.map(r => Number.parseInt(r[0], 10)).filter(Number.isFinite);
        const guestId = guestIds.length ? Math.max(...guestIds) + 1 : 1;
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Hospedes!A:G',
          valueInputOption: 'USER_ENTERED',
          resource: { values: [[guestId, hospede, telefone, body.cidade || '', '', today, 1]] },
        });
      }
    } catch (guestError) {
      console.error('Reserva criada, mas o cadastro de hóspede falhou', {
        reservationId: nextId,
        message: guestError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Reserva criada com sucesso.',
      id: nextId,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports._test = { parseDate, mapReserva };
