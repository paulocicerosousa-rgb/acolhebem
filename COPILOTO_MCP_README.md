# Copiloto MCP (somente leitura)

Esta versão prepara o diferencial do AcolheBem sem alterar a operação do Hotel Escola.

## Contrato inicial

- Consultas permitidas: disponibilidade, reservas do período, chegadas/saídas do dia e indicadores de governança.
- Operações de escrita, cancelamento, alteração de reserva e acesso a credenciais são proibidas.
- Respostas devem informar a data/hora de atualização e indicar quando a API estiver indisponível; nunca inferir quarto livre em caso de falha.
- O conector deve usar o mesmo `x-user-email` já exigido pela API e registrar auditoria sem armazenar dados sensíveis além do necessário.

## Próxima implementação segura

Publicar um endpoint MCP separado, com ferramentas `consultar_reservas`, `consultar_disponibilidade` e `resumo_governanca`, protegido por chave de serviço e limitado a GET. A integração com modelo/LLM só deve ser ativada após testes com dados fictícios e aceite da recepção.

