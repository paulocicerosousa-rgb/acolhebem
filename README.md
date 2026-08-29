# AcolheBem

Plataforma de gestão hoteleira publicada na Vercel e integrada ao Google Sheets.

## Configuração obrigatória na Vercel

Cadastre em **Settings > Environment Variables** para Production, Preview e Development:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` — chave completa, incluindo `BEGIN/END PRIVATE KEY`; quebras de linha podem ser salvas como `\n`
- `MASTER_SPREADSHEET_ID` (opcional enquanto o ID padrão for usado)
- `SPREADSHEET_ID` (opcional enquanto o ID padrão for usado)

Compartilhe a planilha master e cada planilha de hotel com o e-mail da conta de serviço como **Editor**. Nunca salve a chave privada no GitHub.

## Verificação local

```powershell
npm install
npm test
npm run check
```

Sem as credenciais, as APIs retornam `503 SHEETS_NOT_CONFIGURED` de forma controlada. Sem o cabeçalho de identificação atual, retornam `401 EMAIL_REQUIRED`.

## Escopo desta estabilização

- inicialização segura e tardia do cliente Google Sheets;
- erros HTTP padronizados;
- validação de reservas e conflitos no backend;
- IDs incrementais baseados no maior ID existente;
- correção do envio de telefone e cidade;
- correção do intervalo do café da manhã no dia do check-out;
- interface responsiva básica, logout local e ocultação de módulos inacabados.

A autenticação por sessão e os perfis de hotel serão implementados em uma etapa posterior.
# Piloto atual

O primeiro ambiente de validação é o Hotel Escola do IFCE em Guaramiranga. Consulte [PILOTO_HOTEL_ESCOLA_IFCE.md](./PILOTO_HOTEL_ESCOLA_IFCE.md) para o escopo operacional, responsáveis e critérios do piloto.
