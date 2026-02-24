/**
 * API para geração de apresentações com IA
 * Requer OPENAI_API_KEY no ambiente
 * Aceita anexo opcional: PPTX, TXT, MD, PDF (texto) ou imagem (visão) para usar como modelo
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { SYSTEM_PROMPT, buildUserMessage } = require('./prompt');
const { getCompletion, getAvailableProviders, hasOpenAI, hasOpenRouter, hasAnthropic, hasGoogle } = require('./llm');
const { pptxToPromptContext, parsePptx } = require('./parse-pptx');
const { generatePptxBuffer, getFileName } = require('./exportPptx');
const {
  getCatalogForPrompt,
  getAllTemplates,
  loadCatalog,
  addTemplateToCatalog,
  getTemplatesDir
} = require('./reference-library/catalogLoader');
const { renderWithTemplate } = require('./pptxRendererClient');

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }); // 15 MB

// Valida e normaliza slides retornados pela IA
const LAYOUTS = ['hero', 'title', 'title-subtitle', 'bullet', 'timeline', 'two-column', 'big-number', 'stats-row', 'quote', 'section', 'image-text'];
const LUCIDE_ICONS = ['calendar', 'flag', 'award', 'book-open', 'landmark', 'trending-up', 'users', 'star', 'zap', 'target', 'heart', 'briefcase', 'globe', 'building', 'graduation-cap', 'trophy', 'circle', 'map-pin'];

function normalizeItem(i) {
  if (typeof i === 'string') return { text: i, icon: 'circle' };
  if (i && typeof i === 'object') return { text: String(i.text || i), icon: LUCIDE_ICONS.includes(i.icon) ? i.icon : 'circle' };
  return { text: String(i || ''), icon: 'circle' };
}

function normalizeSlide(slide) {
  if (!slide || typeof slide !== 'object') return null;
  const layout = LAYOUTS.includes(slide.layout) ? slide.layout : 'title';
  const content = slide.content && typeof slide.content === 'object' ? slide.content : {};

  const defaults = {
    hero: { title: 'Título', subtitle: '' },
    title: { title: 'Título' },
    'title-subtitle': { title: 'Título', subtitle: '' },
    bullet: { title: '', items: [{ text: 'Item 1', icon: 'circle' }, { text: 'Item 2', icon: 'circle' }, { text: 'Item 3', icon: 'circle' }] },
    timeline: { title: '', events: [{ year: '', text: '', icon: 'calendar' }] },
    'two-column': { left: '', right: '' },
    'big-number': { number: '0', label: '' },
    'stats-row': { stat1: '', label1: '', stat2: '', label2: '', stat3: '', label3: '' },
    quote: { text: '', author: '' },
    section: { title: 'Seção' },
    'image-text': { title: '', body: '', imageUrl: '', imageSuggestion: '' }
  };

  const defaultContent = defaults[layout] || defaults.title;
  const normalized = {};
  for (const key of Object.keys(defaultContent)) {
    const val = content[key];
    if (layout === 'bullet' && key === 'items') {
      normalized.items = Array.isArray(val) ? val.map(normalizeItem) : defaultContent.items;
    } else if (layout === 'timeline' && key === 'events') {
      const raw = Array.isArray(val) ? val : [];
      normalized.events = raw.map((e) => {
        if (typeof e === 'string') return { year: '', text: e, icon: 'calendar' };
        if (e && typeof e === 'object') return { year: String(e.year || ''), text: String(e.text || e.title || ''), icon: LUCIDE_ICONS.includes(e.icon) ? e.icon : 'calendar' };
        return { year: '', text: '', icon: 'calendar' };
      }).filter((e) => e.text || e.year);
      if (normalized.events.length === 0) normalized.events = defaultContent.events;
    } else {
      normalized[key] = val != null ? String(val) : defaultContent[key];
    }
  }
  return { layout, content: normalized };
}

function parseBrandColors(data) {
  const bc = data.brandColors;
  if (!bc || typeof bc !== 'object') return null;
  const primary = bc.primary && /^#[0-9A-Fa-f]{3,8}$/.test(String(bc.primary).trim()) ? String(bc.primary).trim() : null;
  const secondary = bc.secondary && /^#[0-9A-Fa-f]{3,8}$/.test(String(bc.secondary).trim()) ? String(bc.secondary).trim() : null;
  if (!primary && !secondary) return null;
  return { primary: primary || undefined, secondary: secondary || undefined };
}

function parseSlidesFromResponse(text) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Resposta da IA não contém JSON');
  const data = JSON.parse(jsonMatch[0]);
  const deckTitle = typeof data.deckTitle === 'string' ? data.deckTitle : 'Minha Apresentação';
  const templateId = typeof data.templateId === 'string' ? data.templateId.trim() || null : null;
  const rawSlides = Array.isArray(data.slides) ? data.slides : [];
  const slides = rawSlides.map(normalizeSlide).filter(Boolean);
  if (slides.length === 0) throw new Error('Nenhum slide válido gerado');
  const brandColors = parseBrandColors(data);
  return { deckTitle, slides, brandColors, templateId };
}

/**
 * Processa anexo e devolve { textContext, imageBuffer, imageMimeType }.
 * PDF/PPTX/TXT/MD → texto para o prompt; imagem → buffer+mime para a API de visão.
 */
