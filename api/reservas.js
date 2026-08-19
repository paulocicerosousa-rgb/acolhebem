const { sheets, obterPlanilhaIdPorEmail } = require('./_sheets');

// 🧹 Função para remover acentos, espaços extras e padronizar o nome
function limparTexto(texto) {
  return String(texto || '')
    .normalize('NFD') // Separa as letras dos acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .replace(/\s+/g, ' ') // Transforma espaços duplos em um espaço só
    .trim()
    .toLowerCase();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-email');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 🌐 Captura o e-mail do hotel logado (via Header, Query String ou Body)
    const email = req.headers['x-user-email'] || req.query.email || (req.body && req.body.email);

    // 🧭 Roteamento inteligente: descobre qual planilha deve abrir
    const spreadsheetId = await obterPlanilhaIdPorEmail(email);

    // ==========================================
    // 1. LISTAR RESERVAS
    // ==========================================
    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Base de Reservas!A:R'
      });

      const rows = (response.data.values || []).slice(1);

      const reservas = rows
        .filter(r => r && r[1])
        .map((r, i) => ({
          id: r[0] || i + 1,
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
          telefone: r[16] || '',
          cidade: r[17] || ''
        }));

      return res.status(200).json({
        success: true,
        data: reservas
      });
    }

    // ==========================================
    // 2. CRIAR RESERVA
    // ==========================================
    if (req.method === 'POST') {
      const body = req.body;

      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Base de Reservas!A:A'
      });

      const nextId = (resp.data.values || []).length;
      const hoje = new Date().toLocaleDateString('pt-BR');

      const linha = [
        nextId,
        body.hospede || '',
        body.valorDiaria || '',
        body.valorEntrada || '',
        body.formaPagamento || '',
        body.valorTotal || '',
        body.tipoCama || '',
        body.quarto || '',
        body.adultos || '',
        body.criancas || '',
        body.observacoes || '',
        body.checkin || '',
        body.checkout || '',
        body.status || 'Reservado',
        hoje,
        '',
        body.telefone || '',
        body.cidade || ''
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Base de Reservas!A:R',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [linha]
        }
      });

      // ==========================================
      // MOTOR DO PROGRAMA DE RELACIONAMENTO
      // ==========================================
      
      // Lê todos os dados até a coluna J
      const respHospedes = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: 'Hospedes!A:J'
      });

      const hospedes = (respHospedes.data.values || []).slice(1);

      // 🧠 Busca inteligente ignorando acentos, maiúsculas e espaços duplos
      const linhaIndex = hospedes.findIndex(h =>
        limparTexto(h[1]) === limparTexto(body.hospede)
      );

      if (linhaIndex === -1) {
        // HÓSPEDE NOVO: Cadastra do zero com 1 hospedagem
        const novoHospedeId = hospedes.length + 1;

        await sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: 'Hospedes!A:H',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[
              novoHospedeId,
              body.hospede || '',
              body.telefone || '',
              body.cidade || '',
              '',     // Email
              hoje,   // DataCadastro
              1,      // TotalHospedagem (Inicia com 1)
              hoje    // UltimaHospedagem
            ]]
          }
        });
      } else {
        // HÓSPEDE RECORRENTE: Atualiza a contagem (+1)
        const h = hospedes[linhaIndex];
        const totalAnterior = parseInt(h[6]) || 0; // Coluna G
        const novoTotal = totalAnterior + 1;
        
        // Se a reserva nova enviou telefone ou cidade, aproveitamos para atualizar o cadastro dele
        const telefoneAtualizado = body.telefone || h[2] || '';
        const cidadeAtualizada = body.cidade || h[3] || '';

        await sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          // A linha no Sheets é o index + 2 (pois index começa em 0 e a Linha 1 é o cabeçalho)
          range: `Hospedes!A${linhaIndex + 2}:J${linhaIndex + 2}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[
              h[0] || '',             // ID 
              h[1] || '',             // Nome
              telefoneAtualizado,     // Telefone
              cidadeAtualizada,       // Cidade
              h[4] || '',             // Email
              h[5] || '',             // DataCadastro
              novoTotal,              // TotalHospedagem: Adiciona +1
              hoje,                   // UltimaHospedagem: Atualiza para a data de hoje
              h[8] || '',             // TotalGasto (preservado)
              h[9] || ''              // Categoria (preservada)
            ]]
          }
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Reserva criada!',
        id: nextId
      });
    }

    return res.status(405).json({
      error: 'Método não permitido'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno',
      details: error.message
    });
  }
};
