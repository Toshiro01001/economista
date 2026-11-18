# Vistoria de segurança: Marginal Estudos Econômicos (demonstração)

Data: 08/11/2026. Escopo: o site estático inteiro (`index.html`, `404.html`, `css/`, `js/`, `img/`, `fonts/`).

## O que foi conferido

- **Política de segurança de conteúdo (CSP)** em `index.html`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'`. Não há `<script>` nem `style` inline, nem atributo `style` escrito no HTML. O JavaScript só muda a página pela árvore de elementos (DOM) e nunca monta HTML a partir do que o visitante digita: tudo entra por `textContent`. A página 404 usa `script-src 'none'`.
- **Nenhum envio de dados.** Os formulários têm `novalidate` e `preventDefault`, `form-action 'none'` e `connect-src 'none'` impedem envio mesmo se o código errasse. O teste automático confere que nenhuma requisição sai do servidor local.
- **O que fica no navegador:** nada. Não há `localStorage`, `sessionStorage`, cookies nem IndexedDB. O teste confere que o armazenamento está vazio depois de usar o pedido de estudo. Ao fechar a página, tudo some.
- **Dependências:** nenhuma. Sem framework, sem CDN, sem analytics. As duas fontes (Zilla Slab e Atkinson Hyperlegible, licença SIL OFL) estão em `fonts/`.
- **Links externos:** um só, para https://mileumalinhas.com.br, com `rel="noopener"`.
- **Dados:** empresa, pessoa, registro profissional, endereço, telefone, protocolos e séries do termômetro são inventados e estão sinalizados. Não há senha, chave nem dado pessoal real no repositório.
- **Entrada do visitante:** os números são lidos por uma função que só aceita padrões numéricos e têm limites (por exemplo, anos de 1 a 50, prazo de 12 a 420 meses), o que evita contas absurdas e travamento. O e-mail e o telefone são validados no formato, sem consulta externa.

## Riscos residuais

- O GitHub Pages não permite cabeçalhos HTTP próprios, então a CSP vai em `<meta>`: ela não cobre `frame-ancestors` (o site poderia ser aberto dentro de um quadro de outro site). Risco baixo: não há login nem dado sensível.
- Se o site virar um serviço real (com envio de pedidos), será preciso servidor, HTTPS próprio, validação no servidor, proteção contra robôs e política de privacidade (LGPD). Isso não existe aqui.
- As simulações são ilustrativas; o aviso na tela diz que não são recomendação de investimento nem proposta de crédito.

## Revisão de 08/11/2026 (leva final de design)

Revisão feita depois de aplicar os design systems da leva final e encaixar as fotos geradas por IA no Canva.

- **CSP:** a política do `index.html` é a mesma de antes da leva (conferida linha a linha). Continua sem `unsafe-inline`, sem `unsafe-eval` e sem origem externa.
- **Script e estilo inline:** nenhum `<script>` inline, nenhum `<style>` e nenhum atributo `style` nas páginas. Os efeitos novos mudam só classes, `textContent` e propriedades CSS pelo CSSOM, que a CSP permite.
- **Recursos externos:** nenhum script, fonte, imagem ou folha de estilo de fora. Os únicos links externos são de navegação comum (mileumalinhas.com.br e o perfil do GitHub).
- **Bibliotecas:** nenhuma entrou. Movimento, vidro, contadores e revelação ao rolar são CSS e JavaScript escritos à mão, desligados com `prefers-reduced-motion`.
- **innerHTML:** nenhum uso no JavaScript.
- **eval e Function:** nenhum uso.
- **Armazenamento:** o site não grava nada no navegador (sem `localStorage` e sem cookies).
- **Dados pessoais:** nenhum dado pessoal real entrou. Pessoas, empresas, telefones e endereços seguem fictícios. As fotos não retratam pessoas reais.
- **Imagens:** arquivos webp locais em `img/`, com `width`/`height`, `loading="lazy"` e `decoding="async"`. Nenhuma é carregada de outro domínio.
- **Testes:** `tests/site.cjs` passa em 1280x900, iPhone 13 e 320px, sem erro de console e sem rolagem horizontal.

## Revisão de 17/11/2026 (site refeito em React, com WebGL)

O site foi refeito no Padrão Premium. Mudou a forma de construir, então a vistoria foi refeita do zero.

