# Identidade visual: Marginal Estudos Econômicos

Estudo curto feito antes do código. Tudo aqui é fictício: a economista, o registro no conselho, o endereço, o telefone, as séries do termômetro e os números das simulações.

## Nome e posicionamento

**Marginal Estudos Econômicos.** Economista independente em Cuiabá: análise de cenários, planejamento financeiro de empresas e de pessoas, estudos de viabilidade e pareceres econômicos.

Frase de posicionamento: **"O número, o cenário e a dúvida, nessa ordem."**

"Marginal" é a palavra do economista para "o que muda quando se acrescenta mais uma unidade": o custo marginal, a decisão na margem. A marca fala de decisão, não de dinheiro guardado. Por isso o site não tem moeda dourada, seta subindo para sempre nem azul de banco. Ele tem papel quadriculado, quadro de giz, lápis vermelho de professor e régua de escala logarítmica.

## Paleta

Não repete os papéis creme e os verdes e petróleos dos sites de contabilidade e de consultoria, nem o azul-tinta do advogado. A base é um papel com leve tom lilás (papel milimetrado de caderno), a tinta é um violeta quase preto, e o quadro de giz é ameixa escura.

| Papel | Nome | Hex | Uso |
|---|---|---|---|
| Fundo | Papel | `#F3F2F7` | fundo geral e do hero (com quadriculado) |
| Fundo 2 | Papel marcado | `#E8E5F0` | seções de ferramenta (simulador e pedido) |
| Linha fina | Quadriculado | `#D8D3E4` | grade do papel e dos gráficos (nunca para texto) |
| Texto | Tinta | `#1F1830` | texto, títulos, botão principal, linha "nominal" |
| Texto 2 | Grafite | `#5A5170` | legendas, rótulos, eixos |
| Borda de campo | Traço | `#6F6686` | contorno de campos e de linhas de tabela |
| Destaque | Lápis vermelho | `#B82E1D` | o único destaque: o número ou a linha "que importa" em cada tela |
| Quadro | Quadro de giz | `#2B2339` | faixa de demonstração, termômetro, rodapé |
| Quadro 2 | Quadro claro | `#3A3050` | linha selecionada no quadro |
| Giz | Giz | `#F3EFE4` | texto no quadro |
| Giz suave | Giz apagado | `#C9C2D8` | legendas no quadro |
| Giz amarelo | Giz amarelo | `#EBD36B` | a linha do gráfico e o número no quadro |

Regras de uso:
- O Lápis vermelho aparece uma vez por tela: o número "vale hoje" no simulador, a linha SAC no comparador, o grifo de erro nos formulários. Nunca como fundo de seção.
- No quadro de giz, o amarelo faz o papel do vermelho: um único número ou linha por tela.
- Sem gradiente decorativo, sem sombra em cartão. A hierarquia vem de linha, espaço e peso. As únicas "grades" em CSS são o quadriculado do hero (papel) e o ícone do menu.
- Contraste medido (WCAG): Tinta sobre Papel 15,3:1; Grafite sobre Papel 6,6:1 e sobre Papel marcado 5,9:1; Lápis sobre Papel 5,5:1 e sobre Papel marcado 4,9:1 (texto grande); Giz sobre Quadro 13,0:1; Giz apagado sobre Quadro 8,7:1 e sobre Quadro claro 7,1:1; Amarelo sobre Quadro 10,0:1 e sobre Quadro claro 8,2:1. Tudo AA.

## Tipografia

Duas famílias, ambas SIL Open Font License 1.1, locais em `fonts/` com a licença ao lado (nenhum CDN):

- **Zilla Slab** (Mozilla): títulos, todos os números grandes, valores de tabela, rótulos de eixo e a frase de posicionamento em itálico. É uma serifa de pé quadrado, com cara de caderno de séries e de tabela de jornal econômico, e tem algarismos lineares e tabulares. Pesos 500 (números, tabelas) e 700 (títulos), mais itálico 400 para frases de apoio. Nunca em caixa alta.
- **Atkinson Hyperlegible** (Braille Institute): texto corrido, botões, formulários e legendas. Desenhada para máxima legibilidade, boa para quem lê números e instruções com pressa. Pesos 400 (corpo) e 700 (botões e rótulos).

