# Piloto operacional — Hotel Escola do IFCE em Guaramiranga

**Status:** ativo  
**Início registrado:** 19 de agosto de 2026  
**Finalidade:** validar as funcionalidades do AcolheBem em operação real antes da comercialização.

**Marco operacional atual:** existem duas reservas reais registradas na plataforma. Elas devem ser preservadas, reconciliadas com a fonte operacional e usadas apenas como referência de validação não destrutiva.

## Regra de continuidade operacional

Como a plataforma é utilizada durante todo o dia, nenhuma modificação pode ser publicada diretamente sem validação. Toda mudança deve seguir este mínimo:

1. reproduzir o comportamento atual e registrar o caso de teste;
2. testar a alteração localmente ou em staging, sem dados reais;
3. validar os fluxos críticos: disponibilidade, reservas, hóspedes e operação do dia;
4. publicar em janela controlada, com backup/exportação recente;
5. monitorar após a publicação e manter um plano de reversão;
6. interromper a implantação se houver risco para reservas ou atendimento.

Alterações emergenciais devem ser pequenas, documentadas e revisadas assim que a operação estiver estabilizada.

## Escopo do PIL-001

O Hotel Escola do IFCE em Guaramiranga é a unidade piloto oficial do projeto. Esta formalização é operacional e não cria, nesta fase, login específico de hotel, arquitetura multi-hotel ou separação técnica de dados.

## Ambiente

- aplicação: AcolheBem;
- unidade: Hotel Escola do IFCE — Guaramiranga;
- uso: reservas, disponibilidade, hóspedes, check-in/out, governança, manutenção, café e relatórios;
- armazenamento atual: Google Sheets;
- evolução planejada: PostgreSQL para apoiar as funcionalidades, sem alterar o fluxo operacional sem validação.

## Responsáveis operacionais

| Papel | Responsabilidade |
|---|---|
| Gestão do Hotel Escola | validar regras e prioridades do piloto |
| Recepção | operar reservas, hóspedes e check-in/out; registrar ocorrências |
| Governança/manutenção | atualizar status, tarefas e bloqueios operacionais |
| Equipe AcolheBem | corrigir falhas, acompanhar métricas e publicar melhorias |

## Critério de conclusão

O PIL-001 está concluído quando a gestão confirmar este registro, os responsáveis forem comunicados e o diário operacional do piloto estiver aberto para registrar uso e incidentes desde 19/08/2026.

## Fora do escopo desta etapa

- criação de contas ou login para hotéis;
- separação de dados entre hotéis;
- RBAC e arquitetura SaaS comercial;
- comercialização ou implantação em outros hotéis.
