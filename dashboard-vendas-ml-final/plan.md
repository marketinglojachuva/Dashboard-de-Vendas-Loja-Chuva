# Plano — Dashboard comparativo de vendas do Mercado Livre

## Diagnóstico

O projeto já possui React + Vite + Tailwind, SheetJS e persistência em IndexedDB. A importação existente lê a primeira aba, mas depende de nomes genéricos, calcula estatísticas por linha e ainda não alimenta o dashboard; a página inicial usa dados fictícios e o histórico não diferencia períodos.

## Implementação

- Criar tipos e utilitários para normalizar cabeçalhos, converter números brasileiros, ler `.xlsx`/`.xls`/`.csv`, agrupar por anúncio e calcular variação percentual.
- Evoluir o modal de importação para receber o período (`Semana atual` ou `Período anterior`) e salvar os dados normalizados no histórico.
- Substituir o dashboard fictício por KPIs, estados vazios e tabela responsiva com destaque automático para quedas.
- Manter o histórico persistente e a compatibilidade visual com Tailwind, adicionando o campo do período sem exigir backend.

## Design

- **Direção:** painel operacional editorial, com fundo azul-marinho, superfícies claras e acentos âmbar/verde/vermelho para decisões rápidas.
- **Princípios:** hierarquia forte, densidade informacional controlada, leitura em escaneamento e estados de erro acionáveis.
- **Interação:** upload por clique ou drag-and-drop; feedback imediato por toast; filtros e tabela legíveis em telas menores.
- **Tipografia:** sistema sans nativo, títulos compactos e números de KPI com peso alto.

## Estrutura

- `src/types/sales.ts`: contratos da análise.
- `src/utils/sales.ts`: parsing, normalização, agrupamento e comparação.
- `src/components/ExcelImportDialog.tsx`: upload por período.
- `src/pages/Home.tsx`: dashboard, KPIs e comparação.
- `src/hooks/useImportHistory.ts`: armazenamento local das importações.
