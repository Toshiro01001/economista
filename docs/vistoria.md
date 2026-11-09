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