Escala (base 17px no computador, 16px no celular):

| Papel | Tamanho | Família e peso | Entrelinha |
|---|---|---|---|
| Título do hero | 37 a 64px (clamp) | Zilla Slab 700 | 1,04 |
| Título de seção | 29 a 43px (clamp) | Zilla Slab 700 | 1,1 |
| Subtítulo | 22 a 24px | Zilla Slab 700 | 1,2 |
| Corpo | 17px (16px no celular) | Atkinson 400 | 1,6 |
| Legenda e rótulo | 14 a 15px | Atkinson 400/700 | 1,4 |
| Número-resultado | 23 a 51px (clamp) | Zilla Slab 500, tabular | 1,05 a 1,15 |

Regra de peso: títulos sempre 700; números sempre 500 (700 fica pesado); nada em caixa alta.

## Layout

- Largura máxima de 1120px, margem lateral de 24px (20px no celular, 16px abaixo de 340px). Alinhamento à esquerda em tudo.
- Ritmo em múltiplos de 8px; seções respiram 96px no computador e 64px no celular.
- Cada seção abre com um título e uma frase que diz o que ela é e o que fazer. Sem numeração, sem rótulo em caixa alta acima do título.
- Sem cartões iguais com sombra: serviços são blocos com filete de 2px no topo; resultados são números sobre filetes; o resumo do pedido é o único bloco com moldura.
- Cantos de 3px em botões e campos, 4px em molduras de gráfico e foto.

## Imagem forte e movimento

Hero: uma foto editorial de quadro de giz com as curvas de oferta e demanda (gerada por IA no Canva, ver "Foto do hero"), em moldura 3:2 sobre papel quadriculado. Embaixo do hero, uma **régua de escala logarítmica** (as marcas 1 a 9 se repetem em quatro décadas).

Movimento: um só momento orquestrado, a régua logarítmica "sendo puxada" da esquerda para a direita na abertura (1,5s). Os demais movimentos respondem ao visitante: o gráfico se redesenha quando um número muda, o cursor do termômetro acompanha o controle deslizante. `prefers-reduced-motion` desliga a animação e a rolagem suave.

## Foto do hero

Proporção esperada: **3:2** (1600 x 1067 px), salva como `img/hero.webp`. O arquivo final tem 1620 x 1080 px (gerada por IA no Canva).

Prompt em português para o Canva:

