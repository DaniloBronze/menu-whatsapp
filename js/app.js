$(document).ready(function () {
  cardapio.eventos.init();
});


function formatCEP() {
  let cepInput = document.getElementById("txtCEP");
  let cep = cepInput.value.replace(/\D/g, ''); // Remove tudo exceto números
  if (cep.length === 8) {
    cep = cep.replace(/(\d{5})(\d{3})/, "$1-$2"); // Adiciona o hífen
  }
  cepInput.value = cep;
}

// Adicionar um ouvinte de evento para chamar a função quando o valor muda
document.getElementById("txtCEP").addEventListener("input", formatCEP);

function getIp(callback) {
  function response(s) {
    callback(window.userip);

    s.onload = s.onerror = null;
    document.body.removeChild(s);
  }

  function trigger() {
    window.userip = false;

    var s = document.createElement("script");
    s.async = true;
    s.onload = function () {
      response(s);
    };
    s.onerror = function () {
      response(s);
    };

    s.src = "https://l2.io/ip.js?var=userip";
    document.body.appendChild(s);
  }

  if (/^(interactive|complete)$/i.test(document.readyState)) {
    trigger();
  } else {
    document.addEventListener('DOMContentLoaded', trigger);
  }
}

getIp(function (ip) {
});

function iniciarAnimacaoDeConfete() {
  var duration = 10;

  var config = {
    particleCount: 50, // Número de partículas de confete
    spread: 100, // Espalhamento das partículas em todas as direções
    startVelocity: 30, // Velocidade inicial das partículas
    ticks: 100, // Número de "ticks" da animação
    origin: { x: Math.random(), y: Math.random() }, // Origem aleatória para partículas
  };

  var end = Date.now() + duration;

  (function frame() {
    confetti(config);
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());

  document.getElementById('confeteContainer').classList.remove('hidden');
}

var cardapio = {};

var MEU_CARRINHO = [];

var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0
var CELULAR_EMPRESA = '5521975177350'
var VALOR_ENTREGA = 5;

let carrinhoVazioContador = 0;

cardapio.eventos = {
  init: () => {
    cardapio.metodos.obterItensCardapio();
    cardapio.metodos.carregarBotaoReserva();
    cardapio.metodos.carregarBotaoLigar();
  }
}


cardapio.metodos = {
  //Obtem a lista de itens do cardapio
  obterItensCardapio: (categoria = 'burgers', vermais = false) => {
    var filtro = MENU[categoria];

    if (!vermais) {
      $("#itensCardapio").html('');
    }

    $.each(filtro, (i, e) => {
      let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${id}/g, e.id)
        .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','));

      //Botaom ver mais foi clicado (12 itens)
      if (vermais && i >= 8 && i < 12) {
        $("#itensCardapio").append(temp);
      }

      //Paginação inicial de 8 itens
      if (!vermais && i < 8) {
        $("#itensCardapio").append(temp);
        $("#btnVerMais").removeClass('hidden');
      }
    });

    //remove o ativo
    $(".container-menu a ").removeClass('active');

    // seta o menu para ativo

    $("#menu-" + categoria).addClass('active');
  },

  //Clique no botão de ver mais
  verMais: () => {
    var ativo = $(".container-menu a.active").attr("id").split("menu-")[1];
    cardapio.metodos.obterItensCardapio(ativo, true);
    $("#btnVerMais").addClass('hidden');
  },

  //diminuir a quantidade do cardapio
  diminuirQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      $("#qntd-" + id).text(qntdAtual - 1);
    }
  },
  //aumetar a quantidade do cardapio
  aumentarQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());
    $("#qntd-" + id).text(qntdAtual + 1);

  },

  //adicionar ao carrinho o iten do cardapio
  adicionarAoCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());
    if (qntdAtual > 0) {
      //Obter a categoria ativa
      var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

      //obter a lista de itens
      let filtro = MENU[categoria];

      //obtem o item 
      let item = $.grep(filtro, (e, i) => {
        return e.id == id
      });

      if (item.length > 0) {
        //valida se ja existe esse item no carrinho
        let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id; });

        //caso já exista, só altera a quantidade
        if (existe.length > 0) {
          let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id))
          MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
        } else {
          //criar um propriedade no meu item do carrinho
          item[0].qntd = qntdAtual;
          MEU_CARRINHO.push(item[0]);
        }
        cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green');
        iniciarAnimacaoDeConfete();
        $("#qntd-" + id).text(0)
        cardapio.metodos.atualizaBadgeTotal();
      }
    }
  },

  //atualizar o badge de totais dos botoes Meu carrinhos
  atualizaBadgeTotal: () => {
    var total = 0;
    $.each(MEU_CARRINHO, (i, e) => {
      total += e.qntd;
    });

    if (total > 0) {
      $(".botao-carrinho").removeClass("hidden");
      $(".container-total-carrinho").removeClass("hidden");
    } else {
      $(".botao-carrinho").addClass("hidden");
      $(".container-total-carrinho").addClass("hidden");
    }

    $(".badge-total-carrinho").html(total);
  },

  abrirCarrinho: (abrir) => {
    if (abrir) {
      $("#modalCarrinho").removeClass("hidden");
      cardapio.metodos.carregarCarrinho();
    } else {
      $("#modalCarrinho").addClass("hidden");
    }
  },

  carregarEtapa: (etapa) => {
    if (etapa == 1) {
      $('#lbTituloEtapa').text('Seu carrinho');
      $('#itensCarrinho').removeClass('hidden');
      $('#localEntrega').addClass('hidden');
      $('#resumoCarrinho').addClass('hidden');

      $('.etapa').removeClass('active');
      $('.etapa1').addClass('active');

      $("#btnEtapaPedido").removeClass('hidden');
      $("#btnEtapaEndereco").addClass('hidden');
      $("#btnEtapaResumo").addClass('hidden');
      $("#btnEtapaVoltar").addClass('hidden');
    }

    if (etapa == 2) {
      $('#lbTituloEtapa').text('Endereço de entrega');
      $('#itensCarrinho').addClass('hidden');
      $('#localEntrega').removeClass('hidden');
      $('#resumoCarrinho').addClass('hidden');

      $('.etapa').removeClass('active');
      $('.etapa1').addClass('active');
      $('.etapa2').addClass('active');

      $("#btnEtapaPedido").addClass('hidden');
      $("#btnEtapaEndereco").removeClass('hidden');
      $("#btnEtapaResumo").addClass('hidden');
      $("#btnEtapaVoltar").removeClass('hidden');
    }

    if (etapa == 3) {
      $('#lbTituloEtapa').text('Resumo do pedido:');
      $('#itensCarrinho').addClass('hidden');
      $('#localEntrega').addClass('hidden');
      $('#resumoCarrinho').removeClass('hidden');

      $('.etapa').removeClass('active');
      $('.etapa1').addClass('active');
      $('.etapa2').addClass('active');
      $('.etapa3').addClass('active');

      $("#btnEtapaPedido").addClass('hidden');
      $("#btnEtapaEndereco").addClass('hidden');
      $("#btnEtapaResumo").removeClass('hidden');
      $("#btnEtapaVoltar").removeClass('hidden');
    }
  },

  voltarEtapa: () => {
    let etapa = $(".etapa.active").length;
    cardapio.metodos.carregarEtapa(etapa - 1);
  },

  // carregar a lista de itens do carrinho
  carregarCarrinho: () => {
    cardapio.metodos.carregarEtapa(1);

    if (MEU_CARRINHO.length > 0) {
      $("#itensCarrinho").html('');

      $.each(MEU_CARRINHO, (i, e) => {
        let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
          .replace(/\${nome}/g, e.name)
          .replace(/\${id}/g, e.id)
          .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
          .replace(/\${qntd}/g, e.qntd)

        $("#itensCarrinho").append(temp);

        //último item
        if ((i + 1) == MEU_CARRINHO.length) {
          cardapio.metodos.carregarValores();
        }

      })
    } else {
      $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>');
      cardapio.metodos.carregarValores();
    }
  },

  // diminuir quantidade do item no carrinho
  diminuirQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

    if (qntdAtual > 1) {
      $("#qntd-carrinho-" + id).text(qntdAtual - 1);
      cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
    } else {
      cardapio.metodos.removerItemCarrinho(id);
    }
  },

  // aumenta quantidade do item no carrinho
  aumentarQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
    $("#qntd-carrinho-" + id).text(qntdAtual + 1);
    cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
  },

  removerItemCarrinho: (id) => {

    MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
    cardapio.metodos.carregarCarrinho();

    //atualizar o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizaBadgeTotal();

  },
  //atualizar o carrinho com a quantidade atual
  atualizarCarrinho: (id, qntd) => {
    let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
    MEU_CARRINHO[objIndex].qntd = qntd;

    //atualizar o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizaBadgeTotal();

    // Atualizar os valores em (R$) totais do carrinho
    cardapio.metodos.carregarValores();
  },

  // carregar os valores de SubTotal, Entrega e Total
  carregarValores: () => {
    VALOR_CARRINHO = 0;
    $("#lblSubtotal").text("R$ 0,00");
    $("#lblValorEntrega").text("+ R$ 0,00");
    $("#lblValorTotal").text("R$ 0,00");

    $.each(MEU_CARRINHO, (i, e) => {
      VALOR_CARRINHO += parseFloat(e.price * e.qntd);

      if ((i + 1) == MEU_CARRINHO.length) {
        $("#lblSubtotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
        $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
        $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
      }
    })
  },

  carregarEndereco: () => {
    if (MEU_CARRINHO.length <= 0) {
      carrinhoVazioContador++;
      if (carrinhoVazioContador <= 5) {
        cardapio.metodos.mensagem('Seu carrinho está vazio');
      } else if (carrinhoVazioContador <= 10) {
        cardapio.metodos.mensagem('Parar de verificar o carrinho. Está sempre vazio.', 'yellow');
      } else if (carrinhoVazioContador <= 15) {
        getIp(function (ip) {
          cardapio.metodos.mensagem(`Você foi hackeado😰!, Pegamos seu IP: ${ip}`, 'red');
          iniciarAnimacaoDeConfete();
        });
      } else {
        cardapio.metodos.mensagem(`Brincadeira!`, 'green');
      }
      return;
    }

    carrinhoVazioContador = 0; // Resetar o contador quando o carrinho não está vazio.
    cardapio.metodos.carregarEtapa(2);
  },

  //API CEP
  buscarCep: () => {
    //criar a var com o valor do cep
    var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

    //Verifica se o cep possui valor informado
    if (cep != "") {
      var validacep = /^[0-9]{8}$/;
      if (validacep.test(cep)) {
        $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {
          if (!("erro" in dados)) {
            //Atualizar os campos com valores retornados
            $("#txtEndereco").val(dados.logradouro);
            $("#txtBairro").val(dados.bairro);
            $("#txtCidade").val(dados.localidade);
            $("#ddlUf").val(dados.uf);

            $("#txtNumero").focus();
          } else {
            cardapio.metodos.mensagem("CEP não encontrado. Preencha as informções manualmente.");
            $("#txtEnderecos").focus();
          }

        });
      } else {
        cardapio.metodos.mensagem("Formato do CEP inválido.");
        $("#txtCEP").focus();
      }
    } else {
      cardapio.metodos.mensagem("Informe o CEP, por favor.");
      $("#txtCEP").focus();
    }

  },

  resumoPedido: () => {
    let cep = $("#txtCEP").val().trim();
    let endereco = $("#txtEndereco").val().trim();
    let cidade = $("#txtCidade").val().trim();
    let uf = $("#ddlUf").val().trim();
    let numero = $("#txtNumero").val().trim();
    let bairro = $("#txtBairro").val().trim();
    let complemento = $("#txtComplemento").val().trim();

    if (cep.length <= 0) {
      cardapio.metodos.mensagem("Informe o CEP, por favor.");
      $("#txtCEP").focus();
      return;
    }

    if (endereco.length <= 0) {
      cardapio.metodos.mensagem("Informe o Endereço, por favor.");
      $("#txtEndereco").focus();
      return;
    }

    if (cidade.length <= 0) {
      cardapio.metodos.mensagem("Informe o Cidade, por favor.");
      $("#txtCidade").focus();
      return;
    }

    if (uf == "-1") {
      cardapio.metodos.mensagem("Informe o UF, por favor.");
      $("#ddlUf").focus();
      return;
    }

    if (numero.length <= 0) {
      cardapio.metodos.mensagem("Informe o Número, por favor.");
      $("#txtNumero").focus();
      return;
    }

    if (bairro.length <= 0) {
      cardapio.metodos.mensagem("Informe o Bairro, por favor.");
      $("#txtBairro").focus();
      return;
    }

    MEU_ENDERECO = {
      cep: cep,
      endereco: endereco,
      cidade: cidade,
      uf: uf,
      numero: numero,
      complemento: complemento,
      bairro: bairro
    }

    cardapio.metodos.carregarEtapa(3);
    cardapio.metodos.carregarResumo();
  },

  //carregar a etapa de resumo dos pedidos
  carregarResumo: () => {
    $("#listaItensResumo").html('');

    $.each(MEU_CARRINHO, (i, e) => {
      let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
        .replace(/\${qntd}/g, e.qntd)

      $("#listaItensResumo").append(temp);
    })

    $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
    $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

    cardapio.metodos.finalizarPedido();
  },

  finalizarPedido: () => {
    if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
      let itens = '';
      
      $.each(MEU_CARRINHO, (i, item) => {
          itens += `${item.qntd}x ${item.name} ......... R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
          
          if ((i + 1) === MEU_CARRINHO.length) {
              let texto = 'Olá, gostaria de fazer um pedido:';
              texto += `\nItens do pedido:\n\n${itens}`;
              texto += '\nEndereço de entrega:';
              texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
              texto += `\n${MEU_ENDERECO.cidade}, ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
              texto += `\n\nTotal (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`;
              
              let encode = encodeURI(texto);
              let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;
              
              $("#btnEtapaResumo").attr('href', URL);
          }
      });
  }
  },

  carregarBotaoReserva: () =>{
    var texto = "Olá! Gostaria de fazer uma *reserva*";
    let encode = encodeURI(texto);
    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

    $('#btnReserva').attr('href', URL);

  },

  carregarBotaoLigar: () =>{
    $("#btnLigar").attr('href',`tel:${CELULAR_EMPRESA}`);

  },

  abrirDepoimento: (depoimento) =>{
    $("#depoimento-1").addClass("hidden");
    $("#depoimento-2").addClass("hidden");
    $("#depoimento-3").addClass("hidden");

    $("#btnDepoimento-1").removeClass("active");
    $("#btnDepoimento-2").removeClass("active");
    $("#btnDepoimento-3").removeClass("active");

    $('#depoimento-' + depoimento).removeClass("hidden");
    $("#btnDepoimento-" + depoimento).addClass("active");
  },
  //mensagens
  mensagem: (texto, cor = 'red', tempo = 3000) => {

    let id = Math.floor(Date.now() * Math.random()).toString();

    let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

    $("#container-mensagens").append(msg);

    setTimeout(() => {
      $("#msg-" + id).removeClass('fadeInDown');
      $("#msg-" + id).addClass('fadeOutUp');
      setTimeout(() => {
        $("#msg-" + id).remove();
      }, 800);
    }, tempo)
  },

}

