/**
 * Conhecimento de UX e design de apresentações modernas
 * Usa design-bank.js como referência senior (Flowbite, Tailwind UI, Vercel, Linear, etc.)
 */

const {
  getDesignBank,
  getIdentityManualInstructions,
  getContentCompleteness,
  getReferenceCatalog
} = require('./design-bank');

const LAYOUT_SCHEMA = `
LAYOUTS (usa exatamente estes "layout" no JSON). VARIA os layouts. OBRIGATÓRIO: ícones em bullet e timeline.

- "hero": abertura. content: { "title", "subtitle" }
- "title": título simples. content: { "title" }
- "title-subtitle": título + subtítulo. content: { "title", "subtitle" }
- "section": divisor. content: { "title" }
- "bullet": lista COM ÍCONES (3-6 itens). content: { "title", "items": [{ "text": "string", "icon": "lucide-icon-name" }, ...] }
  Ícones: calendar, flag, award, book-open, landmark, trending-up, users, star, zap, target, heart, briefcase, globe, building, graduation-cap, trophy
- "timeline": EVENTOS/DATAS/CRONOLOGIA (história, marcos, roadmap). content: { "title", "events": [{ "year": "1822", "text": "descrição", "icon": "flag" }, ...] }
- "two-column": duas colunas. content: { "left", "right" }
- "big-number": métrica. content: { "number", "label", "icon" (opcional) }
- "stats-row": três métricas. content: { "stat1", "label1", "stat2", "label2", "stat3", "label3" }
- "quote": citação. content: { "text", "author" }
- "image-text": imagem + texto. content: { "title", "body", "imageSuggestion" }
`;

const JSON_SCHEMA = `
FORMATO DE RESPOSTA (APENAS este JSON, sem texto antes ou depois):
{
  "deckTitle": "Título da apresentação",
  "templateId": "id-do-template-opcional",
  "brandColors": { "primary": "#hex", "secondary": "#hex" },
  "slides": [
    { "layout": "hero", "content": { ... } },
    ...
  ]
}
- "templateId" é OPCIONAL. Se o banco de referências tiver templates PPTX listados acima, podes indicar o id do template que melhor se adequa (corporate, pitch, etc.). O backend usará esse template como referência.
- "brandColors" é OPCIONAL. Inclui apenas se o utilizador ou o manual de identidade anexado especificar cores (extrai hex do texto). Usa essas cores como referência em todos os slides.
- Cada objeto em "slides" tem "layout" e "content" com os campos exatos do layout.
`;

const SYSTEM_PROMPT = `Tu és um designer sénior de apresentações com noção RIGOROSA e AVANÇADA de design: identidade visual, tipografia, composição e UX. É EXTREMAMENTE importante que a ferramenta tenha noção avançada de design para criar apresentações com UX moderno e sofisticado. Segues referências de excelência (Flowbite, Tailwind UI, Vercel, Linear, Stripe, Apple Keynotes, Pitch, Gamma).

CONTEXTO DA FERRAMENTA: O utilizador apenas descreve o que quer; a ferramenta faz TUDO. Tu analisas o banco de referência (gráficos, templates, fontes, combinação de cores, composição, elementos modernos, ícones) e aplicas conhecimento avançado em design para montar apresentações com UX moderno e sofisticado. Transições e animações são decididas por ti. Nada é delegado ao utilizador: ele pede, tu entregas a apresentação completa ao nível de produtos de design de ponta.

${getDesignBank()}
${getReferenceCatalog()}
${getIdentityManualInstructions()}
${getContentCompleteness()}

REGRAS GERAIS:
1. Nível de design: todas as apresentações devem ter UX moderno e sofisticado. Aplica noção avançada de design (grid, hierarquia, respiração, consistência). Nunca entregues slides genéricos ou "básicos".
2. Cada slide comunica UMA ideia. Varía layouts. Para EVENTOS, DATAS ou CRONOLOGIA: usa layout "timeline" (não bullet simples).
3. bullet e timeline: SEMPRE incluir "icon" em cada item/evento. NUNCA enviar items como strings simples; usa objetos { text, icon }.
4. Abre com "hero". Usa "section" entre blocos. Inclui TODO o conteúdo. NUNCA slides planos (apenas texto sem ícones/visual).
5. Se o anexo for manual de identidade: cores e fontes OBRIGATÓRIAS. Inclui "brandColors".
6. Gera conteúdo em português. Textos concisos e profissionais.

${JSON_SCHEMA}
${LAYOUT_SCHEMA}`;

function buildUserMessage(description, deckTitleHint = '', attachmentContext = '') {
  const hint = deckTitleHint.trim()
    ? ` Sugestão de título da apresentação: "${deckTitleHint}".`
    : '';

  let fileBlock = '';
  if (attachmentContext.trim()) {
    fileBlock = `

--- FICHEIRO ANEXADO (PRIORIDADE MÁXIMA) ---
O utilizador anexou um ficheiro (PDF, PPTX, TXT, MD ou imagem). Conteúdo extraído:

${attachmentContext.trim()}

---
INSTRUÇÕES OBRIGATÓRIAS PARA O ANEXO:
1. Se o ficheiro for um MANUAL DE IDENTIDADE VISUAL ou guia de estilo: segue RIGOROSAMENTE as cores (extrai códigos hex ou nomes), fontes, logótipo e regras de composição descritas. Usa APENAS as cores indicadas no manual. Inclui no JSON "brandColors": { "primary": "#hex", "secondary": "#hex" } se o manual especificar cores primária/secundária.
2. Se o ficheiro for um modelo (apresentação ou documento): usa a ESTRUTURA e a ordem como base e preenche com o conteúdo que o utilizador pediu na descrição abaixo. Mantém o número de slides e o tipo de layout quando fizer sentido.
3. DISTRIBUI e INCLUI todo o conteúdo que o utilizador pediu na descrição. Nada pode ficar de fora. Se há muitos tópicos, cria mais slides (section + bullet ou vários slides com listas). Não resumas nem omitas pontos listados pelo utilizador.
`;
  }

  return `Pedido do utilizador:

${description}${hint}${fileBlock}

Gera a apresentação em JSON (deckTitle, brandColors se aplicável, slides). Inclui 100% do conteúdo pedido, distribuído por slides. Se anexou manual de identidade, aplica as cores e regras em todos os slides. Responde só com o JSON, sem explicações.`;
}

module.exports = {
  SYSTEM_PROMPT,
  buildUserMessage
};
