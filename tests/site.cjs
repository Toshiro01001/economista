/* Testes do site com Playwright.
   Como rodar, na raiz do projeto:  node tests/site.cjs
   Sobe um servidor local (python3 -m http.server 8320, na pasta acima, para o site responder em
   /economista/ como no GitHub Pages), abre o site em 1280x900, iPhone 13 e 320px, exercita as quatro
   funções (simulador, financiamento, termômetro, pedido), confere console, rolagem horizontal e textos
   cortados. Com CAPTURAS=1 salva PNGs em CAP_DIR (depois convertidos para webp em docs/) e, com
   SHOTS_DIR definido, salva a abertura em 1440x900 e no celular. */
"use strict";
const { chromium, devices } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PORTA = 8320;
const RAIZ = path.resolve(__dirname, "..");
const SLUG = path.basename(RAIZ);
const URL = `http://127.0.0.1:${PORTA}/${SLUG}/`;
const CAPTURAS = process.env.CAPTURAS === "1";
const SHOTS_DIR = process.env.SHOTS_DIR || "";
const CAP_DIR = process.env.CAP_DIR || path.join(RAIZ, "tests", "capturas");

const falhas = [];
function checa(cond, msg) { if (!cond) falhas.push(msg); }
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const txt = async (page, sel) => (await page.textContent(sel)).replace(/ /g, " ").trim();
const perto = (a, b, tol) => Math.abs(a - b) <= (tol || 0.01);

async function servidor() {
  const proc = spawn("python3", ["-m", "http.server", String(PORTA), "--bind", "127.0.0.1"], { cwd: path.dirname(RAIZ), stdio: "ignore" });
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(URL); if (r.ok) return proc; } catch (e) { /* ainda subindo */ }
    await espera(150);
  }
  proc.kill();
  throw new Error("Servidor local não subiu na porta " + PORTA);
}

async function verificacoesBasicas(page, rotulo) {
  const largura = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
  checa(largura.doc <= largura.win, `${rotulo}: rolagem horizontal (${largura.doc} > ${largura.win})`);
  const cortados = await page.evaluate(() => {
    const out = [];
    const els = document.querySelectorAll("h1,h2,h3,h4,p,a,button,label,legend,li,dt,dd,summary,span,small,figcaption,b,th,td");
    for (const el of els) {
      if (el.closest("[hidden]") || (el.offsetParent === null && getComputedStyle(el).position !== "fixed")) continue;
      if (el.closest(".tabela-rolagem")) continue;
      if (el.closest(".fitas")) continue; /* as fitas de termos correm de propósito para fora da tela, dentro de uma caixa que as corta */
      const cs = getComputedStyle(el);
      if (cs.overflow === "hidden" || cs.overflowX === "hidden") continue;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        out.push(`${el.tagName.toLowerCase()}.${el.className} "${el.textContent.trim().slice(0, 40)}" ${el.scrollWidth}>${el.clientWidth}`);
      }
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 && r.width > 0) out.push(`${el.tagName.toLowerCase()}.${el.className} sai da tela (${Math.round(r.right)})`);
    }
    return out;
  });
  checa(cortados.length === 0, `${rotulo}: textos cortados ou fora da tela: ${cortados.join(" | ")}`);
  /* nenhum campo pode passar da borda do formulário em que está */
  const vazando = await page.evaluate(() => [...document.querySelectorAll("form input, form select, form textarea")].filter((el) => {
    if (el.closest("[hidden]") || el.type === "radio" || el.type === "checkbox") return false;
    const f = el.closest("form").getBoundingClientRect(), r = el.getBoundingClientRect();
    return r.width > 0 && (r.right > f.right + 1 || r.right > window.innerWidth);
  }).map((el) => el.id || el.name));
  checa(vazando.length === 0, `${rotulo}: campos passando da borda do formulário: ${vazando.join(", ")}`);
}