| Ponto | Resultado |
|---|---|
| CSP | A mesma política de antes, sem afrouxar: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'`. O `404.html` usa `script-src 'none'`. |
| Violações de CSP na prática | Nenhuma. Os testes escutam o evento de violação nos três tamanhos de tela, com o quadro em WebGL e o RTJ vivo ligados. |
| Script e estilo inline | Nenhum `<script>` inline, nenhum `<style>`, nenhum atributo `style` no HTML. O programa aplica posições direto no elemento (CSSOM), o que a CSP permite. |
| Envio de dados | Nenhum. No arquivo compilado não há `fetch`, `XMLHttpRequest` nem `WebSocket`, e `connect-src 'none'` bloquearia qualquer tentativa. Os testes confirmam zero pedidos externos. |
| Armazenamento | Nenhum uso de `localStorage`, `sessionStorage`, cookies ou IndexedDB. |
| Código perigoso | Nenhum `eval`, `new Function` ou `document.write` no arquivo compilado. O código da página não usa `innerHTML` nem `dangerouslySetInnerHTML`. |
| Dependências | React 18.3.1, React DOM 18.3.1 e Lenis 1.3.27, compiladas dentro de `assets/`. `npm audit` nas dependências de produção: 0 vulnerabilidades em 17/11/2026. Licenças em `licencas/`. |
| WebGL | Dois shaders próprios (o quadro de giz e o RTJ vivo da assinatura), sem biblioteca e sem textura externa. Sem WebGL a página funciona igual. |
| Contas expostas | `window.Calc` e `window.SERIES_FICTICIAS` continuam à vista, como na versão anterior, para os testes conferirem os números. São só funções de conta e séries inventadas. |
| Links externos | Só https://mileumalinhas.com.br, com `rel="noopener"`. |
| Dados pessoais e segredos | Nenhum dado real. Economista, Corecon, endereço, telefone e séries são fictícios e marcados como tal. Nenhuma chave, token ou senha no repositório. |
| Código-fonte | Fica no repositório privado. Aqui só entra a página compilada. |
| Testes | `tests/site.cjs` passa em 1280x900, iPhone 13, 320 px, com movimento reduzido e sem JavaScript. |

Risco novo: o arquivo de programa passou a ter cerca de 224 KB (73 KB comprimido), por causa do React. O risco de interpretação continua o mesmo: as simulações são ilustrativas e estão avisadas em cada ferramenta.

## Raio-X do ProfitizeBuild depois de publicar (17/11/2026): 69/100

| Área | Nota |
|---|---|
| Velocidade | 66 |
| Celular | 100 |
| SEO | 82 |
| Pixel | 11 |
| Privacidade | 72 |

O que puxou a nota para baixo: no celular o JavaScript ocupa o aparelho por 3,4 s (o quadro de giz liga cedo demais e desenha pontos demais), as quatro fotos dos serviços pesam 309 KB para aparecer com 116 px, a primeira tela leva 2,5 s e o título tem 66 caracteres. A nota de Pixel é baixa porque o site não tem rastreador de anúncio, de propósito. Os ajustes de velocidade ficam em um ramo de teste até o dono pedir a publicação.

## Ajuste de velocidade (17/11/2026, ramo de teste `giz-leve`)

- O quadro de giz só liga depois que a página termina de carregar e o navegador fica livre.
- O quadro desenha menos pontos por vez (teto de 800 mil no celular e 1,5 milhão no computador) e, parado, redesenha a metade das vezes.
- O fiscal de fluidez decide nos 12 primeiros quadros, em vez de 100. Em aparelho que não acompanha, fica o desenho pronto e a régua continua funcionando.
- As quatro fotos dos serviços passaram de 1024 px para 256 px: de 309 KB para 26 KB no total.
- O título da aba passou de 66 para 52 caracteres.
- Medição local, em celular simulado com processador 4 vezes mais lento e WebGL por software: o tempo em que o aparelho fica ocupado caiu de cerca de 6,1 s para 2,5 s. É uma comparação entre as duas versões, não o número que o Raio-X vai dar.
- Segurança: nada mudou na CSP, nas dependências, nos links ou no envio de dados. O teste ganhou uma checagem nova: o quadro precisa aparecer de verdade depois de ligar.
