# Portfólio | Tiago Santos

![Retrato de Tiago Santos](assets/perfil.webp)

Site pessoal de **Tiago Santos** — desenvolvedor Full Stack na Vittal Web e estudante de
Sistemas de Informação (Unex, 1º semestre), em Vitória da Conquista/BA.

Uma página única que apresenta quem ele é, o que constrói e os seis projetos publicados
com link ao vivo e repositório.

## Sobre o site

Site estático de página única, escrito à mão em HTML, CSS e JavaScript — **sem framework,
sem build e sem dependência de CDN em runtime**. A raiz do repositório é o próprio site.

Seções: `#top` (hero) → `#sobre` → `#experiencia` → `#projetos` → `#stack` → `#formacao`
→ `#contato`.

### Direção visual

Sistema editorial em cima de uma base clara (`#f9f9f7`) alternando com faixas escuras
(`#0a0a0c`): tipografia grande, seções numeradas, granulado sutil, marquee e uma faixa de
stack com rolagem horizontal. O HUD fixo usa `mix-blend-mode: difference` para se manter
legível sobre qualquer fundo.

- **Display:** Space Grotesk (self-hosted)
- **Texto:** Inter (self-hosted)
- **Mono:** JetBrains Mono (self-hosted)

### Movimento

Todo o efeito é progressivo: o conteúdo aparece sem JavaScript e toda animação é
desligada em `prefers-reduced-motion: reduce`. Entrada em cascata dos cards, letras do
título em stagger, barra de progresso da leitura, revelação por recorte das imagens,
revelação localizada da cor natural das fotos e degradê colorido nos textos sob o ponteiro,
além da deriva do texto gigante conforme o scroll — tudo em JS vanilla, com
`requestAnimationFrame` e listeners `passive`.

## Rodando localmente

```bash
# qualquer servidor estático, na raiz do repo
python3 -m http.server 8000
# ou
npx serve .
```

Abra <http://localhost:8000>.

## Testes

Suíte de integridade, estrutura, conteúdo e movimento em Node.js puro — zero
dependências, sem `package.json`.

```bash
node --test tests/*.test.mjs
```

Os testes verificam, entre outras coisas: ausência de CDN externa, assets referenciados
que existem, hierarquia de headings, alt e dimensões de toda imagem, âncoras internas
válidas, fatos reais (projetos, links, formação, localização), ausência de métricas
fabricadas e a garantia de que o conteúdo continua visível sem JavaScript.

## Deploy

Publicado na Render apontando para a raiz do repositório — não há etapa de build.
O domínio canônico está em `<link rel="canonical">` no `<head>`.

## Contato

- LinkedIn: <https://www.linkedin.com/in/tiago-santos-b10165376/>
- GitHub: <https://github.com/Tyago-santos>
- Instagram: <https://www.instagram.com/tiago_skywalker/>
- Facebook: <https://www.facebook.com/osmon.santos.9>
- E-mail: <mailto:xlzthyago@gmail.com>