async function getAttachmentContext(file) {
  const out = { textContext: '', imageBuffer: null, imageMimeType: null };
  if (!file || !file.buffer) return out;
  const ext = (file.originalname || '').toLowerCase().split('.').pop();
  const mime = (file.mimetype || '').toLowerCase();

  if (ext === 'pptx') {
    try {
      out.textContext = await pptxToPromptContext(file.buffer);
    } catch (e) {
      console.warn('Erro ao extrair PPTX:', e.message);
    }
    return out;
  }
  if (ext === 'txt' || ext === 'md') {
    out.textContext = file.buffer.toString('utf8');
    return out;
  }
  if (ext === 'pdf') {
    try {
      const data = await pdf(file.buffer);
      out.textContext = (data.text || '').trim() || '(PDF sem texto extraível)';
    } catch (e) {
      console.warn('Erro ao extrair PDF:', e.message);
    }
    return out;
  }
  if (IMAGE_EXTENSIONS.includes(ext) || IMAGE_MIMES.includes(mime)) {
    out.imageBuffer = file.buffer;
    out.imageMimeType = mime && IMAGE_MIMES.includes(mime) ? mime : 'image/jpeg';
    return out;
  }
  return out;
}

app.post('/api/generate', async (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return upload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ error: 'Ficheiro inválido ou demasiado grande (máx. 15 MB).' });
      next();
    });
  }
  next();
}, async (req, res) => {
  const description = req.body?.description ?? '';
  const deckTitleHint = req.body?.deckTitle ?? '';
  const file = req.file;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Campo "description" é obrigatório.' });
  }

  if (!hasOpenAI() && !hasOpenRouter() && !hasAnthropic() && !hasGoogle()) {
    return res.status(503).json({
      error: 'Nenhum provider configurado. Defina OPENAI_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY ou GOOGLE_API_KEY no .env.'
    });
  }

  try {
    const attachment = await getAttachmentContext(file);
    const userMessage = buildUserMessage(description, deckTitleHint, attachment.textContext);

    let userContent = userMessage;
    if (attachment.imageBuffer && attachment.imageMimeType) {
      userContent = [
        { type: 'text', text: userMessage + '\n\n[Imagem anexada: descreve o que vês e usa como referência visual. Gera o JSON da apresentação.]' },
        { type: 'image_url', image_url: { url: `data:${attachment.imageMimeType};base64,${attachment.imageBuffer.toString('base64')}` } }
      ];
    }

    const systemContent = SYSTEM_PROMPT + (await getCatalogForPrompt());
    const provider = req.body?.provider || undefined;
    const text = await getCompletion({
      provider,
      systemContent,
      userContent: userMessage,
      imageBuffer: attachment.imageBuffer || undefined,
      imageMimeType: attachment.imageMimeType || undefined
    });

    const { deckTitle, slides, brandColors, templateId } = parseSlidesFromResponse(text);
    // Se há templates e a IA não devolveu templateId, usar o primeiro template (export template-first)
    let finalTemplateId = templateId;
    if (!finalTemplateId) {
      const { templates } = await getAllTemplates();
      const local = (templates || []).filter((t) => t.source !== 'google_drive' && t.filename);
      if (local.length) finalTemplateId = local[0].id;
    }
    res.json({ deckTitle, slides, brandColors: brandColors || undefined, templateId: finalTemplateId || undefined });
  } catch (err) {
    console.error('Erro ao gerar apresentação:', err.message);
    if (err.message.includes('JSON')) {
      return res.status(502).json({ error: 'A IA não devolveu um formato válido. Tenta novamente.' });
    }
    if (err.code === 'insufficient_quota' || err.status === 429) {
      return res.status(429).json({ error: 'Limite da API excedido. Tenta mais tarde.' });
    }
    res.status(500).json({ error: err.message || 'Erro ao gerar apresentação.' });
  }
});

