// CONFIGURAÇÃO DO SEU FIREBASE
// DE ATENÇÃO: Substitua as strings abaixo com as credenciais reais do seu painel do Firebase!
const firebaseConfig = {
  apiKey: "AIzaSyD-Dn8EdQldiXr62W8fWFPHCFvGk2GZrYo",
  authDomain: "testandocrud-88e63.firebaseapp.com",
  projectId: "testandocrud-88e63",
  storageBucket: "testandocrud-88e63.firebasestorage.app",
  messagingSenderId: "51688108996",
  appId: "1:51688108996:web:8e62574078c9fccb94ea91"
};

// Inicializando o ecossistema do Firebase e o Banco de Dados Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Array local que serve de espelho temporário para a busca em tempo real funcionar rápida
let estoque = [];

// READ (Leitura em Tempo Real): Monitora a coleção "produtos" na nuvem de forma assíncrona
db.collection("produtos").onSnapshot((snapshot) => {
    estoque = []; // Reseta a lista local temporária
    
    // Varre todos os documentos retornados da nuvem
    snapshot.forEach((doc) => {
        let produto = doc.data();
        produto.id = doc.id; // Vincula o ID alfanumérico gerado pelo próprio Firebase
        estoque.push(produto);
    });
    
    atualizarTela(estoque); // Redesenha a lista com as informações sincronizadas
});

// CREATE & UPDATE (Criar ou Atualizar)
function salvarProduto() {
    let nomeInput = document.getElementById("nome").value;
    let precoInput = Number(document.getElementById("preco").value);
    let idEdicao = document.getElementById("id-edicao").value;

    // Validação básica de entradas
    if (nomeInput.trim() === "" || isNaN(precoInput) || precoInput <= 0) {
        alert("Por favor, preencha o nome e um preço válido!");
        return;
    }

    let dadosProduto = { nome: nomeInput, preco: precoInput };

    if (idEdicao === "") {
        // OPERAÇÃO: CREATE (Adiciona o item como um novo registro na coleção)
        db.collection("produtos").add(dadosProduto)
            .then(() => limparFormulario())
            .catch((erro) => alert("Erro ao salvar dados na nuvem: " + erro));
    } else {
        // OPERAÇÃO: UPDATE (Modifica o documento correspondente baseado no ID de edição)
        db.collection("produtos").doc(idEdicao).update(dadosProduto)
            .then(() => limparFormulario())
            .catch((erro) => alert("Erro ao atualizar dados na nuvem: " + erro));
    }
}

// DELETE (Remover da nuvem)
function deletarProduto(id) {
    if (confirm("Tem certeza que deseja excluir este produto da nuvem?")) {
        // OPERAÇÃO: DELETE (Garante a remoção definitiva do registro no Firestore)
        db.collection("produtos").doc(id).delete()
            .then(() => {
                document.getElementById("busca").value = "";
                limparFormulario();
            })
            .catch((erro) => alert("Erro ao excluir o produto: " + erro));
    }
}

// SEARCH (Localizar / Filtrar)
function localizarProduto() {
    let termoBusca = document.getElementById("busca").value.toLowerCase();
    
    // Filtra no array local espelhado para não precisar fazer uma requisição paga à nuvem a cada letra
    let listaFiltrada = estoque.filter(p => p.nome.toLowerCase().includes(termoBusca));
    
    atualizarTela(listaFiltrada);
}

// Manipulação do DOM: Monta os itens estruturalmente dentro da página
function atualizarTela(lista) {
    let container = document.getElementById("lista-container");
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = "<p style='color: #777;'>Nenhum produto encontrado.</p>";
        return;
    }

    lista.forEach((p) => {
        container.innerHTML += `
            <div class="item-produto">
                <div>
                    <strong>${p.nome}</strong><br>
                    <span style="color: #666;">R$ ${p.preco.toFixed(2)}</span>
                </div>
                <div>
                    <button class="btn-editar" onclick="prepararEdicao('${p.id}')">Editar</button>
                    <button class="btn-deletar" onclick="deletarProduto('${p.id}')">Excluir</button>
                </div>
            </div>
        `;
    });
}

// Prepara os campos de texto com os dados do item da nuvem para o Update
function prepararEdicao(id) {
    let p = estoque.find(item => item.id === id);
    
    document.getElementById("nome").value = p.nome;
    document.getElementById("preco").value = p.preco;
    document.getElementById("id-edicao").value = p.id;

    document.getElementById("btn-acao").innerText = "Atualizar Produto";
    document.getElementById("btn-cancelar").style.display = "inline-block";
}

// Funções utilitárias de limpeza de formulário
function limparFormulario() {
    document.getElementById("nome").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("id-edicao").value = "";
    document.getElementById("btn-acao").innerText = "Cadastrar Produto";
    document.getElementById("btn-cancelar").style.display = "none";
}

function cancelarEdicao() {
    limparFormulario();
}