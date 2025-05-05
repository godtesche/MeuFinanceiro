// Função para cadastrar um banco
function cadastrarBanco() {
    const nome = document.getElementById('bancoNome').value;
    const saldoInicial = parseFloat(document.getElementById('saldoInicial').value);
    const principal = document.getElementById('principal').checked;

    if (!nome || isNaN(saldoInicial)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const banco = {
        nome: nome,
        saldo: saldoInicial,
        principal: principal,
    };

    // Salva o banco no localStorage
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];
    bancos.push(banco);
    localStorage.setItem('bancos', JSON.stringify(bancos));

    // Limpar os campos de entrada após o cadastro
    document.getElementById('bancoNome').value = '';
    document.getElementById('saldoInicial').value = '';
    document.getElementById('principal').checked = false;

    atualizarListaBancos();  // Atualiza a lista de bancos
}

// Função para atualizar a lista de bancos na tabela e no select
function atualizarListaBancos() {
    const saldosElement = document.getElementById('saldos');
    const bancoSelect = document.getElementById('bancoSelect');
    const historicoBancoSelect = document.getElementById('historicoBancoSelect');
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];

    // Atualiza a tabela de bancos
    if (saldosElement) {
        saldosElement.innerHTML = '';
        bancos.forEach((banco, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${banco.nome}</td>
                <td>R$ ${banco.saldo.toFixed(2)}</td>
                <td><button onclick="deletarBanco(${index})">Excluir</button></td>
            `;
            saldosElement.appendChild(row);
        });
    }

    // Atualiza os selects de bancos
    [bancoSelect, historicoBancoSelect].forEach(select => {
        if (select) {
            select.innerHTML = '';
            if (bancos.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhum banco cadastrado';
                select.appendChild(option);
            } else {
                bancos.forEach((banco, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = banco.nome;
                    select.appendChild(option);
                });
            }
        }
    });
}

// Função para excluir um banco
function deletarBanco(index) {
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];
    bancos.splice(index, 1);
    localStorage.setItem('bancos', JSON.stringify(bancos));
    atualizarListaBancos();
}

// Função para lançar movimentação
function lancarMovimentacao() {
    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;
    const bancoIndex = document.getElementById('bancoSelect').value;

    if (!data || !descricao || isNaN(valor)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    // Obtém a lista de bancos
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];

    if (bancoIndex >= bancos.length) {
        alert('Banco selecionado inválido.');
        return;
    }

    // Atualiza o saldo do banco
    if (tipo === 'credito') {
        bancos[bancoIndex].saldo += valor;
    } else {
        bancos[bancoIndex].saldo -= valor;
    }

    // Salva os bancos atualizados
    localStorage.setItem('bancos', JSON.stringify(bancos));

    // Cria a movimentação
    const movimentacao = {
        data,
        descricao,
        valor,
        tipo,
        banco: bancos[bancoIndex].nome,
        bancoIndex
    };

    // Salva a movimentação no histórico
    let historico = JSON.parse(localStorage.getItem('historico')) || [];
    historico.push(movimentacao);
    localStorage.setItem('historico', JSON.stringify(historico));

    // Limpa os campos
    document.getElementById('data').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';

    // Atualiza as listas
    atualizarListaBancos();
    carregarHistorico();
    atualizarSaldos(); 
}

// Função para carregar o histórico de movimentações
function carregarHistorico() {
    const historicoElement = document.getElementById('historico');
    const historico = JSON.parse(localStorage.getItem('historico')) || [];

    historicoElement.innerHTML = '';

    historico.forEach((mov, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mov.data}</td>
            <td>${mov.descricao}</td>
            <td>R$ ${mov.valor.toFixed(2)}</td>
            <td>${mov.tipo === 'credito' ? 'Crédito' : 'Débito'}</td>
            <td>${mov.banco}</td>
            <td><button onclick="deletarMovimentacao(${index})">Excluir</button></td>
        `;
        historicoElement.appendChild(row);
    });
}

// Função para excluir uma movimentação
function deletarMovimentacao(index) {
    let historico = JSON.parse(localStorage.getItem('historico')) || [];
    const movimentacao = historico[index];

    // Reverte o saldo no banco
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];
    if (movimentacao.bancoIndex < bancos.length) {
        if (movimentacao.tipo === 'credito') {
            bancos[movimentacao.bancoIndex].saldo -= movimentacao.valor;
        } else {
            bancos[movimentacao.bancoIndex].saldo += movimentacao.valor;
        }
        localStorage.setItem('bancos', JSON.stringify(bancos));
    }

    // Remove a movimentação
    historico.splice(index, 1);
    localStorage.setItem('historico', JSON.stringify(historico));

    // Atualiza as listas
    atualizarListaBancos();
    carregarHistorico();
    atualizarSaldos(); 
}

// Função para exibir a aba de movimentações
function exibirAbaMovimentacoes() {
    const abaMovimentacoes = document.getElementById('abaMovimentacoes');
    abaMovimentacoes.style.display = 'block';
    atualizarListaBancos();
    carregarHistorico();
}

// Inicialização da página
function inicializar() {
    atualizarListaBancos();
    carregarHistorico();
    atualizarSaldos(); 

    // Configura o evento para a aba de movimentações
    const abrirMovimentacoes = document.getElementById('abrirMovimentacoes');
    if (abrirMovimentacoes) {
        abrirMovimentacoes.addEventListener('click', exibirAbaMovimentacoes);
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializar);
