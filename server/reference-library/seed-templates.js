/**
 * Gera os primeiros templates PPTX da biblioteca e regista-os no catálogo.
 * Executar uma vez: node server/reference-library/seed-templates.js
 */
const path = require('path');
const fs = require('fs');
const { generatePptxBuffer } = require('../exportPptx');
const { addTemplateToCatalog, getTemplatesDir } = require('./catalogLoader');

const TEMPLATES_TO_CREATE = [
  {
    filename: 'corporate-professional.pptx',
    name: 'Corporate Professional',
    description: 'Template corporativo: hero, secção, lista com ícones e métricas. Ideal para apresentações de negócios, relatórios e propostas formais.',
    slideLayouts: [
      { index: 0, type: 'hero' },
      { index: 1, type: 'section' },
      { index: 2, type: 'bullet' },
      { index: 3, type: 'stats-row' }
    ],
    tags: ['corporate', 'business', 'formal', 'relatório'],
    slides: [
      { layout: 'hero', content: { title: 'Título da Apresentação', subtitle: 'Subtítulo ou tagline' } },
      { layout: 'section', content: { title: 'Contexto' } },
      { layout: 'bullet', content: { title: 'Principais pontos', items: [{ text: 'Ponto 1', icon: 'circle' }, { text: 'Ponto 2', icon: 'circle' }, { text: 'Ponto 3', icon: 'circle' }] } },
      { layout: 'stats-row', content: { stat1: '99%', label1: 'Satisfação', stat2: '10x', label2: 'Crescimento', stat3: '24h', label3: 'Suporte' } }
    ]
  },
  {
    filename: 'startup-dynamic.pptx',
    name: 'Startup Dynamic',
    description: 'Template dinâmico para pitch e startups: hero impactante, lista de benefícios e citação. Estilo moderno e direto.',
    slideLayouts: [
      { index: 0, type: 'hero' },
      { index: 1, type: 'bullet' },
      { index: 2, type: 'quote' }
    ],
    tags: ['startup', 'pitch', 'moderno', 'vendas'],
    slides: [
      { layout: 'hero', content: { title: 'O Futuro do Produto', subtitle: 'Uma linha que impacta' } },
      { layout: 'bullet', content: { title: 'Porquê nós', items: [{ text: 'Benefício 1', icon: 'zap' }, { text: 'Benefício 2', icon: 'target' }, { text: 'Benefício 3', icon: 'trending-up' }] } },
      { layout: 'quote', content: { text: 'Uma citação que convence.', author: '— Cliente ou Parceiro' } }
    ]
  }
];

async function seed() {
  const dir = getTemplatesDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const t of TEMPLATES_TO_CREATE) {
    const buffer = await generatePptxBuffer({ deckTitle: t.name, slides: t.slides });
    const filePath = path.join(dir, t.filename);
    fs.writeFileSync(filePath, buffer);
    addTemplateToCatalog({
      filename: t.filename,
      name: t.name,
      description: t.description,
      slideLayouts: t.slideLayouts,
      tags: t.tags
    });
    console.log('Criado:', t.filename);
  }
  console.log('Templates iniciais criados. Catálogo atualizado.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
