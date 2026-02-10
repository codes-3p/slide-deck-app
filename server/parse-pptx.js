/**
 * Extrai o texto de cada slide de um ficheiro .pptx (buffer).
 * PPTX é um ZIP; os slides estão em ppt/slides/slideN.xml com texto em <a:t>.
 */
const JSZip = require('jszip');

const SLIDE_PATH_REGEX = /^ppt\/slides\/slide(\d+)\.xml$/;

function extractTextFromSlideXml(xmlString) {
  const texts = [];
  const regex = /<a:t>([^<]*)<\/a:t>/g;
  let m;
  while ((m = regex.exec(xmlString)) !== null) {
    if (m[1].trim()) texts.push(m[1].trim());
  }
  return texts.join(' ').trim() || '(sem texto)';
}

async function parsePptx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideNames = [];
  zip.forEach((relativePath) => {
    const match = relativePath.match(SLIDE_PATH_REGEX);
    if (match) slideNames.push({ path: relativePath, num: parseInt(match[1], 10) });
  });
  slideNames.sort((a, b) => a.num - b.num);

  const slides = [];
  for (const { path } of slideNames) {
    const file = zip.file(path);
    if (!file) continue;
    const xml = await file.async('string');
    const text = extractTextFromSlideXml(xml);
    slides.push(text);
  }
  return slides;
}

/**
 * Devolve uma string pronta para incluir no prompt da IA:
 * "Slide 1: ...\nSlide 2: ..."
 */
async function pptxToPromptContext(buffer) {
  const slides = await parsePptx(buffer);
  if (slides.length === 0) return '';
  return slides.map((text, i) => `Slide ${i + 1}: ${text}`).join('\n');
}

module.exports = { parsePptx, pptxToPromptContext };