app.get('/api/health', (_, res) => {
  res.json({ ok: true, hasKey: hasOpenAI() || hasOpenRouter() || hasAnthropic() || hasGoogle() });
});

app.get('/api/providers', (_, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({ providers: getAvailableProviders() });
});

app.get('/api/reference-library/catalog', async (_, res) => {
  try {
    const merged = await getAllTemplates();
    res.json(merged);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const refLibMulter = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => {
      const dir = getTemplatesDir();
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_, file, cb) => {
      const safe = (file.originalname || 'template').replace(/[^\w.-]/g, '_');
      cb(null, safe.endsWith('.pptx') ? safe : `${safe}.pptx`);
    }
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || (file.originalname || '').toLowerCase().endsWith('.pptx');
    cb(null, !!ok);
  }
});
app.post('/api/reference-library/templates', refLibMulter.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Envia um ficheiro .pptx (campo "file").' });
  }
  const name = (req.body && req.body.name) ? String(req.body.name).trim() : req.file.originalname || req.file.filename;
  const description = (req.body && req.body.description) ? String(req.body.description).trim() : '';
  const tags = req.body && req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : String(req.body.tags).split(/[,;]/).map((t) => t.trim()).filter(Boolean)) : [];
  try {
    const buffer = fs.readFileSync(req.file.path);
    const slidesText = await parsePptx(buffer);
    const slideLayouts = slidesText.map((text, index) => ({ index, type: index === 0 ? 'hero' : 'title' }));
    const template = addTemplateToCatalog({
      filename: req.file.filename,
      name: name || req.file.filename,
      description: description || `Template com ${slidesText.length} slide(s).`,
      slideLayouts,
      tags
    });
    res.status(201).json({ message: 'Template adicionado ao banco de referências.', template });
  } catch (e) {
    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: e.message || 'Erro ao processar template.' });
  }
});

app.post('/api/export-pptx', express.json(), async (req, res) => {
  const { deckTitle, slides, templateId } = req.body || {};
  if (!slides || !Array.isArray(slides) || !slides.length) {
    return res.status(400).json({ error: 'Envia { deckTitle, slides } com pelo menos um slide.' });
  }

  // Se temos templateId e motor PPTX configurado, tentar usar o microserviço tipo Manus
  if (templateId && process.env.PPTX_RENDERER_URL) {
    try {
      const { templates } = await getAllTemplates();
      const tpl = templates.find((t) => t.id === templateId);
      if (!tpl || !tpl.filename || tpl.source === 'google_drive') {
        // Por enquanto só suportamos templates com ficheiro local conhecido
        throw new Error('Template não suportado para renderização directa (apenas templates locais).');
      }
      const baseDir = tpl.source === 'external' ? process.env.EXTERNAL_TEMPLATES_PATH : getTemplatesDir();
      const templatePath = path.join(baseDir || getTemplatesDir(), tpl.filename);
      const slideLayouts = Array.isArray(tpl.slideLayouts) ? tpl.slideLayouts : [];
      const buffer = await renderWithTemplate({ templatePath, deckTitle, slides, slideLayouts });
      const fileName = getFileName(deckTitle);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (err) {
      console.error('Erro ao exportar via motor PPTX:', err.message);
      // cai no fallback abaixo
    }
  }

  // Fallback: geração via pptxgenjs como hoje
  try {
    const buffer = await generatePptxBuffer({ deckTitle, slides });
    const fileName = getFileName(deckTitle);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Erro ao exportar PPTX (fallback):', err.message);
    res.status(500).json({ error: err.message || 'Erro ao gerar PPTX.' });
  }
});

// Pasta do frontend: preferir build do React (npm run build) se existir; senão raiz do projeto (index.html vanilla)
const projectRoot = path.join(__dirname, '..');
const buildDir = path.join(projectRoot, 'build');
const frontendDir = fs.existsSync(path.join(buildDir, 'index.html')) ? buildDir : projectRoot;

// Rota raiz: serve index.html
app.get('/', (_, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Frontend estático (CSS, JS, etc.)
app.use(express.static(frontendDir));

const PORT = process.env.PORT || 3788;
app.listen(PORT, () => {
  console.log(`SlideDeck: http://localhost:${PORT} (frontend + API)`);
});