> Fotografia editorial, estilo de site premium, de um quadro de giz escuro cor ameixa (violeta quase preto, #2B2339), levemente poeirento, em ambiente de sala de estudo sem pessoas. No quadro, desenhadas à mão com giz branco e giz amarelo, duas curvas que se cruzam, uma descendente e uma ascendente, como oferta e demanda, com os dois eixos e um pequeno ponto vermelho (#B82E1D) no cruzamento; na mesa de madeira clara em primeiro plano, fora de foco, um caderno quadriculado e um lápis vermelho. Luz suave de janela vindo da esquerda, sombras longas e delicadas, profundidade de campo rasa, tons frios e sóbrios, composição com respiro à direita. Sem texto, sem números, sem letras, sem logotipos, sem pessoas e sem rostos. Proporção 3:2.

## Funções do site

- Simulador de juros compostos e inflação (aporte, prazo, taxa, correção), gráfico em SVG de valor nominal x valor real, aviso de que é simulação.
- Comparador de financiamento Price x SAC, com tabela e gráfico das parcelas.
- Termômetro com séries fictícias (inflação, juros, câmbio) filtráveis por período, rotuladas como inventadas.
- Pedido de estudo com validação e resumo na tela.

## Design systems aplicados (leva final)

Dupla escolhida no catálogo da Mil e Uma Linhas!: **open-design-design-system** (claro: papel com grão, réguas hairline, anéis tracejados, placa de figura com cantos e anotações) e **auragen-design-system** (escuro: cartões de vidro com grade de pontos, grade de opções segmentada, barra de progresso, título com máscara em degradê, rodapé em colunas com barra de chamada). A paleta não mudou: o open-design entra com Papel no lugar do pergaminho, Tinta no lugar do preto quente, Lápis vermelho no lugar do coral (uma vez por tela) e Traço/Quadriculado nas réguas; o auragen entra só nas faixas de Quadro de giz (termômetro e rodapé), com Quadro no lugar do azul-noite, Quadro claro nos painéis, Giz apagado nas bordas a 10% e Giz amarelo no lugar do índigo. Sem biblioteca externa, sem WebGL: tudo em CSS e JavaScript próprios, com os movimentos desligados em `prefers-reduced-motion`.

Componentes e onde estão:

| Padrão | Origem | Onde |
|---|---|---|
| Paper ground (manchas radiais e grão SVG em multiply a 6%) | open-design | `body::before`, fixo, por cima do quadriculado |
| Hero plate (cantos de 22px, anotações "fig. 01" e "oferta e demanda", placa fosca "quadro de giz, Cuiabá") | open-design | `.hero-placa` e `.hero-moldura` |
| Twin marquee wire (duas fitas de termos em sentidos opostos, 60s, CSS puro) | open-design | `.fio`, logo abaixo da régua do hero |
| Section rule (ponto Lápis vermelho, hairline Traço e meta à direita) | open-design | `.secao-regua` acima de cada h2 |
| Pills com contagem (todos, empresas, pessoas) | open-design | `.pilulas` em #servicos; a variação de cada série do termômetro também virou pílula |
| Capability card (hover de 3px e círculo com seta que preenche em Lápis vermelho) | open-design | `.servico` e `.servico-seta` |
| Dashed number ring (anel tracejado de 40px com os dias) | open-design | `.servico-prazo .anel` |
| Primary pill com sombra e seta, ghost com ícone de mais | open-design | `.botao-principal` e `.botao-contorno` (raio 3px mantido) |
| Site chrome que se esconde ao descer e volta ao subir | open-design | `.topo` (classe `topo-oculto`, 360ms) |
| Glass card com grade de pontos a 8% e halo que segue o ponteiro | auragen | `.cotacao` em #termometro |
| Progress bar com preenchimento em Giz amarelo | auragen | `#ter-cursor` (variável `--valor`) |
| Segmented option grid (5 colunas, 3 no celular) | auragen | `.quadro-barra .giz-botao` |
| Gradient-masked display type | auragen | h2 de #termometro |
| Footer columns + glass CTA bar | auragen | `.rodape-cta` e `.rodape-grade` (três colunas) |

Imagens da leva final (geradas por IA no Canva, ilustrativas; os arquivos em `img/` são as versões finais, no tamanho e proporção certos):

| Arquivo | Proporção | Onde |
|---|---|---|
| `img/mesa-estudo-caderno.webp` | 4:3 (1456x1088) | `.servicos-foto`, cabeçalho de #servicos |
| `img/economista-quadro-perfil.webp` | 3:4 (1088x1456) | `.retrato-foto`, ao lado da mesa |
| `img/servico-cenarios-folhas.webp` | 1:1 (1024x1024) | foto do serviço "Análise de cenários" |
| `img/servico-planejamento-caderno.webp` | 1:1 (1024x1024) | foto do serviço "Planejamento financeiro" |
| `img/servico-viabilidade-regua.webp` | 1:1 (1024x1024) | foto do serviço "Estudo de viabilidade" |
| `img/servico-parecer-documento.webp` | 1:1 (1024x1024) | foto do serviço "Parecer econômico" |
| `img/sala-estudo-quadro.webp` | 4:5 (1088x1360) | `.pedido-foto`, coluna direita de #pedido (some quando o resumo aparece) |
