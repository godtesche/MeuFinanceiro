// script.js

let bancos = JSON.parse(localStorage.getItem('bancos')) || [];
let movimentacoes = JSON.parse(localStorage.getItem('movimentacoes')) || [];
let reserva = JSON.parse(localStorage.getItem('reserva')) || 0;
let historicoReserva = JSON.parse(localStorage.getItem('historicoReserva')) || [];
let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];
let impostos = JSON.parse(localStorage.getItem('impostos')) || [];

function alternarModo() {
  document.body.classList.toggle('dark-mode');
}

function excluirBanco(index) {
  const banco = bancos[index];

  // Verifica se há movimentações atreladas a esse banco
  const movimentacoesAtreladas = movimentacoes.some(m => m.bancoIndex === index);
  if (movimentacoesAtreladas) {
    return alert("Não é possível excluir o banco. Existem movimentações associadas a ele.");
  }

  if (!confirm(`Deseja realmente excluir o banco "${banco.nome}"?`)) return;

  bancos.splice(index, 1);

  // Corrige os índices dos bancos nas movimentações restantes
  movimentacoes = movimentacoes.map(m => {
    if (m.bancoIndex > index) m.bancoIndex -= 1;
    return m;
  });

  salvarDados();
  atualizarInterface();
  renderizarMovimentacoes();
  renderizarReserva();
  renderizarEmprestimos();
  renderizarImpostos();
}

function salvarDados() {
  localStorage.setItem('bancos', JSON.stringify(bancos));
  localStorage.setItem('movimentacoes', JSON.stringify(movimentacoes));
  localStorage.setItem('reserva', JSON.stringify(reserva));
  localStorage.setItem('historicoReserva', JSON.stringify(historicoReserva));
  localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
  localStorage.setItem('impostos', JSON.stringify(impostos));
}

