# PIL-002 — Inventário operacional do Hotel Escola do IFCE

**Levantamento técnico:** 21 de agosto de 2026  
**Unidade:** Hotel Escola do IFCE — Guaramiranga  
**Modo:** somente leitura; nenhuma reserva ou configuração foi alterada.

## Inventário configurado na aplicação

| Item | Quantidade/valor | Evidência |
|---|---:|---|
| Quartos configurados | 20 | lista compartilhada pela interface e API |
| Numeração configurada | 1–12 e 14–21 | código atual da aplicação |
| Quarto 13 | não configurado | não aparece no seletor nem no mapa |
| Capacidade por quarto | não registrada | precisa confirmação da gestão |
| Tipo de cama por quarto | não registrado individualmente | a tela usa opções genéricas por reserva |
| Bloqueios técnicos | não registrados | não há cadastro persistente identificado |
| Reservas reais conhecidas | 2 | informação operacional fornecida pela equipe |

## Numeração atualmente configurada

`1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21`.

## Tipos de cama disponíveis no formulário

- 1 casal;
- 1 solteiro;
- 2 solteiros;
- 1 casal e 1 solteiro;
- 3 solteiros;
- 4 solteiros.

Essas opções são selecionadas na reserva, mas o sistema atual não comprova que cada opção corresponde ao inventário físico de cada quarto.

## Pendências para validação da gestão

1. confirmar se a unidade realmente possui 20 quartos operacionais;
2. confirmar se o quarto 13 não existe, está fora de operação ou foi omitido por engano;
3. informar capacidade máxima de adultos e crianças por quarto;
4. informar o tipo de cama real de cada quarto;
5. informar quartos atualmente bloqueados, em manutenção ou indisponíveis;
6. confirmar se há quartos ou leitos compartilhados não representados;
7. validar a correspondência das duas reservas reais com quarto e período, sem editar seus registros.

## Resultado do PIL-002

O levantamento técnico está concluído, mas o inventário físico ainda depende da confirmação da gestão do Hotel Escola. Até essa confirmação, não alterar a lista de quartos nem criar novas reservas baseadas em capacidade presumida.
