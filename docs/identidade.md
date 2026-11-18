# Identidade visual da Marginal Estudos Econômicos

Versão de 17/11/2026. Mantém a ideia da versão de 08/11/2026 (quadro de giz, papel quadriculado e lápis vermelho) e a refaz no Padrão Premium, em React, com o quadro vivo em WebGL.

## Direção em cinco linhas

- **Produto**: uma economista independente que faz a conta e deixa a decisão com o cliente.
- **Caráter**: professora boa de quadro. Direta, sem economês, com o número antes da opinião.
- **Mundo**: sala de estudo: lousa ameixa, giz, caderno quadriculado e lápis vermelho de correção.
- **Momentos**: o giz riscando oferta e demanda ao abrir, o equilíbrio que anda quando a demanda muda, o número em lápis vermelho nos resultados.
- **Assinatura**: o quadro de giz vivo do topo.

## De onde veio

- **Sem modelo comprado**: esta página não gastou cópia do ProfitizeBuild. O quadro de giz é um shader escrito para este site.
- **Método**: roteiro da Criação Premium da M1L! (direção, estética, acabamento, movimento, revisão).
- **Estética de referência (CARI)**: sem uma estética do acervo como base. A referência é o material de sala de aula, que o site já tinha como identidade.

## Cores

| Nome | Código | Uso |
|---|---|---|
| Lousa | `#282136` | fundo do topo, do termômetro e do rodapé |
| Lousa funda | `#1D1727` | sombras da lousa, menu no celular |
| Giz | `#EEEAF4` | texto e a curva de demanda |
| Giz amarelo | `#EBD36B` | a curva de oferta, botão principal sobre a lousa, palavras em destaque |
| Papel | `#F3F2F7` | fundo quadriculado das seções claras |
| Tinta | `#1F1830` | texto e botão principal sobre o papel |
| Lápis vermelho | `#B82E1D` (`#E9614B` sobre a lousa) | o único destaque: ponto de equilíbrio, resultado principal, erros |

## Tipografia

- **Zilla Slab** 500 nos títulos e nos números de resultado; itálico 400 nas legendas do quadro e nas leituras.
- **Atkinson Hyperlegible** no texto, nos campos e nas tabelas. O zero cortado ajuda a não confundir zero com a letra O em valores.

## Forma

- Cantos de 3 a 4 px, contorno de tinta de 1,5 px e uma sombra dura deslocada, como folha sobre folha. Nada de pílula nem de vidro arredondado.
- Botão principal com uma linha de lápis vermelho por baixo.
- Papel quadriculado de 28 px nas seções claras.

## Movimento

- O giz desenha os eixos, depois a oferta, depois a demanda, em cerca de 2,6 s.
- Parado, o quadro balança a demanda bem devagar. Quando alguém mexe, ele obedece e para de balançar.
- Títulos sobem por linha. Fitas de termos correm em sentidos opostos.
- Com "reduzir movimento": quadro parado, tudo no estado final, RTJ parado.

## Fotos

Todas as fotos são ilustrativas e foram geradas por IA no Canva na versão anterior (o prompt da foto da lousa está no histórico deste arquivo, no Git). Nenhuma foto nova foi gerada nesta versão. A foto da lousa (`img/hero.webp`, 3:2, 1620x1080) aparece só quando o aparelho não tem WebGL2.
