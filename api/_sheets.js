const { google } = require('googleapis');

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

// 🧭 ID da Planilha Master (a central de roteamento dos hotéis)
const MASTER_SPREADSHEET_ID = '1zqB7BXaihnwe5ZV8GMSCStmh8N-gsff9tdDSJ7OzFGk';

// 🗄️ ID padrão de contingência (sua planilha antiga, caso algo dê errado)
const SPREADSHEET_ID = '1s8MiGAt1v--AZBQd1vWxd17D7kHW9DQjWontwU64CPI';

/**
 * Função inteligente que vai à Planilha Master e descobre 
 * qual é o ID da planilha do hotel com base no e-mail logado.
 */
async function obterPlanilhaIdPorEmail(email) {
  if (!email) return SPREADSHEET_ID;
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_SPREADSHEET_ID,
      range: 'A2:C', // Busca os dados de Email, Nome e ID a partir da linha 2
    });

    const linhas = response.data.values;
    if (!linhas || linhas.length === 0) return SPREADSHEET_ID;

    // Procura a linha correspondente ao e-mail do usuário logado
    const linhaEncontrada = linhas.find(
      (linha) => linha[0] && linha[0].trim().toLowerCase() === email.trim().toLowerCase()
    );

    // Se encontrou o hotel, usa a planilha dele (Coluna C). Se não, usa a padrão.
    return linhaEncontrada && linhaEncontrada[2] ? linhaEncontrada[2] : SPREADSHEET_ID;
  } catch (error) {
    console.error('Erro ao consultar a Planilha Master:', error);
    return SPREADSHEET_ID;
  }
}

module.exports = { sheets, SPREADSHEET_ID, obterPlanilhaIdPorEmail };
