// Carregar dados da reserva ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  carregarReserva();
  carregarHistoricoReserva();
});

// Função de validação de campos
function validarCamposReserva(data, descricao, valor, tipo, categoria) {
  if (!data || !descricao || isNaN(valor) || valor <= 0 || !tipo || !categoria) {
    alert("Preencha todos os campos corretamente.");
    return false;
  }
  return true;
}

// Atualiza o valor manual da reserva
function atualizarReserva() {
  const novoValor = parseFloat(document.getElementById('reservaInput').value);
  if (isNaN(novoValor)) {
    alert("Digite um valor válido.");
    return;
  }

  const historico = JSON.parse(localStorage.getItem('historicoReserva')) || [];
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const valorAntigo = calcularTotalReserva();

  // Registrar no histórico o ajuste manual
  historico.push({
    data: dataAtual,
    descricao: 'Ajuste Manual',
    valor: novoValor - valorAntigo,
    tipo: novoValor >= valorAntigo ? 'aporte' : 'retirada',
    categoria: 'Ajuste'
  });

  localStorage.setItem('historicoReserva', JSON.stringify(historico));
  document.getElementById('reservaInput').value = '';

  carregarReserva();
  carregarHistoricoReserva();
}

// Faz novo lançamento na reserva
function lancarReserva() {
  const data = document.getElementById('dataReserva').value;
  const descricao = document.getElementById('descReserva').value;
  const valor = parseFloat(document.getElementById('valorReserva').value);
  const tipo = document.getElementById('tipoReserva').value;
  const categoria = document.getElementById('categoriaReserva').value;

  // Validação dos campos
  if (!validarCamposReserva(data, descricao, valor, tipo, categoria)) {
    return;
  }

  const historico = JSON.parse(localStorage.getItem('historicoReserva')) || [];

  historico.push({ data, descricao, valor, tipo, categoria });
  localStorage.setItem('historicoReserva', JSON.stringify(historico));

  // Limpar campos
  document.getElementById('dataReserva').value = '';
  document.getElementById('descReserva').value = '';
  document.getElementById('valorReserva').value = '';

  carregarReserva();
  carregarHistoricoReserva();
}

// Carrega e atualiza o valor total da reserva
function carregarReserva() {
  const total = calcularTotalReserva();
  document.getElementById('reservaValor').textContent = formatarValor(total);
}

// Calcula o total da reserva (soma aportes - retiradas)
function calcularTotalReserva() {
  const historico = JSON.parse(localStorage.getItem('historicoReserva')) || [];
  return historico.reduce((total, lancamento) => {
    return lancamento.tipo === 'aporte' ? total + lancamento.valor : total - lancamento.valor;
  }, 0);
}

// Carrega a tabela com o histórico de lançamentos
function carregarHistoricoReserva() {
  const historico = JSON.parse(localStorage.getItem('historicoReserva')) || [];
  const tabela = document.getElementById('tabelaReserva');
  const resumo = {};

  tabela.innerHTML = ''; // Limpa a tabela antes de preenchê-la

  let html = '';
  historico.forEach((lancamento, index) => {
    html += `
      <tr>
        <td>${lancamento.data}</td>
        <td>${lancamento.descricao}</td>
        <td>${formatarValor(lancamento.valor)}</td>
        <td>${lancamento.tipo}</td>
        <td>${lancamento.categoria}</td>
        <td><button onclick="excluirLancamentoReserva(${index})">Excluir</button></td>
      </tr>
    `;

    // Atualiza resumo por categoria
    const key = lancamento.categoria;
    if (!resumo[key]) resumo[key] = 0;
    resumo[key] += lancamento.tipo === 'aporte' ? lancamento.valor : -lancamento.valor;
  });

  tabela.innerHTML = html;

  // Atualiza lista de resumo por categoria
  const listaResumo = document.getElementById('resumoPorCategoria');
  listaResumo.innerHTML = '';
  for (let cat in resumo) {
    const item = document.createElement('li');
    item.textContent = `${cat}: ${formatarValor(resumo[cat])}`;
    listaResumo.appendChild(item);
  }
}

// Exclui lançamento por índice
function excluirLancamentoReserva(index) {
  if (!confirm('Deseja realmente excluir este lançamento?')) return;

  const historico = JSON.parse(localStorage.getItem('historicoReserva')) || [];
  historico.splice(index, 1);
  localStorage.setItem('historicoReserva', JSON.stringify(historico));

  carregarReserva();
  carregarHistoricoReserva();
}

// Formata valores em BRL
function formatarValor(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

