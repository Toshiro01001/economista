/* Contas do site (sem tocar na página, para poderem ser testadas sozinhas).
   Tudo é simulação com dados do visitante; nada sai do navegador. */
"use strict";
(function () {
  /* Lê números no jeito brasileiro: "1.234,56", "1234,56" e "1234.56". Devolve NaN se não der. */
  function ler(texto) {
    var t = String(texto == null ? "" : texto).trim().replace(/\s/g, "").replace(/^R\$/, "");
    if (t === "") return NaN;
    if (t.indexOf(",") !== -1) t = t.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    if (!/^-?\d+(\.\d+)?$/.test(t)) return NaN;
    return parseFloat(t);
  }

  var moedaFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  var numFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function moeda(v) { return moedaFmt.format(v).replace(/ /g, " "); }
  function num2(v) { return numFmt.format(v); }
  function inteiro(v) { return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v); }

  function taxaMensal(anual) { return Math.pow(1 + anual / 100, 1 / 12) - 1; }

  /* Juros compostos com inflação. Aporte no fim de cada mês. Se corrigir, o aporte sobe pela inflação a cada 12 meses. */
  function simulaJuros(p) {
    var n = Math.round(p.anos * 12);
    var im = taxaMensal(p.juros), fm = taxaMensal(p.inflacao);
    var saldo = p.inicial, guardado = p.inicial, pontos = [];
    pontos.push({ m: 0, nominal: saldo, real: saldo, guardado: guardado });
    for (var m = 1; m <= n; m++) {
      var aporte = p.corrigir ? p.aporte * Math.pow(1 + p.inflacao / 100, Math.floor((m - 1) / 12)) : p.aporte;
      saldo = saldo * (1 + im) + aporte;
      guardado += aporte;
      pontos.push({ m: m, nominal: saldo, real: saldo / Math.pow(1 + fm, m), guardado: guardado });
    }
    return pontos;
  }

  /* Financiamento: Price (parcela fixa) e SAC (amortização fixa). */
  function financia(p) {
    var pv = p.valor - p.entrada, n = p.meses, i = taxaMensal(p.juros);
    var pmt = i === 0 ? pv / n : (pv * i) / (1 - Math.pow(1 + i, -n));
    var price = [], sac = [], saldoP = pv, saldoS = pv, amort = pv / n, tp = 0, ts = 0;
    for (var k = 1; k <= n; k++) {
      var jP = saldoP * i, aP = pmt - jP;
      saldoP = k === n ? 0 : saldoP - aP;
      price.push({ k: k, parcela: pmt, juros: jP, amort: aP, saldo: Math.max(0, saldoP) });
      tp += pmt;
      var jS = saldoS * i, parcS = amort + jS;
      saldoS = k === n ? 0 : saldoS - amort;
      sac.push({ k: k, parcela: parcS, juros: jS, amort: amort, saldo: Math.max(0, saldoS) });
      ts += parcS;
    }
    var cruza = 0;
    for (var j = 0; j < n; j++) { if (sac[j].parcela <= pmt) { cruza = j + 1; break; } }
    return {
      financiado: pv, price: price, sac: sac, pmt: pmt,
      totalPrice: tp, totalSac: ts, jurosPrice: Math.max(0, Math.round((tp - pv) * 100) / 100), jurosSac: Math.max(0, Math.round((ts - pv) * 100) / 100), cruza: cruza
    };
  }

  window.Calc = {
    ler: ler, moeda: moeda, num2: num2, inteiro: inteiro,
    taxaMensal: taxaMensal, simulaJuros: simulaJuros, financia: financia
  };
})();
