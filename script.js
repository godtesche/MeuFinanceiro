// Alterna entre modo claro e noturno
function alternarModo() {
  const body = document.body;
  body.classList.toggle('modo-noturno');
}

function mostrarAba(aba) {
  const abas = document.querySelectorAll('.aba');
  abas.forEach(abaElemento => {
    abaElemento.style.display = 'none';
  });

  const abaSelecionada = document.getElementById(aba);
  abaSelecionada.style.display = 'block';

  // Carregar dados da aba correspondente
  switch (aba) {
    case 'abaBancos':
      carregarBancos();
      break;
    case 'abaDespesas':
      carregarDespesas();
      break;
    case 'abaMovimentacoes':
      carregarMovimentacoes();
      break;
    case 'abaInvestimentos':
      carregarInvestimentos();
      break;
    case 'abaImpostos':
      carregarImpostos();
      break;
    case 'abaResumo':
      if (typeof atualizarResumo === 'function') {
        atualizarResumo();
      }
      break;
  }
}

// Formata o valor em moeda brasileira
function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// Atualiza os lembretes de despesas pendentes
function atualizarInterface() {
  const despesasPendentesEl = document.getElementById('despesasPendentes');
  despesasPendentesEl.innerHTML = '';

  const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
  const pendentes = despesas.filter(d => !d.pago);

  if (pendentes.length === 0) {
    despesasPendentesEl.innerHTML = '<li>Todas as despesas estão pagas!</li>';
  } else {
    pendentes.forEach(d => {
      const li = document.createElement('li');
      li.textContent = d.tipo;
      despesasPendentesEl.appendChild(li);
    });
  }
}

/// Função para formatar valores como moeda
function formatarValor(valor) {
  return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
}

// Função para atualizar os saldos na tela
function atualizarSaldos() {
  // Carregar os dados dos bancos e investimentos do localStorage
  const bancos = JSON.parse(localStorage.getItem('bancos')) || [];
  const investimentos = JSON.parse(localStorage.getItem('investimentos')) || [];

  let saldoTotal = 0;
  let saldoPrincipal = 0;

  // Calcular os saldos totais e principais
  bancos.forEach(banco => {
    saldoTotal += banco.saldo;
    if (banco.principal) saldoPrincipal += banco.saldo;
  });

  // Calcular o total de investimentos
  const totalInvestimentos = investimentos.reduce((acc, inv) => acc + inv.valor, 0);

  // Atualizar os elementos na tela com os valores calculados
  document.getElementById('saldoContaPrincipal').textContent = formatarValor(saldoPrincipal);
  document.getElementById('saldoTotal').textContent = formatarValor(saldoTotal);
  document.getElementById('saldoInvestimentos').textContent = formatarValor(totalInvestimentos);

  // Atualiza a reserva de investimentos
  renderizarReserva(totalInvestimentos);
}

// Função de renderização da reserva de investimentos (caso haja)
function renderizarReserva(totalInvestimentos) {
  // Aqui você pode definir como deseja exibir o total de investimentos como "reserva"
  document.getElementById('reservaValor').textContent = formatarValor(totalInvestimentos);
}

// Função para pagar uma despesa
function pagarDespesa(index) {
  const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
  const bancos = JSON.parse(localStorage.getItem('bancos')) || [];

  const despesa = despesas[index];
  if (despesa.paga) {
    alert('Despesa já está paga.');
    return;
  }

  const bancoPrincipal = bancos.find(b => b.principal);
  if (!bancoPrincipal) {
    alert('Nenhum banco principal definido.');
    return;
  }

  if (bancoPrincipal.saldo < despesa.valor) {
    alert('Saldo insuficiente na conta principal.');
    return;
  }

  // Atualiza o saldo do banco principal
  bancoPrincipal.saldo -= despesa.valor;

  // Marca a despesa como paga
  despesa.paga = true;

  // Atualiza os dados no localStorage
  localStorage.setItem('bancos', JSON.stringify(bancos));
  localStorage.setItem('despesas', JSON.stringify(despesas));

  // Atualiza os saldos na interface
  atualizarSaldos();

  // Atualiza a interface de despesas e bancos
  carregarDespesas();
  carregarBancos();
}