async function graficoOk(page, sel, rotulo, linhas) {
  const r = await page.evaluate((s) => {
    const svg = document.querySelector(s), box = svg.parentElement.getBoundingClientRect();
    return { linhas: svg.querySelectorAll("path.linha").length, w: svg.getBoundingClientRect().width, caixa: box.width, h: svg.getBoundingClientRect().height };
  }, sel);
  checa(r.linhas === linhas, `${rotulo}: esperava ${linhas} linhas, veio ${r.linhas}`);
  checa(r.w > 200 && r.h > 150 && r.w <= r.caixa + 1, `${rotulo}: gráfico com tamanho estranho (${r.w}x${r.h}, caixa ${r.caixa})`);
}

async function capturar(page, seletor, nome) {
  await page.evaluate(() => { document.querySelector(".topo").style.position = "static"; });
  await page.locator(seletor).screenshot({ path: path.join(CAP_DIR, nome + ".png") });
  await page.evaluate(() => { document.querySelector(".topo").style.position = ""; });
}

async function testaFuncoes(page, rotulo, capturas, sufixo) {
  /* ---------- Simulador ---------- */
  await graficoOk(page, "#sim-grafico", `${rotulo} simulador`, 3);
  /* caso conhecido: 1000, sem aporte, 1 ano, 10% e inflação 5% => nominal 1100,00 e real 1047,62 */
  await page.fill("#sim-inicial", "1000"); await page.fill("#sim-aporte", "0"); await page.fill("#sim-anos", "1");
  await page.fill("#sim-juros", "10"); await page.fill("#sim-inflacao", "5");
  await espera(100);
  checa((await txt(page, "#sim-nominal")) === "R$ 1.100,00", `${rotulo}: nominal errado (${await txt(page, "#sim-nominal")})`);
  checa((await txt(page, "#sim-real")) === "R$ 1.047,62", `${rotulo}: real errado (${await txt(page, "#sim-real")})`);
  checa((await txt(page, "#sim-investido")) === "R$ 1.000,00", `${rotulo}: guardado errado`);
  checa((await page.locator("#sim-tabela tbody tr").count()) === 1, `${rotulo}: tabela ano a ano deveria ter 1 linha`);
  /* aporte sem correção: 12 x 100 a 0% => 1200 */
  await page.fill("#sim-inicial", "0"); await page.fill("#sim-aporte", "100"); await page.fill("#sim-juros", "0"); await page.fill("#sim-inflacao", "0");
  await page.uncheck("#sim-corrigir");
  await espera(100);
  checa((await txt(page, "#sim-nominal")) === "R$ 1.200,00", `${rotulo}: aporte sem juros errado (${await txt(page, "#sim-nominal")})`);
  /* aporte corrigido: 2 anos, inflação 10%, juros 0 => 12x100 + 12x110 = 2520 */
  await page.fill("#sim-anos", "2"); await page.fill("#sim-inflacao", "10"); await page.check("#sim-corrigir");
  await espera(100);
  checa((await txt(page, "#sim-investido")) === "R$ 2.520,00", `${rotulo}: aporte corrigido errado (${await txt(page, "#sim-investido")})`);
  /* erros */
  await page.fill("#sim-anos", "0");
  await espera(100);
  checa(!(await page.isHidden("#sim-anos-erro")), `${rotulo}: anos inválido não mostrou erro`);
  checa((await txt(page, "#sim-real")) === "corrija os campos", `${rotulo}: resultado deveria pedir correção`);
  await page.fill("#sim-anos", "abc"); await espera(100);
  checa(!(await page.isHidden("#sim-anos-erro")), `${rotulo}: texto em anos não mostrou erro`);
  /* volta ao padrão e confere pelo cálculo da página */
  await page.fill("#sim-inicial", "5.000"); await page.fill("#sim-aporte", "500"); await page.fill("#sim-anos", "10");
  await page.fill("#sim-juros", "10,5"); await page.fill("#sim-inflacao", "4,5");
  await page.dispatchEvent("#sim-aporte", "blur");
  await espera(150);
  checa(await page.isHidden("#sim-anos-erro"), `${rotulo}: erro de anos não sumiu`);
  checa((await page.inputValue("#sim-aporte")) === "500", `${rotulo}: blur mudou aporte (${await page.inputValue("#sim-aporte")})`);
  const ref = await page.evaluate(() => {
    const i = Math.pow(1.105, 1 / 12) - 1, f = Math.pow(1.045, 1 / 12) - 1;
    let s = 5000, g = 5000;
    for (let m = 1; m <= 120; m++) { const a = 500 * Math.pow(1.045, Math.floor((m - 1) / 12)); s = s * (1 + i) + a; g += a; }
    return { nominal: s, real: s / Math.pow(1 + f, 120), guardado: g };
  });
  const lido = (await txt(page, "#sim-nominal")).replace(/[^\d,]/g, "").replace(",", ".");
  checa(perto(parseFloat(lido), ref.nominal, 0.01), `${rotulo}: nominal padrão ${lido} != ${ref.nominal.toFixed(2)}`);
  checa((await page.locator("#sim-tabela tbody tr").count()) === 10, `${rotulo}: tabela deveria ter 10 anos`);
  const real = parseFloat((await txt(page, "#sim-real")).replace(/[^\d,]/g, "").replace(",", "."));
  checa(perto(real, ref.real, 0.01), `${rotulo}: real padrão ${real} != ${ref.real.toFixed(2)}`);
  await graficoOk(page, "#sim-grafico", `${rotulo} simulador (padrão)`, 3);
  checa((await page.locator("#sim-grafico .eixo text").count()) >= 5, `${rotulo}: simulador sem rótulos de eixo`);
  if (capturas) await capturar(page, "#simulador", `funcao-simulador${sufixo}`);

  /* ---------- Financiamento ---------- */
  await graficoOk(page, "#fin-grafico", `${rotulo} financiamento`, 2);
  await page.fill("#fin-valor", "100000"); await page.fill("#fin-entrada", "0"); await page.fill("#fin-meses", "12"); await page.fill("#fin-juros", "0");
  await espera(100);
  checa((await txt(page, "#fin-price-parcela")) === "R$ 8.333,33", `${rotulo}: Price com juros zero (${await txt(page, "#fin-price-parcela")})`);
  checa((await txt(page, "#fin-sac-primeira")) === "R$ 8.333,33", `${rotulo}: SAC primeira com juros zero`);
  checa((await txt(page, "#fin-sac-juros")) === "R$ 0,00", `${rotulo}: juros zero deveria dar zero`);
  /* 12,6825% ao ano = 1% ao mês: PMT 8.884,88; SAC 9.333,33 e 8.416,67; juros SAC 6.500,00 */
  await page.fill("#fin-juros", "12,6825"); await espera(100);
  checa((await txt(page, "#fin-price-parcela")) === "R$ 8.884,88", `${rotulo}: PMT errado (${await txt(page, "#fin-price-parcela")})`);
  checa((await txt(page, "#fin-sac-primeira")) === "R$ 9.333,33", `${rotulo}: SAC primeira errada (${await txt(page, "#fin-sac-primeira")})`);
  checa((await txt(page, "#fin-sac-ultima")) === "R$ 8.416,67", `${rotulo}: SAC última errada (${await txt(page, "#fin-sac-ultima")})`);
  checa((await txt(page, "#fin-sac-juros")).startsWith("R$ 6.49") || (await txt(page, "#fin-sac-juros")).startsWith("R$ 6.50"), `${rotulo}: juros do SAC errados (${await txt(page, "#fin-sac-juros")})`);
  checa((await txt(page, "#fin-leitura")).includes("a partir do mês"), `${rotulo}: leitura sem o mês de cruzamento (${await txt(page, "#fin-leitura")})`);
  checa((await page.locator("#fin-tabela tbody tr").count()) === 2, `${rotulo}: tabela de 12 meses deveria ter 2 linhas`);
  /* entrada maior que o bem e prazo fora da faixa */
  await page.fill("#fin-entrada", "100000"); await espera(100);
  checa(!(await page.isHidden("#fin-entrada-erro")), `${rotulo}: entrada >= valor não deu erro`);
  await page.fill("#fin-entrada", "20000"); await page.fill("#fin-meses", "5"); await espera(100);
  checa(!(await page.isHidden("#fin-meses-erro")), `${rotulo}: prazo curto não deu erro`);
  await page.fill("#fin-valor", "350.000"); await page.fill("#fin-entrada", "70.000"); await page.fill("#fin-meses", "240"); await page.fill("#fin-juros", "11,5"); await espera(150);
  checa(await page.isHidden("#fin-meses-erro") && await page.isHidden("#fin-entrada-erro"), `${rotulo}: erros do financiamento não sumiram`);
  const refFin = await page.evaluate(() => {
    const r = window.Calc.financia({ valor: 350000, entrada: 70000, meses: 240, juros: 11.5 });
    const somaPrice = r.price.reduce((s, x) => s + x.parcela, 0), somaSac = r.sac.reduce((s, x) => s + x.parcela, 0);
    return { saldoFinalPrice: r.price[239].saldo, saldoFinalSac: r.sac[239].saldo, somaPrice, somaSac, financiado: r.financiado, cruza: r.cruza, tp: r.totalPrice, ts: r.totalSac };
  });
  checa(perto(refFin.somaPrice, refFin.tp, 0.01) && perto(refFin.somaSac, refFin.ts, 0.01), `${rotulo}: totais não batem com a soma das parcelas`);
  checa(refFin.saldoFinalPrice < 0.01 && refFin.saldoFinalSac < 0.01, `${rotulo}: saldo final não zera`);
  checa(refFin.ts < refFin.tp && refFin.cruza > 1, `${rotulo}: SAC deveria custar menos e cruzar a Price (cruza ${refFin.cruza})`);
  checa((await page.locator("#fin-tabela tbody tr").count()) === 11, `${rotulo}: tabela de 240 meses deveria ter 11 linhas (${await page.locator("#fin-tabela tbody tr").count()})`);
  await graficoOk(page, "#fin-grafico", `${rotulo} financiamento (padrão)`, 2);
  if (capturas) await capturar(page, "#financiamento", `funcao-financiamento${sufixo}`);

  /* ---------- Termômetro ---------- */
  await graficoOk(page, "#ter-grafico", `${rotulo} termômetro`, 1);
  const serie = await page.evaluate(() => window.SERIES_FICTICIAS);
  const fmt = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  checa((await txt(page, '.cotacao[data-serie="inflacao"] [data-campo="valor"]')) === fmt(serie.inflacao[117]) + "%", `${rotulo}: valor da inflação não bate com a série`);
  checa((await txt(page, '.cotacao[data-serie="cambio"] [data-campo="valor"]')) === "R$ " + fmt(serie.cambio[117]), `${rotulo}: valor do câmbio não bate`);
  checa((await page.getAttribute('.giz-botao[data-periodo="12"]', "aria-pressed")) === "true", `${rotulo}: período inicial não é 12 meses`);
  await page.click('.giz-botao[data-periodo="118"]');
  checa((await page.getAttribute("#ter-cursor", "max")) === "117", `${rotulo}: cursor de 'Tudo' deveria ir até 117`);
  const v60 = serie.inflacao.slice(-60);
  await page.click('.giz-botao[data-periodo="60"]');
  const faixa = await txt(page, '.cotacao[data-serie="inflacao"] [data-campo="faixa"]');
  checa(faixa === `mín. ${fmt(Math.min(...v60))} e máx. ${fmt(Math.max(...v60))}`, `${rotulo}: faixa de 5 anos errada (${faixa})`);
  await page.click('.cotacao[data-serie="juros"]');
  checa((await page.getAttribute('.cotacao[data-serie="juros"]', "aria-pressed")) === "true", `${rotulo}: série de juros não ficou marcada`);
  checa((await page.getAttribute('.cotacao[data-serie="inflacao"]', "aria-pressed")) === "false", `${rotulo}: série de inflação não soltou`);
  checa((await txt(page, "#ter-grafico-titulo")).includes("Juros básicos"), `${rotulo}: título do gráfico não mudou`);
  await page.click('.giz-botao[data-periodo="6"]');
  checa((await page.getAttribute("#ter-cursor", "max")) === "5", `${rotulo}: cursor de 6 meses deveria ir até 5`);
  await page.fill("#ter-cursor", "0");
  const leitura = await txt(page, "#ter-leitura");
  checa(leitura.includes("mai/2026") && leitura.includes(fmt(serie.juros[112]) + "%"), `${rotulo}: leitura do cursor errada (${leitura})`);
  checa((await page.locator("#ter-grafico circle.cursor-ponto").count()) === 1, `${rotulo}: cursor sem ponto`);
  await page.click('.cotacao[data-serie="inflacao"]');
  await page.click('.giz-botao[data-periodo="12"]');
  if (capturas) await capturar(page, "#termometro", `funcao-termometro${sufixo}`);

  /* ---------- Pedido ---------- */
  await page.click('#form-pedido button[type="submit"]');
  checa(!(await page.isHidden("#pedido-erro")), `${rotulo}: pedido vazio passou`);
  checa((await page.evaluate(() => document.activeElement.id)) === "nome", `${rotulo}: foco não foi para o primeiro erro`);
  checa((await txt(page, "#pedido-erro")).startsWith("Faltam 6 itens"), `${rotulo}: contagem de erros (${await txt(page, "#pedido-erro")})`);
  await page.fill("#nome", "Joana de Teste");
  await page.fill("#email", "joana@exemplo");
  await page.fill("#telefone", "65999990000");
  checa((await page.inputValue("#telefone")) === "(65) 99999-0000", `${rotulo}: máscara do telefone (${await page.inputValue("#telefone")})`);
  await page.selectOption("#tipo", "viabilidade");
  await page.check('input[name="prazo"][value="15"]');
  await page.fill("#mensagem", "curto");
  await page.click('#form-pedido button[type="submit"]');
  checa(!(await page.isHidden("#email-erro")), `${rotulo}: e-mail incompleto passou`);
  checa(!(await page.isHidden("#mensagem-erro")), `${rotulo}: mensagem curta passou`);
  checa(!(await page.isHidden("#ciente-erro")), `${rotulo}: sem ciência passou`);
  checa((await page.evaluate(() => document.activeElement.id)) === "email", `${rotulo}: foco não foi para o e-mail`);
  await page.fill("#email", "joana@exemplo.com.br");
  await page.fill("#mensagem", "Quero saber se vale abrir uma segunda loja no próximo ano.");
  await page.check("#ciente");
  if (capturas) await capturar(page, "#pedido", `funcao-pedido${sufixo}`);
  await page.click('#form-pedido button[type="submit"]');
  await page.waitForSelector("#pedido-resumo:not([hidden])");
  checa(/^ME-\d{4}-\d{3}$/.test(await txt(page, "#res-protocolo")), `${rotulo}: protocolo fora do padrão`);
  checa((await txt(page, "#res-tipo")) === "Estudo de viabilidade", `${rotulo}: resumo sem o tipo`);
  checa((await txt(page, "#res-prazo")) === "Em 15 dias", `${rotulo}: resumo sem o prazo`);
  checa((await txt(page, "#res-entrega")).startsWith("até "), `${rotulo}: resumo sem a entrega (${await txt(page, "#res-entrega")})`);
  checa((await txt(page, "#res-telefone")) === "(65) 99999-0000", `${rotulo}: resumo sem o telefone`);
  checa((await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length)) === 0, `${rotulo}: algo foi parar no armazenamento do navegador`);
  if (capturas) await capturar(page, "#pedido", `funcao-pedido-resumo${sufixo}`);
  await page.click("#res-editar");
  checa(!(await page.isHidden("#form-pedido")), `${rotulo}: corrigir não voltou ao formulário`);
  checa((await page.inputValue("#nome")) === "Joana de Teste", `${rotulo}: corrigir perdeu o nome`);
  await page.click('#form-pedido button[type="submit"]');
  await page.waitForSelector("#pedido-resumo:not([hidden])");
  await page.click("#res-novo");
  checa((await page.inputValue("#nome")) === "", `${rotulo}: novo pedido não limpou`);
  checa(await page.isHidden("#nome-erro") && await page.isHidden("#pedido-erro"), `${rotulo}: novo pedido deixou erro antigo`);

  /* Levar números do simulador e do financiamento para o pedido */
  await page.click("#sim-levar");
  checa((await page.inputValue("#mensagem")).startsWith("Simulei guardar R$ 500,00"), `${rotulo}: levar simulador não preencheu (${(await page.inputValue("#mensagem")).slice(0, 50)})`);
  checa((await page.inputValue("#tipo")) === "planejamento-pessoa", `${rotulo}: levar simulador não escolheu o tipo`);
  await page.click("#fin-levar");
  checa((await page.inputValue("#mensagem")).startsWith("Comparei um financiamento de R$ 280.000,00"), `${rotulo}: levar financiamento não preencheu (${(await page.inputValue("#mensagem")).slice(0, 60)})`);
}

