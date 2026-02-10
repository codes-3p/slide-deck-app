/**
 * Exporta deck para .pptx no servidor (Node). Usado pela rota POST /api/export-pptx.
 */
const PptxGenJS = require('pptxgenjs');

const SLIDE_W = 10;
const MARGIN = 0.5;

function addSlideContent(pptx, slide, layout, content) {
  const c = content || {};
  const opts = (overrides) => ({ x: MARGIN, w: SLIDE_W - 2 * MARGIN, fontSize: 14, color: '363636', ...overrides });

  if (layout === 'hero' || layout === 'title-subtitle') {
    slide.addText(c.title || 'Título', opts({ y: 1.5, h: 1, fontSize: 28, align: 'center' }));
    if (c.subtitle) slide.addText(c.subtitle, opts({ y: 2.6, h: 0.8, fontSize: 16, align: 'center' }));
    return;
  }
  if (layout === 'title' || layout === 'section') {
    slide.addText(c.title || 'Título', opts({ y: 2, h: 1, fontSize: 24, align: 'center' }));
    return;
  }
  if (layout === 'bullet') {
    slide.addText(c.title || '', opts({ y: 0.4, h: 0.5, fontSize: 18 }));
    const items = c.items || [];
    const bulletLines = items.map((it) => (typeof it === 'string' ? it : (it?.text || ''))).filter(Boolean);
    if (bulletLines.length) {
      slide.addText(bulletLines.map((t) => ({ text: t, options: { bullet: true } })), opts({ y: 1.1, h: 3.5, fontSize: 12 }));
    }
    return;
  }
  if (layout === 'timeline') {
    slide.addText(c.title || '', opts({ y: 0.4, h: 0.5, fontSize: 18 }));
    const events = c.events || [];
    const lines = events.map((e) => (e.year ? `${e.year} – ${e.text || ''}` : (e.text || '')));
    if (lines.length) {
      slide.addText(lines.map((t) => ({ text: t, options: { bullet: true } })), opts({ y: 1, h: 3.8, fontSize: 11 }));
    }
    return;
  }
  if (layout === 'two-column') {
    const half = (SLIDE_W - 2 * MARGIN) / 2;
    slide.addText(c.left || '', opts({ w: half - 0.2, y: 1, h: 2.5 }));
    slide.addText(c.right || '', opts({ x: MARGIN + half + 0.2, w: half - 0.2, y: 1, h: 2.5 }));
    return;
  }
  if (layout === 'big-number') {
    slide.addText(String(c.number ?? '0'), opts({ y: 1.2, h: 1.2, fontSize: 44, align: 'center' }));
    slide.addText(c.label || '', opts({ y: 2.5, h: 0.8, fontSize: 16, align: 'center' }));
    return;
  }
  if (layout === 'stats-row') {
    const w3 = (SLIDE_W - 2 * MARGIN) / 3;
    slide.addText([c.stat1 || '', c.label1 || ''].filter(Boolean).join('\n'), opts({ w: w3 - 0.2, y: 1.8, h: 1.2, fontSize: 12, align: 'center' }));
    slide.addText([c.stat2 || '', c.label2 || ''].filter(Boolean).join('\n'), opts({ x: MARGIN + w3, w: w3 - 0.2, y: 1.8, h: 1.2, fontSize: 12, align: 'center' }));
    slide.addText([c.stat3 || '', c.label3 || ''].filter(Boolean).join('\n'), opts({ x: MARGIN + 2 * w3, w: w3 - 0.2, y: 1.8, h: 1.2, fontSize: 12, align: 'center' }));
    return;
  }
  if (layout === 'quote') {
    slide.addText(c.text || '', opts({ y: 1.5, h: 1.5, fontSize: 18, align: 'center', italic: true }));
    slide.addText(c.author || '', opts({ y: 3.2, h: 0.5, fontSize: 12, align: 'center' }));
    return;
  }
  if (layout === 'image-text') {
    slide.addText(c.title || '', opts({ y: 0.4, h: 0.5, fontSize: 18 }));
    slide.addText(c.body || '', opts({ y: 1, h: 3, fontSize: 12 }));
    return;
  }
  slide.addText(c.title || 'Slide', opts({ y: 2, h: 1, fontSize: 20, align: 'center' }));
}

/**
 * Gera o buffer do ficheiro .pptx.
 * @param {Object} params
 * @param {string} params.deckTitle
 * @param {Array} params.slides
 * @returns {Promise<Buffer>}
 */
async function generatePptxBuffer({ deckTitle, slides }) {
  if (!slides || !slides.length) throw new Error('Sem slides');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = deckTitle || 'Apresentação';

  slides.forEach((s) => {
    const layout = s.layout || 'title';
    const content = s.content || {};
    const slide = pptx.addSlide();
    addSlideContent(pptx, slide, layout, content);
  });

  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.from(buffer);
}

function getFileName(deckTitle) {
  const base = (deckTitle || 'apresentacao').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 80) || 'apresentacao';
  return `${base}.pptx`;
}

module.exports = { generatePptxBuffer, getFileName };