function renderizarImpostos() {
  const tbody = document.getElementById('tabelaImpostos');
  tbody.innerHTML = '';
  impostos.forEach((imp, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${imp.tipo}</td>
      <td>${imp.data}</td>
      <td>${formatarValor(imp.valor)}</td>
      <td>${imp.descricao}</td>
      <td>${imp.status}</td>
      <td>
        ${imp.status === 'Pendente' ? `
          <button onclick="marcarImpostoPago(${i})">Marcar como Pago</button>
        ` : ''}
        <button onclick="excluirImposto(${i})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function marcarImpostoPago(index) {
  const imposto = impostos[index];
  imposto.status = 'Pago';

  const indexBancoPrincipal = bancos.findIndex(b => b.principal);
  if (indexBancoPrincipal >= 0) {
    bancos[indexBancoPrincipal].saldo -= imposto.valor;

    movimentacoes.push({
      data: imposto.data,
      descricao: `Pagamento Imposto: ${imposto.tipo} - ${imposto.descricao}`,
      valor: imposto.valor,
      tipo: 'debito',
      bancoIndex: indexBancoPrincipal
    });
  }

  salvarDados();
  atualizarInterface();
  renderizarMovimentacoes();
  renderizarReserva();
  renderizarEmprestimos();
  renderizarImpostos();
}

function excluirImposto(index) {
  if (confirm('Deseja realmente excluir este imposto?')) {
    impostos.splice(index, 1);
    salvarDados();
    atualizarInterface();
    renderizarMovimentacoes();
    renderizarReserva();
    renderizarEmprestimos();
    renderizarImpostos();
  }
}

function registrarImposto() {
  const tipo = document.getElementById('tipoImposto').value;
  const data = document.getElementById('dataImposto').value;
  const valor = parseFloat(document.getElementById('valorImposto').value);
  const descricao = document.getElementById('descricaoImposto').value;
  const status = document.getElementById('statusImposto').value;

  if (!tipo || !data || isNaN(valor) || valor <= 0 || !descricao) {
    return alert('Preencha todos os campos corretamente.');
  }

  impostos.push({ tipo, data, valor, descricao, status });
  salvarDados();
  atualizarInterface();
  renderizarMovimentacoes();
  renderizarReserva();
  renderizarEmprestimos();
  renderizarImpostos(); // ← ESSENCIAL

  // Limpar campos
  document.getElementById('tipoImposto').value = 'DAS';
  document.getElementById('dataImposto').value = '';
  document.getElementById('valorImposto').value = '';
  document.getElementById('descricaoImposto').value = '';
  document.getElementById('statusImposto').value = 'Pendente';
}


function mostrarAba(id) {
  document.querySelectorAll('.aba').forEach(el => el.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

function cadastrarBanco() {
  const nome = document.getElementById('bancoNome').value;
  const saldoInicial = parseFloat(document.getElementById('saldoInicial').value) || 0;
  const principal = document.getElementById('principal').checked;

  if (!nome) return alert('Informe o nome do banco.');
  if (saldoInicial < 0) return alert('Saldo inicial não pode ser negativo.');

  if (principal) bancos.forEach(b => b.principal = false);

  bancos.push({ nome, saldo: saldoInicial, principal });

  // Limpar campos
  document.getElementById('bancoNome').value = '';
  document.getElementById('saldoInicial').value = '';
  document.getElementById('principal').checked = false;

  salvarDados();
  atualizarInterface();
}

function atualizarInterface() {
  const saldosEl = document.getElementById('saldos');
  const bancoSelect = document.getElementById('bancoSelect');
  const saldoContaPrincipalEl = document.getElementById('saldoContaPrincipal');
  const saldoTotalEl = document.getElementById('saldoTotal');

  saldosEl.innerHTML = '';
  bancoSelect.innerHTML = '';
  let total = 0;
  let principalSaldo = 0;

  bancos.forEach((banco, index) => {
    total += banco.saldo;
    if (banco.principal) principalSaldo = banco.saldo;

    const li = document.createElement('li');
    li.innerHTML = `
      ${banco.nome}: ${formatarValor(banco.saldo)}${banco.principal ? ' (Principal)' : ''}
      <button class="acao-btn" onclick="excluirBanco(${index})">Excluir</button>`;
    saldosEl.appendChild(li);

    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = banco.nome;
    bancoSelect.appendChild(opt);
  });

  saldoContaPrincipalEl.textContent = formatarValor(principalSaldo);
  saldoTotalEl.textContent = formatarValor(total);
  document.getElementById('reservaValor').textContent = formatarValor(reserva);
  document.getElementById('saldoInvestimentos').textContent = formatarValor(reserva);
  

  renderizarMovimentacoes();
  renderizarReserva();
  renderizarEmprestimos();
}

function lancarMovimentacao() {
  const data = document.getElementById('data').value;
  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;
  const bancoIndex = parseInt(document.getElementById('bancoSelect').value);

  if (!data || !descricao || isNaN(valor) || valor <= 0 || bancoIndex < 0) {
    return alert('Preencha todos os campos corretamente.');
  }

  if (tipo === 'debito' && bancos[bancoIndex].saldo < valor) {
    return alert('Saldo insuficiente para débito.');
  }

  movimentacoes.push({ data, descricao, valor, tipo, bancoIndex });

  if (tipo === 'credito') bancos[bancoIndex].saldo += valor;
  else bancos[bancoIndex].saldo -= valor;

  // Limpar campos
  document.getElementById('data').value = '';
  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';
  document.getElementById('tipo').value = 'debito';

  salvarDados();
  atualizarInterface();
}

function renderizarMovimentacoes() {
  const tbody = document.getElementById('historico');
  tbody.innerHTML = '';
  movimentacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
  movimentacoes.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.data}</td>
      <td>${m.descricao}</td>
      <td>${formatarValor(m.valor)}</td>
      <td>${m.tipo}</td>
      <td>${bancos[m.bancoIndex]?.nome || '-'}</td>
      <td><button onclick="excluirMovimentacao(${i})">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function excluirMovimentacao(index) {
  const m = movimentacoes[index];
  const banco = bancos[m.bancoIndex];

  if (banco) {
    if (m.tipo === 'credito') banco.saldo -= m.valor;
    else banco.saldo += m.valor;
  }

  movimentacoes.splice(index, 1);
  salvarDados();
  atualizarInterface();
}


function atualizarReserva() {
  const valor = parseFloat(document.getElementById('reservaInput').value);
  if (!isNaN(valor) && valor >= 0) {
    reserva = valor;
    salvarDados();
    atualizarInterface();
  }
}

function lancarReserva() {
  const data = document.getElementById('dataReserva').value;
  const descricao = document.getElementById('descReserva').value;
  const valor = parseFloat(document.getElementById('valorReserva').value);
  const tipo = document.getElementById('tipoReserva').value;

  if (!data || !descricao || isNaN(valor) || valor <= 0) {
    return alert('Preencha todos os campos corretamente.');
  }

  historicoReserva.push({ data, descricao, valor, tipo });

  if (tipo === 'aporte') reserva += valor;
  else reserva -= valor;

  // Limpar campos
  document.getElementById('dataReserva').value = '';
  document.getElementById('descReserva').value = '';
  document.getElementById('valorReserva').value = '';
  document.getElementById('tipoReserva').value = 'aporte';

  salvarDados();
  atualizarInterface();
}

function renderizarReserva() {
  const tbody = document.getElementById('tabelaReserva');
  tbody.innerHTML = '';
  historicoReserva.sort((a, b) => new Date(b.data) - new Date(a.data));
  historicoReserva.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.data}</td>
      <td>${r.descricao}</td>
      <td>${formatarValor(r.valor)}</td>
      <td>${r.tipo}</td>
      <td><button onclick="excluirReserva(${i})">Excluir</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function excluirReserva(index) {
  const r = historicoReserva[index];
  if (r.tipo === 'aporte') reserva -= r.valor;
  else reserva += r.valor;
  historicoReserva.splice(index, 1);
  salvarDados();
  atualizarInterface();
}

function registrarEmprestimo() {
  const nome = document.getElementById('nomePessoa').value;
  const valor = parseFloat(document.getElementById('valorEmprestimo').value);
  const data = document.getElementById('dataEmprestimo').value;
  const obs = document.getElementById('obsEmprestimo').value;

  if (!nome || isNaN(valor) || valor <= 0 || !data) {
    return alert('Preencha todos os campos corretamente.');
  }

  emprestimos.push({ nome, valor, data, obs, pago: false });

  // Limpar campos
  document.getElementById('nomePessoa').value = '';
  document.getElementById('valorEmprestimo').value = '';
  document.getElementById('dataEmprestimo').value = '';
  document.getElementById('obsEmprestimo').value = '';

  salvarDados();
  atualizarInterface();
}

function renderizarEmprestimos() {
  const tbody = document.getElementById('tabelaEmprestimos');
  tbody.innerHTML = '';
  emprestimos.sort((a, b) => new Date(b.data) - new Date(a.data));
  emprestimos.forEach((e, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.nome}</td>
      <td>${formatarValor(e.valor)}</td>
      <td>${e.data}</td>
      <td>${e.obs}</td>
      <td>${e.pago ? 'Pago' : 'Pendente'}</td>
      <td>
        ${!e.pago ? `<button onclick="marcarEmprestimoPago(${i})">Marcar como Pago</button>` : ''}
        <button onclick="excluirEmprestimo(${i})">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function marcarEmprestimoPago(index) {
  const emprestimo = emprestimos[index];
  emprestimo.pago = true;

  const indexBancoPrincipal = bancos.findIndex(b => b.principal);
  if (indexBancoPrincipal >= 0) {
    bancos[indexBancoPrincipal].saldo += emprestimo.valor;
  }

  salvarDados();
  atualizarInterface();
}

function excluirEmprestimo(index) {
  emprestimos.splice(index, 1);
  salvarDados();
  atualizarInterface();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registrado!'))
    .catch((err) => console.error('Erro ao registrar o Service Worker:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarInterface();
  renderizarImpostos(); // ← Adiciona esta linha
});
