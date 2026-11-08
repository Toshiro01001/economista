/* Gráficos de linha em SVG, desenhados pelo DOM. Sem biblioteca.
   O desenho usa a largura real da caixa, então os textos têm sempre o mesmo tamanho (inclusive no celular). */
"use strict";
(function () {
  var NS = "http://www.w3.org/2000/svg";

  function el(nome, attrs, pai) {
    var e = document.createElementNS(NS, nome);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(e);
    return e;
  }

  /* Marcas "redondas" para um eixo: 1, 2, 5 vezes uma potência de 10. */
  function marcas(min, max, quantas) {
    var amplitude = max - min;
    if (amplitude <= 0) amplitude = Math.abs(max) || 1;
    var bruto = amplitude / quantas, pot = Math.pow(10, Math.floor(Math.log10(bruto)));
    var f = bruto / pot, passo = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * pot;
    var ini = Math.ceil(min / passo - 1e-9) * passo + 0, out = [];
    for (var v = ini; v <= max + passo * 1e-6; v += passo) out.push((Math.round(v / passo * 1e6) / 1e6 * passo) + 0);
    return out;
  }

  /* Desenha o gráfico. opc:
     series: [{nome, classe, pontos:[[x,y]...], rotulo:{texto, lugar:"fim"|"inicio", lado:"cima"|"baixo"}}]
     xMin, xMax, yMin, yMax, xMarcas:[{v, texto}], yMarcas:[{v, texto}], cursor:{x, serie}, altura */
  function linhas(svg, opc) {
    var caixa = svg.parentElement;
    var L = Math.max(260, Math.floor(caixa.clientWidth || 600));
    var A = opc.altura || Math.max(240, Math.min(400, Math.round(L * 0.56)));
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + L + " " + A);
    svg.setAttribute("width", L);
    svg.setAttribute("height", A);

    var maiorRotuloY = 0;
    opc.yMarcas.forEach(function (m) { maiorRotuloY = Math.max(maiorRotuloY, m.texto.length); });
    var mE = Math.min(96, 14 + maiorRotuloY * 7), mD = 16, mT = 18, mB = 34;
    var w = L - mE - mD, h = A - mT - mB;
    function X(v) { return mE + (v - opc.xMin) / (opc.xMax - opc.xMin || 1) * w; }
    function Y(v) { return mT + h - (v - opc.yMin) / (opc.yMax - opc.yMin || 1) * h; }

    var g = el("g", { "class": "grade" }, svg);
    opc.yMarcas.forEach(function (m) {
      el("line", { x1: mE, x2: mE + w, y1: Y(m.v), y2: Y(m.v) }, g);
    });
    opc.xMarcas.forEach(function (m) {
      el("line", { x1: X(m.v), x2: X(m.v), y1: mT, y2: mT + h }, g);
    });
    el("line", { "class": "base", x1: mE, x2: mE + w, y1: mT + h, y2: mT + h }, svg);

    var te = el("g", { "class": "eixo" }, svg);
    opc.yMarcas.forEach(function (m) {
      var t = el("text", { x: mE - 8, y: Y(m.v) + 4, "text-anchor": "end" }, te);
      t.textContent = m.texto;
    });
    opc.xMarcas.forEach(function (m, i) {
      var ancora = i === 0 ? "start" : (i === opc.xMarcas.length - 1 ? "end" : "middle");
      var t = el("text", { x: X(m.v), y: mT + h + 20, "text-anchor": ancora }, te);
      t.textContent = m.texto;
    });

    var fim = {};
    opc.series.forEach(function (s) {
      var d = "";
      s.pontos.forEach(function (p, i) { d += (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); });
      el("path", { "class": "linha " + s.classe, d: d }, svg);
      if (s.rotulo) {
        var inicio = s.rotulo.lugar === "inicio";
        var p = inicio ? s.pontos[0] : s.pontos[s.pontos.length - 1];
        var dy = s.rotulo.lado === "baixo" ? 18 : -9;
        var t = el("text", { "class": "rotulo-linha " + s.classe, x: X(p[0]) + (inicio ? 6 : -4), y: Y(p[1]) + dy, "text-anchor": inicio ? "start" : "end" }, svg);
        t.textContent = s.rotulo.texto;
      }
    });

    if (opc.cursor) {
      var cx = X(opc.cursor.x), cy = Y(opc.cursor.y);
      el("line", { "class": "cursor-linha", x1: cx, x2: cx, y1: mT, y2: mT + h }, svg);
      el("circle", { "class": "cursor-ponto", cx: cx, cy: cy, r: 6 }, svg);
    }
    return { X: X, Y: Y };
  }

  function mil(v) {
    if (v === 0) v = 0;
    var a = Math.abs(v);
    var f = function (n, d) { return n.toLocaleString("pt-BR", { maximumFractionDigits: d }); };
    if (a >= 1e6) return "R$ " + f(v / 1e6, 1) + " mi";
    if (a >= 1e3) return "R$ " + f(v / 1e3, 1) + " mil";
    return "R$ " + f(v, 0);
  }

  window.Graf = { linhas: linhas, marcas: marcas, mil: mil };
})();