cardapio.templates = {
  item: `<div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp" id="\${id}">
            <div class="card card-item">
              <div class="img-produto">
                <img src="\${img}" alt="Foto de \${nome}">
              </div>
              <p class="title-produto text-center mt-4">
                <b>\${nome}</b>
              </p>
              <p class="price-produto text-center">
                <b>R$ \${preco}</b>
              </p>
              <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-\${id}">0</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>
              </div>
            </div>
            </div > `,

  itemCarrinho: `<div class="col-12 item-carrinho">
            <div class="img-produto">
              <img src="\${img}" alt="Foto de \${nome}">
            </div>
            <div class="dados-produto">
              <p class="title-produto"><b>\${nome}</b></p>
              <p><b class="price-produto">R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
              <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
              <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
              <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
              <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fas fa-times"></i></span>
            </div><!--add--carrinho-- >
          </div>`,

  itemResumo: `<div class="col-12 item-carrinho resumo">
  <div class="img-produto-resumo">
  <img src="\${img}" alt="Foto de \${nome}">
  </div>
  <div class="dados-produto">
    <p class="title-produto-resumo">
      <b>\${nome}</b>
    </p>
    <p class="price-produto-resumo">
      <b>R$ \${preco}</b>
    </p>
  </div>
  <p class="quantidade-produto-resumo">
    x <b>\${qntd}</b>
  </p>
</div>`,

}