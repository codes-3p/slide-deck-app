# SlideDeck — Apresentações online com IA

Editor de apresentações no estilo [Beautiful.ai](https://beautiful.ai): slides com modelos inteligentes, **criação com IA** a partir de uma descrição, edição inline e modo apresentação.

## ✨ Criar apresentação com IA

A IA gera a estrutura e o conteúdo com base em **modelos de apresentação modernos** (referências: Apple Keynotes, Stripe, Linear, Vercel, Pitch, Gamma): uma ideia por slide, hierarquia visual, arco narrativo e tom consistente.

1. Entra na pasta do servidor e configura a API:
   ```bash
   cd server
   cp .env.example .env
   ```
2. Edita `.env` e coloca a tua chave OpenAI:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Instala dependências e inicia o servidor:
   ```bash
   npm install
   npm start
   ```
4. Abre no navegador **http://localhost:3788**
5. Clica em **✨ Criar com IA**, descreve a apresentação (tema, objetivo, o que queres em cada slide) e em **Gerar apresentação**.

**Anexar ficheiro como modelo (opcional):** Podes anexar **PPTX**, **PDF**, **TXT**, **MD** ou uma **imagem** (JPG, PNG, WebP, GIF). A IA extrai texto (PDF/PPTX/TXT/MD) ou analisa a imagem com visão e usa como modelo, preenchendo com os dados que pedires. Arrasta o ficheiro para a zona de anexo ou clica para escolher (máx. 15 MB).

Obtém a chave em [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Opcional: em `.env` podes definir `OPENAI_MODEL=gpt-4o` para melhor qualidade (mais custo).

## Como usar (editor)

1. Abre o site (servidor em **http://localhost:3788** ou, sem IA, apenas `index.html` no navegador).
2. Edita o título da apresentação na barra superior.
3. Clique em um slide na barra lateral para editá-lo.
4. Use os botões **Modelo do slide** para mudar o layout (Título, Lista, Duas colunas, etc.).
5. Clique em **+ Novo slide** para adicionar slides.
6. Nos miniaturas: **⎘** duplica o slide, **×** remove (se houver mais de um).
7. Clique em **Apresentar** (ou F5) para modo tela cheia. Use setas ← → ou Espaço para navegar e Esc para sair.

## Recursos

- **Criar com IA**: descreves a apresentação e a IA gera slides com UX moderna (um conceito por slide, storytelling, métricas, citações).
- **Anexar PPTX/PDF/TXT/MD ou imagem**: usa um ficheiro como modelo; a IA extrai texto (ou analisa a imagem) e preenche com o que pedires.
- **Modelos de slide**: Título, Título + Subtítulo, Lista, Duas colunas, Número grande, Citação, Seção
- **Tema**: botão 🎨 alterna entre tema escuro e claro
- **Desfazer/Refazer**: histórico de edição
- **Modo apresentação**: fullscreen com navegação por teclado

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (sem frameworks). Funciona offline para edição manual.
- **IA**: servidor Node.js (Express) + OpenAI; prompt com regras de UX e formato JSON para os slides.
