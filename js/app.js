/* Marginal Estudos Econômicos (demonstração): comportamento da página.
   Simulador de juros e inflação, comparador Price x SAC, termômetro com séries fictícias e pedido de estudo.
   Tudo roda no navegador. Nada é enviado e nada é guardado (sem localStorage, sem cookies). */
"use strict";
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var C = window.Calc, G = window.Graf;

  var reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- erros por campo ---------- */
  function erro(id, msg) {
    var campo = document.getElementById(id), aviso = document.getElementById(id + "-erro");
    if (!campo || !aviso) return;
    if (msg) {
      aviso.textContent = msg; aviso.hidden = false;
      campo.setAttribute("aria-invalid", "true");
    } else {
      aviso.textContent = ""; aviso.hidden = true;
      campo.removeAttribute("aria-invalid");
    }
  }

  function formataMilhar(input, casas) {
    var v = C.ler(input.value);
    if (isNaN(v)) return;
    input.value = v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas });
  }

  /* ---------- menu do celular ---------- */
  var botaoMenu = $(".menu-botao"), menu = $("#menu");
  function fechaMenu() { botaoMenu.setAttribute("aria-expanded", "false"); menu.classList.remove("aberto"); }
  botaoMenu.addEventListener("click", function () {
    var abrir = botaoMenu.getAttribute("aria-expanded") !== "true";
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    menu.classList.toggle("aberto", abrir);
  });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", fechaMenu); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("aberto")) { fechaMenu(); botaoMenu.focus(); }
  });

  /* ---------- simulador de juros e inflação ---------- */
  var sim = { ok: false, p: null, pontos: null };

  function leSim() {
    var dados = {
      inicial: C.ler($("#sim-inicial").value), aporte: C.ler($("#sim-aporte").value),
      anos: C.ler($("#sim-anos").value), juros: C.ler($("#sim-juros").value),
      inflacao: C.ler($("#sim-inflacao").value), corrigir: $("#sim-corrigir").checked
    };
    var ok = true;
    function checa(id, cond, msg) { erro(id, cond ? "" : msg); if (!cond) ok = false; }
    checa("sim-inicial", !isNaN(dados.inicial) && dados.inicial >= 0 && dados.inicial <= 1e8, "Informe um valor de 0 a 100.000.000. Pode ser zero.");
    checa("sim-aporte", !isNaN(dados.aporte) && dados.aporte >= 0 && dados.aporte <= 1e7, "Informe um valor de 0 a 10.000.000. Pode ser zero.");
    checa("sim-anos", !isNaN(dados.anos) && dados.anos >= 1 && dados.anos <= 50 && Math.floor(dados.anos) === dados.anos, "Informe um número inteiro de anos, de 1 a 50.");
    checa("sim-juros", !isNaN(dados.juros) && dados.juros >= 0 && dados.juros <= 100, "Informe uma taxa de 0 a 100 por cento ao ano.");
    checa("sim-inflacao", !isNaN(dados.inflacao) && dados.inflacao >= 0 && dados.inflacao <= 100, "Informe uma inflação de 0 a 100 por cento ao ano.");
    if (ok && dados.inicial === 0 && dados.aporte === 0) {
      erro("sim-inicial", "Informe pelo menos um valor inicial ou um valor mensal.");
      ok = false;
    }
    return ok ? dados : null;
  }

  function pct(v) { return C.num2(v) + "%"; }

  function desenhaSim() {
    if (!sim.p) return;
    var anos = sim.p.anos, pts = sim.pontos, ult = pts[pts.length - 1];
    var maximo = Math.max(ult.nominal, ult.guardado);
    var yM = G.marcas(0, maximo * 1.02, 4);
    var yMax = yM[yM.length - 1] >= maximo ? yM[yM.length - 1] : yM[yM.length - 1] + (yM[1] - yM[0]);
    if (yMax < maximo) { yM.push(yMax); }
    var xM = G.marcas(0, anos, 5).map(function (v) { return { v: v, texto: v === 0 ? "hoje" : v + (v === 1 ? " ano" : " anos") }; });
    G.linhas($("#sim-grafico"), {
      xMin: 0, xMax: anos, yMin: 0, yMax: yMax,
      xMarcas: xM, yMarcas: yM.map(function (v) { return { v: v, texto: G.mil(v) }; }),
      series: [
        { classe: "s-tracejada", pontos: pts.map(function (p) { return [p.m / 12, p.guardado]; }) },
        { classe: "s-tinta", pontos: pts.map(function (p) { return [p.m / 12, p.nominal]; }), rotulo: { texto: "nominal", lugar: "fim", lado: "cima" } },
        { classe: "s-lapis", pontos: pts.map(function (p) { return [p.m / 12, p.real]; }), rotulo: { texto: "em reais de hoje", lugar: "fim", lado: "cima" } }
      ]
    });
  }

  function atualizaSim() {
    var p = leSim();
    var saidas = ["#sim-real", "#sim-nominal", "#sim-investido", "#sim-ganho"];
    if (!p) {
      sim.ok = false; sim.p = null;
      saidas.forEach(function (s) { $(s).textContent = "corrija os campos"; });
      $("#sim-leitura").textContent = "Corrija os campos marcados para ver o resultado.";
      var svg = $("#sim-grafico"); while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute("height", "0");
      $("#sim-tabela tbody").textContent = "";
      return;
    }
    var pts = C.simulaJuros(p), ult = pts[pts.length - 1];
    sim.ok = true; sim.p = p; sim.pontos = pts;
    $("#sim-real").textContent = C.moeda(ult.real);
    $("#sim-nominal").textContent = C.moeda(ult.nominal);
    $("#sim-investido").textContent = C.moeda(ult.guardado);
    var ganho = ult.real - ult.guardado;
    $("#sim-ganho").textContent = C.moeda(ganho);
    var real = ((1 + p.juros / 100) / (1 + p.inflacao / 100) - 1) * 100;
    var frase = "Com " + pct(p.juros) + " ao ano e inflação de " + pct(p.inflacao) + " ao ano, o rendimento real é de " + pct(real) + " ao ano. ";
    frase += "O saldo de " + C.moeda(ult.nominal) + " parece muito, mas a inflação tira " + C.moeda(ult.nominal - ult.real) + " do poder de compra: em reais de hoje, são " + C.moeda(ult.real) + ".";
    if (real < 0) frase += " Atenção: com a inflação acima do rendimento, o dinheiro perde valor.";
    $("#sim-leitura").textContent = frase;

    var corpo = $("#sim-tabela tbody"); corpo.textContent = "";
    for (var a = 1; a <= p.anos; a++) {
      var q = pts[a * 12], tr = document.createElement("tr");
      [String(a), C.moeda(q.guardado), C.moeda(q.nominal), C.moeda(q.real)].forEach(function (t, i) {
        var td = document.createElement(i === 0 ? "th" : "td");
        if (i === 0) td.setAttribute("scope", "row");
        td.textContent = t; tr.appendChild(td);
      });
      corpo.appendChild(tr);
    }
    desenhaSim();
  }

  /* ---------- comparador de financiamento ---------- */
  var fin = { ok: false, p: null, r: null };

  function leFin() {
    var d = {
      valor: C.ler($("#fin-valor").value), entrada: C.ler($("#fin-entrada").value),
      meses: C.ler($("#fin-meses").value), juros: C.ler($("#fin-juros").value)
    };
    var ok = true;
    function checa(id, cond, msg) { erro(id, cond ? "" : msg); if (!cond) ok = false; }
    checa("fin-valor", !isNaN(d.valor) && d.valor > 0 && d.valor <= 1e9, "Informe o valor do bem, maior que zero.");
    checa("fin-entrada", !isNaN(d.entrada) && d.entrada >= 0, "Informe a entrada. Pode ser zero.");
    if (!isNaN(d.valor) && !isNaN(d.entrada) && d.entrada >= d.valor) { erro("fin-entrada", "A entrada precisa ser menor que o valor do bem."); ok = false; }
    checa("fin-meses", !isNaN(d.meses) && d.meses >= 12 && d.meses <= 420 && Math.floor(d.meses) === d.meses, "Informe um número inteiro de meses, de 12 a 420.");
    checa("fin-juros", !isNaN(d.juros) && d.juros >= 0 && d.juros <= 100, "Informe juros de 0 a 100 por cento ao ano.");
    return ok ? d : null;
  }

  function desenhaFin() {
    if (!fin.r) return;
    var r = fin.r, n = fin.p.meses;
    var maximo = r.sac[0].parcela;
    var yM = G.marcas(0, maximo * 1.04, 4);
    if (yM[yM.length - 1] < maximo) yM.push(yM[yM.length - 1] + (yM[1] - yM[0]));
    var xM = G.marcas(0, n, 5).map(function (v) { return { v: v, texto: v === 0 ? "mês 0" : "mês " + v }; });
    G.linhas($("#fin-grafico"), {
      xMin: 0, xMax: n, yMin: 0, yMax: yM[yM.length - 1],
      xMarcas: xM, yMarcas: yM.map(function (v) { return { v: v, texto: G.mil(v) }; }),
      series: [
        { classe: "s-tinta", pontos: r.price.map(function (q) { return [q.k, q.parcela]; }), rotulo: { texto: "Price", lugar: "fim", lado: "cima" } },
        { classe: "s-lapis", pontos: r.sac.map(function (q) { return [q.k, q.parcela]; }), rotulo: { texto: "SAC", lugar: "inicio", lado: "cima" } }
      ]
    });
  }

  function atualizaFin() {
    var p = leFin();
    var ids = ["#fin-price-parcela", "#fin-price-total", "#fin-price-juros", "#fin-sac-primeira", "#fin-sac-ultima", "#fin-sac-total", "#fin-sac-juros"];
    if (!p) {
      fin.ok = false; fin.p = null; fin.r = null;
      ids.forEach(function (s) { $(s).textContent = "corrija os campos"; });
      $("#fin-leitura").textContent = "Corrija os campos marcados para ver a comparação.";
      var svg = $("#fin-grafico"); while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute("height", "0");
      $("#fin-tabela tbody").textContent = "";
      return;
    }
    var r = C.financia(p);
    fin.ok = true; fin.p = p; fin.r = r;
    $("#fin-price-parcela").textContent = C.moeda(r.pmt);
    $("#fin-price-total").textContent = C.moeda(r.totalPrice);
    $("#fin-price-juros").textContent = C.moeda(r.jurosPrice);
    $("#fin-sac-primeira").textContent = C.moeda(r.sac[0].parcela);
    $("#fin-sac-ultima").textContent = C.moeda(r.sac[r.sac.length - 1].parcela);
    $("#fin-sac-total").textContent = C.moeda(r.totalSac);
    $("#fin-sac-juros").textContent = C.moeda(r.jurosSac);

    var dif = r.totalPrice - r.totalSac;
    var t = "Você financia " + C.moeda(r.financiado) + ". ";
    if (Math.abs(dif) < 0.005) t += "Com juros zero, as duas tabelas custam o mesmo. ";
    else t += "O SAC custa " + C.moeda(dif) + " a menos de juros no total, mas a primeira parcela é " + C.moeda(r.sac[0].parcela - r.pmt) + " maior que a da Price. ";
    if (r.cruza > 1) t += "A parcela do SAC passa a ser menor que a da Price a partir do mês " + r.cruza + " (" + C.num2(r.cruza / 12) + " anos).";
    $("#fin-leitura").textContent = t;

    var corpo = $("#fin-tabela tbody"); corpo.textContent = "";
    var passo = Math.ceil(p.meses / 10 / 12) * 12, meses = [1];
    for (var k = passo; k < p.meses; k += passo) meses.push(k);
    meses.push(p.meses);
    meses.forEach(function (k) {
      var a = r.price[k - 1], b = r.sac[k - 1], tr = document.createElement("tr");
      [String(k), C.moeda(a.parcela), C.moeda(a.saldo), C.moeda(b.parcela), C.moeda(b.saldo)].forEach(function (x, i) {
        var td = document.createElement(i === 0 ? "th" : "td");
        if (i === 0) td.setAttribute("scope", "row");
        td.textContent = x; tr.appendChild(td);
      });
      corpo.appendChild(tr);
    });
    desenhaFin();
  }

  /* ---------- termômetro (séries fictícias) ---------- */
  var DADOS = window.SERIES_FICTICIAS;
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var SERIES = {
    inflacao: { nome: "Inflação em 12 meses (fictícia)", tipo: "pct" },
    juros: { nome: "Juros básicos ao ano (fictícios)", tipo: "pct" },
    cambio: { nome: "Câmbio em R$ por moeda fictícia", tipo: "brl" }
  };
  var ter = { serie: "inflacao", periodo: 12, idx: 11 };
  var inicioAno = parseInt(DADOS.inicio.slice(0, 4), 10), inicioMes = parseInt(DADOS.inicio.slice(5, 7), 10) - 1;

  function rotuloMes(i, curto) {
    var t = inicioMes + i, ano = inicioAno + Math.floor(t / 12), mes = t % 12;
    return MESES[mes] + "/" + (curto ? String(ano).slice(2) : ano);
  }
  function fmtSerie(chave, v) {
    return SERIES[chave].tipo === "pct" ? C.num2(v) + "%" : "R$ " + C.num2(v);
  }
  function fatia(chave) {
    var tudo = DADOS[chave], n = Math.min(ter.periodo, tudo.length), de = tudo.length - n;
    return { valores: tudo.slice(de), de: de };
  }

  function atualizaCotacoes() {
    $$(".cotacao").forEach(function (b) {
      var chave = b.getAttribute("data-serie"), f = fatia(chave), v = f.valores;
      var ult = v[v.length - 1], pri = v[0], mn = Math.min.apply(null, v), mx = Math.max.apply(null, v);
      b.querySelector('[data-campo="valor"]').textContent = fmtSerie(chave, ult);
      var txt;
      if (SERIES[chave].tipo === "pct") {
        var d = ult - pri;
        txt = (d > 0 ? "+" : d < 0 ? "-" : "") + C.num2(Math.abs(d)) + " p.p. no período";
      } else {
        var d2 = (ult / pri - 1) * 100;
        txt = (d2 > 0 ? "+" : d2 < 0 ? "-" : "") + C.num2(Math.abs(d2)) + "% no período";
      }
      b.querySelector('[data-campo="variacao"]').textContent = txt;
      b.querySelector('[data-campo="faixa"]').textContent = "mín. " + C.num2(mn) + " e máx. " + C.num2(mx);
      b.setAttribute("aria-pressed", String(chave === ter.serie));
    });
    $$(".giz-botao").forEach(function (b) {
      b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-periodo"), 10) === ter.periodo));
    });
  }

  function desenhaTermometro() {
    var f = fatia(ter.serie), v = f.valores, n = v.length;
    var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), folga = (mx - mn) * 0.15 || 0.5;
    var yM = G.marcas(mn - folga, mx + folga, 4);
    var yMin = Math.min(yM[0], mn - folga * 0.2), yMax = Math.max(yM[yM.length - 1], mx + folga * 0.2);
    var passoX = Math.max(1, Math.ceil((n - 1) / 4)), xM = [];
    for (var i = n - 1; i >= 0; i -= passoX) xM.unshift({ v: i, texto: rotuloMes(f.de + i, true) });
    var sel = Math.min(ter.idx, n - 1);
    G.linhas($("#ter-grafico"), {
      xMin: 0, xMax: n - 1, yMin: yMin, yMax: yMax,
      xMarcas: xM,
      yMarcas: yM.map(function (m) { return { v: m, texto: SERIES[ter.serie].tipo === "pct" ? C.num2(m) + "%" : C.num2(m) }; }),
      series: [{ classe: "s-giz", pontos: v.map(function (y, i) { return [i, y]; }) }],
      cursor: { x: sel, y: v[sel] }
    });
    $("#ter-grafico-titulo").textContent = SERIES[ter.serie].nome + ", de " + rotuloMes(f.de) + " a " + rotuloMes(f.de + n - 1) + ".";
    var cur = $("#ter-cursor");
    cur.max = String(n - 1); cur.value = String(sel);
    $("#ter-leitura").textContent = rotuloMes(f.de + sel) + ": " + fmtSerie(ter.serie, v[sel]) + " (valor fictício)";
  }

  function atualizaTermometro() {
    var n = Math.min(ter.periodo, DADOS[ter.serie].length);
    ter.idx = Math.min(ter.idx, n - 1);
    atualizaCotacoes();
    desenhaTermometro();
  }

  /* ---------- pedido de estudo ---------- */
  var TIPOS = {
    cenarios: "Análise de cenários", "planejamento-empresa": "Planejamento financeiro de empresa",
    "planejamento-pessoa": "Planejamento financeiro pessoal", viabilidade: "Estudo de viabilidade", "parecer": "Parecer econômico"
  };
  var PRAZOS = { "7": "Em 7 dias (urgente)", "15": "Em 15 dias", "30": "Em 30 dias", "0": "Sem pressa" };
  var formPedido = $("#form-pedido"), resumo = $("#pedido-resumo");

  function mascaraTelefone(v) {
    var d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  $("#telefone").addEventListener("input", function () { this.value = mascaraTelefone(this.value); });

  function validaPedido() {
    var falhas = [];
    function falha(id, msg, rotulo) { erro(id, msg); falhas.push({ id: id, rotulo: rotulo }); }
    var nome = $("#nome").value.trim(), email = $("#email").value.trim(), tel = $("#telefone").value.replace(/\D/g, "");
    var msg = $("#mensagem").value.trim();
    erro("nome", ""); erro("email", ""); erro("telefone", ""); erro("tipo", ""); erro("mensagem", ""); erro("ciente", "");
    $("#prazo-erro").hidden = true; $("#prazo-erro").textContent = "";
    if (nome.length < 3) falha("nome", "Escreva seu nome (pelo menos 3 letras).", "nome");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) falha("email", email ? "Esse e-mail parece incompleto. Exemplo: nome@exemplo.com.br" : "Informe seu e-mail.", "e-mail");
    if (tel.length && tel.length !== 10 && tel.length !== 11) falha("telefone", "O telefone precisa de DDD e 8 ou 9 dígitos.", "telefone");
    if (!$("#tipo").value) falha("tipo", "Escolha o tipo de estudo.", "tipo de estudo");
    if (!$('input[name="prazo"]:checked')) {
      $("#prazo-erro").textContent = "Escolha um prazo."; $("#prazo-erro").hidden = false;
      falhas.push({ id: null, rotulo: "prazo", foco: $('input[name="prazo"]') });
    }
    if (msg.length < 20) falha("mensagem", "Conte um pouco mais (pelo menos 20 letras). Hoje tem " + msg.length + ".", "o que você quer decidir");
    if (!$("#ciente").checked) falha("ciente", "Marque a caixa para continuar.", "ciência da demonstração");
    return falhas;
  }

  function dataEntrega(dias) {
    var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + dias);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  formPedido.addEventListener("submit", function (e) {
    e.preventDefault();
    var falhas = validaPedido(), geral = $("#pedido-erro");
    if (falhas.length) {
      geral.textContent = (falhas.length === 1 ? "Falta 1 item: " : "Faltam " + falhas.length + " itens: ") + falhas.map(function (f) { return f.rotulo; }).join(", ") + ".";
      geral.hidden = false;
      var primeiro = falhas[0], alvo = primeiro.id ? document.getElementById(primeiro.id) : primeiro.foco;
      if (alvo) alvo.focus();
      return;
    }
    geral.hidden = true;
    var prazo = $('input[name="prazo"]:checked').value, agora = new Date();
    var proto = "ME-" + agora.getFullYear() + "-" + String(Math.floor(100 + Math.random() * 900));
    $("#res-protocolo").textContent = proto;
    $("#res-nome").textContent = $("#nome").value.trim();
    $("#res-email").textContent = $("#email").value.trim();
    $("#res-telefone").textContent = $("#telefone").value || "não informado";
    $("#res-tipo").textContent = TIPOS[$("#tipo").value];
    $("#res-prazo").textContent = PRAZOS[prazo];
    $("#res-entrega").textContent = prazo === "0" ? "A combinar numa primeira conversa" : "até " + dataEntrega(parseInt(prazo, 10));
    $("#res-mensagem").textContent = $("#mensagem").value.trim();
    formPedido.hidden = true; resumo.hidden = false;
    resumo.focus();
    resumo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
  });

  ["nome", "email", "telefone", "mensagem"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      if (!document.getElementById(id + "-erro").hidden) erro(id, "");
    });
  });
  $("#tipo").addEventListener("change", function () { erro("tipo", ""); });
  $("#ciente").addEventListener("change", function () { erro("ciente", ""); });
  $$('input[name="prazo"]').forEach(function (r) { r.addEventListener("change", function () { $("#prazo-erro").hidden = true; }); });

  $("#res-editar").addEventListener("click", function () {
    resumo.hidden = true; formPedido.hidden = false; $("#nome").focus();
  });
  $("#res-novo").addEventListener("click", function () {
    formPedido.reset();
    ["nome", "email", "telefone", "tipo", "mensagem", "ciente"].forEach(function (id) { erro(id, ""); });
    $("#prazo-erro").hidden = true; $("#pedido-erro").hidden = true;
    resumo.hidden = true; formPedido.hidden = false; $("#nome").focus();
  });

  function levarParaPedido(tipo, texto) {
    $("#tipo").value = tipo; erro("tipo", "");
    $("#mensagem").value = texto; erro("mensagem", "");
    resumo.hidden = true; formPedido.hidden = false;
    $("#pedido").scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
    $("#mensagem").focus({ preventScroll: true });
  }

  $("#sim-levar").addEventListener("click", function () {
    if (!sim.ok) { var inv = $('#form-sim [aria-invalid="true"]'); if (inv) inv.focus(); return; }
    var p = sim.p, ult = sim.pontos[sim.pontos.length - 1];
    levarParaPedido("planejamento-pessoa",
      "Simulei guardar " + C.moeda(p.aporte) + " por mês durante " + p.anos + (p.anos === 1 ? " ano" : " anos") + ", começando com " + C.moeda(p.inicial) + ", a " + pct(p.juros) + " ao ano com inflação de " + pct(p.inflacao) + " ao ano. Em reais de hoje, o saldo seria " + C.moeda(ult.real) + ". Quero saber se esse plano cabe no meu orçamento.");
  });
  $("#fin-levar").addEventListener("click", function () {
    if (!fin.ok) { var inv = $('#form-fin [aria-invalid="true"]'); if (inv) inv.focus(); return; }
    var p = fin.p, r = fin.r;
    levarParaPedido("planejamento-pessoa",
      "Comparei um financiamento de " + C.moeda(r.financiado) + " em " + p.meses + " meses a " + pct(p.juros) + " ao ano. A Price teria parcela de " + C.moeda(r.pmt) + " e o SAC começaria em " + C.moeda(r.sac[0].parcela) + ". Quero ajuda para decidir qual tabela cabe melhor na minha renda.");
  });

  /* ---------- ligações ---------- */
  ["sim-inicial", "sim-aporte", "sim-anos", "sim-juros", "sim-inflacao"].forEach(function (id) {
    var campo = document.getElementById(id);
    campo.addEventListener("input", atualizaSim);
    campo.addEventListener("blur", function () {
      if (id === "sim-inicial" || id === "sim-aporte") formataMilhar(campo, 2);
    });
  });
  $("#sim-corrigir").addEventListener("change", atualizaSim);
  ["fin-valor", "fin-entrada", "fin-meses", "fin-juros"].forEach(function (id) {
    var campo = document.getElementById(id);
    campo.addEventListener("input", atualizaFin);
    campo.addEventListener("blur", function () {
      if (id === "fin-valor" || id === "fin-entrada") formataMilhar(campo, 2);
    });
  });
  $$("#form-sim, #form-fin").forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); }); });

  $$(".giz-botao").forEach(function (b) {
    b.addEventListener("click", function () {
      ter.periodo = parseInt(b.getAttribute("data-periodo"), 10);
      ter.idx = Math.min(ter.periodo, DADOS[ter.serie].length) - 1;
      atualizaTermometro();
    });
  });
  $$(".cotacao").forEach(function (b) {
    b.addEventListener("click", function () {
      ter.serie = b.getAttribute("data-serie");
      ter.idx = Math.min(ter.periodo, DADOS[ter.serie].length) - 1;
      atualizaTermometro();
    });
  });
  $("#ter-cursor").addEventListener("input", function () {
    ter.idx = parseInt(this.value, 10);
    desenhaTermometro();
    $("#ter-cursor").focus();
  });

  var temporizador = null, larguraAntes = window.innerWidth;
  window.addEventListener("resize", function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      if (window.innerWidth === larguraAntes) return;
      larguraAntes = window.innerWidth;
      desenhaSim(); desenhaFin(); desenhaTermometro();
    }, 120);
  });

  atualizaSim();
  atualizaFin();
  ter.idx = ter.periodo - 1;
  atualizaTermometro();
})();