/* O quadro de giz do topo: um título principal, o relevo em WebGL quando o aparelho tem WebGL2 e a conta de oferta e demanda. */
async function testaQuadro(page, nome) {
  const t = await page.evaluate(() => ({
    h1: document.querySelectorAll("h1").length, titulo: document.querySelector("h1").textContent.replace(/\s+/g, " ").trim(),
    canvas: !!document.querySelector(".hero > canvas"), temGl: (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; } })(),
    rtj: !!document.querySelector(".assinatura .rtj-vivo")
  }));
  checa(t.h1 === 1 && /Eu faço a conta\.\s?A decisão\s?continua sua\./.test(t.titulo), `${nome}: título principal (${t.h1}: ${t.titulo})`);
  checa(t.canvas === t.temGl, `${nome}: quadro em WebGL deveria ligar só com WebGL2 (tem ${t.temGl}, ligou ${t.canvas})`);
  checa(t.rtj, `${nome}: assinatura sem o RTJ vivo`);
  /* mexer na demanda muda o preço e a quantidade de equilíbrio, sempre para o mesmo lado */
  const ler = async () => { const v = await page.$$eval(".quadro-leitura dd", (l) => l.map((e) => e.textContent)); return { p: parseFloat(v[0].replace(/[^0-9,]/g, "").replace(",", ".")), q: parseFloat(v[1].replace(/\./g, "")) }; };
  const por = async (valor) => { await page.$eval(".quadro-faixa input", (el, val) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(val)); el.dispatchEvent(new Event("input", { bubbles: true })); }, valor); await espera(1500); return ler(); };
  const meio = await por(50), mais = await por(100), menos = await por(0);
  checa(perto(meio.p, 14.85, 0.6) && perto(meio.q, 310, 20), `${nome}: equilíbrio no meio fora do esperado (R$ ${meio.p}, ${meio.q})`);
  checa(mais.p > meio.p && mais.q > meio.q, `${nome}: mais demanda deveria subir preço e quantidade (${JSON.stringify(mais)})`);
  checa(menos.p < meio.p && menos.q < meio.q, `${nome}: menos demanda deveria baixar preço e quantidade (${JSON.stringify(menos)})`);
  checa(/Menos procura/.test(await page.textContent("#hero-leitura")), `${nome}: a leitura do quadro não acompanhou a demanda`);
  await por(50);
}

