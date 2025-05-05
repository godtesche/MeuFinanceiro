============================================================
SISTEMA DE CONTROLE FINANCEIRO PESSOAL
============================================================

Descrição:
-----------
Este é um sistema completo de controle financeiro pessoal, desenvolvido em HTML, CSS e JavaScript puro. Com ele, é possível gerenciar contas bancárias, lançar movimentações financeiras, controlar investimentos e empréstimos, registrar impostos pagos e acompanhar um resumo geral das finanças.

Funcionalidades:
-----------------
- Cadastro de Bancos:
  Permite adicionar bancos com saldos iniciais. Os saldos são atualizados automaticamente conforme os lançamentos.

- Movimentações Financeiras:
  Registre créditos e débitos com data, valor, descrição, categoria e banco associado.

- Investimentos:
  Controle seus investimentos, separando por tipo (ex: Tesouro Direto, Poupança, etc.).

- Empréstimos:
  Registre empréstimos realizados a outras pessoas. Ao marcar como "Pago", o sistema gera automaticamente um crédito na conta principal.

- Pagamento de Impostos:
  Controle de pagamentos de DAS, IR e outros tributos, com atalhos para emissão de nota fiscal e sites oficiais como NFSe, Regularize e Gov.br.

- Dashboard de Saldos:
  Visualização em tempo real dos seguintes saldos:
    • Saldo da conta principal
    • Saldo total dos bancos
    • Total investido

- Resumo por Categoria:
  Gráficos e listagens mostrando os gastos por categoria como Alimentação, Transporte, Cartão, etc.

- Modo Noturno:
  Alternância entre tema claro e escuro por meio de um botão no menu.

Estrutura dos Arquivos:
------------------------
• index.html         → Página principal do sistema
• style.css          → Estilo visual (inclui tema escuro)
• script.js          → Gerenciamento de abas e carregamento inicial
• bancos.js          → Cadastro de bancos e atualização de saldos
• despesas.js        → Lançamento de movimentações financeiras
• investimentos.js   → Controle de valores investidos
• emprestimos.js     → Registro e baixa de empréstimos
• impostos.js        → Registro de pagamentos e atalhos
• resumo.js          → Geração de gráficos de resumo por categoria

Requisitos:
------------
• Navegador moderno (Google Chrome, Firefox, Edge)
• Suporte a localStorage
• Suporte a JavaScript ES6+

Como Utilizar:
---------------
1. Abra o arquivo index.html no seu navegador.
2. Utilize as abas para cadastrar bancos, lançar despesas, registrar investimentos ou empréstimos.
3. Os dados são salvos automaticamente no navegador (localStorage), mesmo que feche a aba.

Autor:
-------
Desenvolvido por Paulo.H.Tesche (2025)

