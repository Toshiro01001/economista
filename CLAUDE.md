# Marginal Estudos Econômicos (vitrine)

Site de demonstração de uma economista independente fictícia em Cuiabá (cenários, planejamento financeiro, viabilidade e pareceres), feito pela Mil e Uma Linhas! para mostrar a clientes dessa profissão. Desde 17/11/2026 a página é feita em React e chega aqui já compilada: `index.html` carrega o programa, o estilo e as fontes de `assets/` (arquivos compilados, não edite à mão). A fonte fica no repositório privado `mil-e-uma-linhas-conteudo`, em `vitrines-fonte/marginal-giz/`, e `node publicar.mjs` compila e copia para cá. Tudo é fictício, inclusive as séries do termômetro e os números das simulações. O `README.md` explica a organização dos arquivos e `docs/identidade.md` a identidade visual.

## Regras de trabalho

- Responda em português do Brasil, sem travessões, e chame o dono de Rodrigo Jr.
- Altere só o que foi pedido. Publicar ou fazer merge no `main` depende de pedido dele.
- Toda função criada ou alterada precisa funcionar também no celular. Teste a versão mobile, não só a de computador.
- Ao criar ou alterar o site, explique como funciona.
- Ao terminar uma alteração, entregue a mensagem de commit em dois blocos rotulados: "Título" (até 50 caracteres) e "Descrição" (estendida, com exatamente o que foi feito).
- Entregue arquivos soltos, nunca em `.zip`.
- O repositório é público: não coloque senhas, chaves secretas nem dados pessoais em arquivos versionados.
- A foto da lousa (`img/hero.webp`) é uma foto gerada por IA no Canva e aparece só quando o aparelho não tem WebGL2. Ao trocar, mantenha 3:2 e 1620x1080.
- O quadro de giz do topo usa WebGL. Todo efeito precisa ter versão parada: a página funciona inteira sem WebGL, no celular e com "reduzir movimento".
- Sem CDN, sem fonte externa, sem analytics, sem script ou estilo inline: a Content-Security-Policy do `index.html` é restritiva e deve continuar assim.
- O rodapé leva a assinatura M1L! | RTJ com o RTJ vivo (`img/marca/`). Não redesenhe as duas marcas.
