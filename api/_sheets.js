const { google } = require('googleapis');

const DEFAULT_MASTER_SPREADSHEET_ID = '1zqB7BXaihnwe5ZV8GMSCStmh8N-gsff9tdDSJ7OzFGk';
const DEFAULT_SPREADSHEET_ID = '1s8MiGAt1v--AZBQd1vWxd17D7kHW9DQjWontwU64CPI';

const MASTER_SPREADSHEET_ID = process.env.MASTER_SPREADSHEET_ID || DEFAULT_MASTER_SPREADSHEET_ID;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;

class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

let sheetsClient;

function getSheets() {
  if (sheetsClient) return sheetsClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new AppError(
      503,
      'SHEETS_NOT_CONFIGURED',
      'A integração com o Google Sheets não está configurada.'
    );
  }

  const privateKey = rawKey.replace(/\\n/g, '\n');
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new AppError(
      503,
      'SHEETS_INVALID_PRIVATE_KEY',
      'A chave privada do Google Sheets está em formato inválido.'
    );
  }

  const auth = new google.auth.JWT(
    email,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

function getRequestEmail(req) {
  const value = req.headers['x-user-email'] || req.query.email || (req.body && req.body.email);
  const email = String(value || '').trim().toLowerCase();

  if (!email) {
    throw new AppError(401, 'EMAIL_REQUIRED', 'Acesso não identificado. Entre novamente.');
  }

  return email;
}

async function obterPlanilhaIdPorEmail(email) {
  const sheets = getSheets();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_SPREADSHEET_ID,
      range: 'A2:C',
    });

    const linhas = response.data.values || [];
    const linhaEncontrada = linhas.find(
      linha => String(linha[0] || '').trim().toLowerCase() === email
    );

    // Mantém o comportamento administrativo atual até a criação dos perfis.
    return linhaEncontrada && linhaEncontrada[2]
      ? String(linhaEncontrada[2]).trim()
      : SPREADSHEET_ID;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Falha ao consultar a planilha master', {
      code: error.code,
      message: error.message,
    });
    throw new AppError(
      503,
      'MASTER_SHEET_UNAVAILABLE',
      'Não foi possível identificar a planilha do hotel.'
    );
  }
}

function sendError(res, error) {
  const status = error instanceof AppError ? error.status : 500;
  const code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
  const message = error instanceof AppError
    ? error.message
    : 'Ocorreu um erro interno. Tente novamente.';

  if (!(error instanceof AppError)) {
    console.error('Erro não tratado na API', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
  }

  return res.status(status).json({
    success: false,
    error: message,
    code,
  });
}

function configureResponse(req, res, methods) {
  res.setHeader('Access-Control-Allow-Origin', 'https://acolhebem-delta.vercel.app');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', `${methods.join(', ')}, OPTIONS`);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = {
  AppError,
  getSheets,
  getRequestEmail,
  obterPlanilhaIdPorEmail,
  sendError,
  configureResponse,
  SPREADSHEET_ID,
  MASTER_SPREADSHEET_ID,
};