// Função para reverter uma despesa (desmarcando como paga)
function reverterDespesa(index) {
  const lista = JSON.parse(localStorage.getItem('despesas')) || [];
  const despesa = lista[index];

  const bancos = JSON.parse(localStorage.getItem('bancos')) || [];
  const bancoPrincipal = bancos.find(b => b.principal);

  if (!bancoPrincipal) {
    alert('Nenhum banco principal definido.');
    return;
  }

  bancoPrincipal.saldo += despesa.valor;
  despesa.paga = false;

  localStorage.setItem('despesas', JSON.stringify(lista));
  localStorage.setItem('bancos', JSON.stringify(bancos));

  carregarDespesas();
  carregarBancos(); // Atualiza a exibição dos saldos
  atualizarSaldos();  // Atualiza os saldos na interface
}

// Função para carregar despesas
function carregarDespesas() {
  const lista = JSON.parse(localStorage.getItem('despesas')) || [];
  const corpoTabela = document.getElementById('tabelaDespesasBody');
  corpoTabela.innerHTML = '';

  lista.forEach((despesa, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${despesa.data}</td>
      <td>${despesa.descricao}</td>
      <td>${despesa.categoria}</td>
      <td>R$ ${parseFloat(despesa.valor).toFixed(2)}</td>
      <td>${despesa.paga ? 'Paga' : 'Pendente'}</td>
      <td>
        ${!despesa.paga
          ? `<button onclick="pagarDespesa(${index})">Pagar</button>`
          : `<button onclick="reverterDespesa(${index})">Reverter</button>`}
        <button onclick="excluirDespesa(${index})">Excluir</button>
      </td>
    `;

    corpoTabela.appendChild(tr);
  });
}

// Função para excluir uma despesa
function excluirDespesa(index) {
  const lista = JSON.parse(localStorage.getItem('despesas')) || [];
  lista.splice(index, 1);
  localStorage.setItem('despesas', JSON.stringify(lista));
  carregarDespesas();
  atualizarSaldos();  // Atualiza os saldos após exclusão
}

// Função para carregar os bancos
function carregarBancos() {
  const bancos = JSON.parse(localStorage.getItem('bancos')) || [];
  // Aqui você pode implementar o carregamento visual dos bancos, caso precise
}


// Inicializar o sistema
function inicializar() {
  carregarEmprestimos();
  carregarDespesas();
  atualizarInterface();
  carregarBancos();         // <- ESSENCIAL!
  atualizarSaldos();        // <- ESSENCIAL!
}


// Função para registrar um novo imposto
function registrarImposto() {
  const tipo = document.getElementById('tipoImposto').value;
  const data = document.getElementById('dataImposto').value;
  const valor = parseFloat(document.getElementById('valorImposto').value);
  const descricao = document.getElementById('descricaoImposto').value;
  const status = document.getElementById('statusImposto').value;

  if (!tipo || !data || isNaN(valor)) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
  impostos.push({ tipo, data, valor, descricao, status });
  localStorage.setItem('impostos', JSON.stringify(impostos));

  carregarImpostos();
  verificarImpostosVencendo();
}

// Carrega os impostos na tabela
function carregarImpostos() {
  const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
  const tabela = document.getElementById('tabelaImpostos');
  tabela.innerHTML = '';

  impostos.forEach((imposto, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${imposto.tipo}</td>
      <td>${imposto.data}</td>
      <td>${formatarValor(imposto.valor)}</td>
      <td>${imposto.descricao || '-'}</td>
      <td>${imposto.status}</td>
      <td>
        ${imposto.status === 'Pendente' ? `<button onclick="pagarImposto(${index})">Pagar</button>` : ''}
        <button onclick="excluirImposto(${index})">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

// Paga o imposto e desconta da conta principal
function pagarImposto(index) {
  const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
  const bancos = JSON.parse(localStorage.getItem('bancos')) || [];

  const imposto = impostos[index];
  if (imposto.status === 'Pago') {
    alert('Imposto já está pago.');
    return;
  }

  const bancoPrincipal = bancos.find(b => b.principal);
  if (!bancoPrincipal) {
    alert('Nenhum banco principal definido.');
    return;
  }

  if (bancoPrincipal.saldo < imposto.valor) {
    alert('Saldo insuficiente na conta principal.');
    return;
  }

  bancoPrincipal.saldo -= imposto.valor;
  imposto.status = 'Pago';

  localStorage.setItem('bancos', JSON.stringify(bancos));
  localStorage.setItem('impostos', JSON.stringify(impostos));

  carregarImpostos();
  atualizarSaldos();
}

// Exclui um imposto
function excluirImposto(index) {
  const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
  impostos.splice(index, 1);
  localStorage.setItem('impostos', JSON.stringify(impostos));
  carregarImpostos();
}

// Verifica impostos vencendo nos próximos 7 dias
function verificarImpostosVencendo() {
  const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
  const avisos = document.getElementById('avisosImpostos') || criarAreaAvisoImpostos();
  avisos.innerHTML = '';

  const hoje = new Date();
  const proximosDias = 7;

  const vencendo = impostos.filter(imp => {
    const venc = new Date(imp.data);
    const diasRestantes = (venc - hoje) / (1000 * 60 * 60 * 24);
    return diasRestantes >= 0 && diasRestantes <= proximosDias && imp.status === 'Pendente';
  });

  if (vencendo.length > 0) {
    vencendo.forEach(imp => {
      const aviso = document.createElement('div');
      aviso.className = 'aviso-vencimento';
      aviso.textContent = `🔔 ${imp.tipo} vence em ${imp.data} - ${formatarValor(imp.valor)}`;
      avisos.appendChild(aviso);
    });
  }
}

// Cria área de aviso na tela principal (se não existir)
function criarAreaAvisoImpostos() {
  const container = document.getElementById('avisos') || document.createElement('div');
  container.id = 'avisos';

  const avisoImpostos = document.createElement('div');
  avisoImpostos.id = 'avisosImpostos';
  avisoImpostos.className = 'avisos-impostos';

  container.appendChild(avisoImpostos);
  document.body.insertBefore(container, document.body.firstChild); // coloca no topo
  return avisoImpostos;
}

function atualizarSaldos() {
  const bancos = JSON.parse(localStorage.getItem('bancos')) || [];
  const investimentos = JSON.parse(localStorage.getItem('investimentos')) || [];
  const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
  const impostos = JSON.parse(localStorage.getItem('impostos')) || [];

  let saldoTotal = 0;
  let saldoPrincipal = 0;

  // Calcular saldos bancários
  bancos.forEach(banco => {
    saldoTotal += banco.saldo;
    if (banco.principal) saldoPrincipal += banco.saldo;
  });

  // Calcular totais
  const totalInvestimentos = investimentos.reduce((acc, inv) => acc + inv.valor, 0);
  const totalDespesasPendentes = despesas
    .filter(d => !d.paga) // assumindo que a propriedade é 'paga' para despesas
    .reduce((acc, d) => acc + parseFloat(d.valor), 0);
  
  const totalImpostosPendentes = impostos
    .filter(i => i.status === 'Pendente') // assumindo que você usa 'status' para impostos
    .reduce((acc, i) => acc + parseFloat(i.valor), 0);

  // Atualizar a interface
  document.getElementById('saldoContaPrincipal').textContent = formatarValor(saldoPrincipal);
  document.getElementById('saldoTotal').textContent = formatarValor(saldoTotal);
  document.getElementById('saldoDespesasPendentes').textContent = formatarValor(totalDespesasPendentes);
  document.getElementById('saldoImpostosPendentes').textContent = formatarValor(totalImpostosPendentes);

  // Se você quiser mostrar investimentos também, adicione um elemento no HTML
  // document.getElementById('saldoInvestimentos').textContent = formatarValor(totalInvestimentos);
 // Atualiza a reserva visualmente
  renderizarReserva(totalInvestimentos);
}


document.addEventListener('DOMContentLoaded', function() {
  inicializar();
});