/* Com movimento reduzido nada fica escondido esperando animação; sem JavaScript o título e o aviso aparecem. */
async function testaCalmo(browser) {
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto(URL, { waitUntil: "networkidle" }); await espera(900);
  const escondidos = await p.evaluate(() => [...document.querySelectorAll(".linha, .sobe, .quadro-area > span")].filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length);
  checa(escondidos === 0, `movimento reduzido: ${escondidos} elementos escondidos`);
  checa(!(await p.evaluate(() => !!document.querySelector(".rtj-vivo canvas"))), "movimento reduzido: o RTJ deveria ficar parado");
  await c.close();
  const s = await browser.newContext({ viewport: { width: 390, height: 800 }, javaScriptEnabled: false });
  const q = await s.newPage();
  await q.goto(URL);
  checa((await q.locator("h1").count()) === 1 && /Eu faço a conta/.test(await q.textContent("h1")), "sem JavaScript: título principal ausente");
  checa(await q.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "sem JavaScript: rolagem horizontal");
  await s.close();
  console.log("movimento reduzido e sem JavaScript: ok (falhas até aqui " + falhas.length + ")");
}

(async () => {
  if (CAPTURAS) fs.mkdirSync(CAP_DIR, { recursive: true });
  const proc = await servidor();
  const browser = await chromium.launch();
  const cenarios = [
    { nome: "1280x900", ctx: { viewport: { width: 1280, height: 900 } }, sufixo: "" },
    { nome: "iPhone 13", ctx: { ...devices["iPhone 13"] }, sufixo: "-celular" },
    { nome: "320px", ctx: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, sufixo: "" }
  ];
  try {
    for (const c of cenarios) {
      const context = await browser.newContext(c.ctx);
      const page = await context.newPage();
      const erros = [];
      page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") erros.push(`${m.type()}: ${m.text()}`); });
      page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
      page.on("requestfailed", (r) => erros.push("requestfailed: " + r.url()));
      const externas = [];
      page.on("request", (r) => { if (!r.url().startsWith(`http://127.0.0.1:${PORTA}/`) && !r.url().startsWith("data:")) externas.push(r.url()); });
      await page.addInitScript(() => { window.__csp = []; document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(e.effectiveDirective + " " + e.blockedURI)); });
      await page.goto(URL, { waitUntil: "networkidle" });
      await espera(3600); /* o giz leva uns 2,6 s para desenhar as curvas */
      await verificacoesBasicas(page, c.nome + " (abertura)");
      await testaQuadro(page, c.nome);

      await page.keyboard.press("Tab");
      const ativo = await page.evaluate(() => document.activeElement.className);
      checa(ativo.includes("pular"), `${c.nome}: primeiro Tab não foi para "Pular para o conteúdo" (${ativo})`);
      await page.mouse.click(5, 5);

      const capturas = CAPTURAS && c.nome !== "320px";
      if (capturas) await page.screenshot({ path: path.join(CAP_DIR, `capa${c.sufixo || "-desktop"}.png`) });

      if (c.nome !== "1280x900") {
        await page.click(".menu-botao");
        checa((await page.getAttribute(".menu-botao", "aria-expanded")) === "true", `${c.nome}: menu não abriu`);
        await page.click('#menu a[href="#simulador"]');
        checa((await page.getAttribute(".menu-botao", "aria-expanded")) === "false", `${c.nome}: menu não fechou ao clicar`);
      }
      await testaFuncoes(page, c.nome, capturas, c.sufixo);
      await verificacoesBasicas(page, c.nome + " (após uso)");

      /* redimensionar redesenha os gráficos */
      if (c.nome === "1280x900") {
        await page.setViewportSize({ width: 600, height: 900 }); await espera(500);
        await graficoOk(page, "#sim-grafico", "redimensionado 600", 3);
        await graficoOk(page, "#ter-grafico", "redimensionado 600 (termômetro)", 1);
        await page.setViewportSize({ width: 1280, height: 900 }); await espera(400);
      }

      await page.goto(URL + "404.html", { waitUntil: "networkidle" });
      await verificacoesBasicas(page, c.nome + " (404)");

      /* "GL Driver Message" é aviso do driver de vídeo da máquina de teste (WebGL por software), não do site. */
      const errosReais = erros.filter((e) => !/404\.html|favicon|GL Driver Message/.test(e) || /pageerror/.test(e));
      checa(errosReais.length === 0, `${c.nome}: console: ${errosReais.join(" | ")}`);
      checa(externas.length === 0, `${c.nome}: pedidos externos: ${externas.join(" | ")}`);
      console.log(`${c.nome}: ok (console ${errosReais.length}, pedidos externos ${externas.length}, falhas até aqui ${falhas.length})`);
      const csp = await page.evaluate(() => window.__csp);
      checa(csp.length === 0, `${c.nome}: violação da política de segurança (CSP): ${csp.join(" | ")}`);
      await context.close();
    }
    await testaCalmo(browser);

    if (SHOTS_DIR) {
      fs.mkdirSync(SHOTS_DIR, { recursive: true });
      const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await d.goto(URL, { waitUntil: "networkidle" }); await espera(2000);
      await d.screenshot({ path: path.join(SHOTS_DIR, `${SLUG}-desk.png`) });
      await d.close();
      const ctx = await browser.newContext({ ...devices["iPhone 13"] });
      const m = await ctx.newPage();
      await m.goto(URL, { waitUntil: "networkidle" }); await espera(2000);
      await m.screenshot({ path: path.join(SHOTS_DIR, `${SLUG}-cel.png`) });
      await ctx.close();
    }
  } finally {
    await browser.close();
    proc.kill();
  }

  if (falhas.length) {
    console.error("\nFALHAS:\n- " + falhas.join("\n- "));
    process.exit(1);
  }
  console.log("\nTodos os testes passaram.");
})().catch((e) => { console.error(e); process.exit(1); });
