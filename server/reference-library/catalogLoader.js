/**
 * Carrega e atualiza o catálogo do banco de referências (templates PPTX reais).
 * Suporta: (1) internos, (2) pasta no disco (EXTERNAL_TEMPLATES_PATH), (3) pasta Google Drive (GOOGLE_DRIVE_TEMPLATES_FOLDER_ID).
 */
const path = require('path');
const fs = require('fs');
const https = require('https');
const { parsePptx } = require('../parse-pptx');

const REFERENCE_DIR = path.join(__dirname);
const CATALOG_PATH = path.join(REFERENCE_DIR, 'catalog.json');
const TEMPLATES_DIR = path.join(REFERENCE_DIR, 'templates');

const LAYOUT_TYPES = ['hero', 'title', 'title-subtitle', 'section', 'bullet', 'timeline', 'two-column', 'big-number', 'stats-row', 'quote', 'image-text'];

function loadCatalog() {
  try {
    const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.templates) ? data : { ...data, templates: [] };
  } catch (e) {
    return { version: 1, templates: [] };
  }
}

function saveCatalog(data) {
  const dir = path.dirname(CATALOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Adiciona um template ao catálogo (chamado após upload de um .pptx).
 * @param {Object} entry - { id, name, description, filename, slideLayouts[], tags[] }
 */
function addTemplateToCatalog(entry) {
  const catalog = loadCatalog();
  const id = entry.id || entry.filename.replace(/\.pptx$/i, '').replace(/\s+/g, '-');
  const template = {
    id,
    name: entry.name || id,
    description: entry.description || '',
    filename: entry.filename,
    slideLayouts: Array.isArray(entry.slideLayouts) ? entry.slideLayouts : [],
    tags: Array.isArray(entry.tags) ? entry.tags : []
  };
  const existing = catalog.templates.findIndex((t) => t.id === template.id);
  if (existing >= 0) catalog.templates[existing] = template;
  else catalog.templates.push(template);
  saveCatalog(catalog);
  return template;
}

/**
 * Escaneia uma pasta externa no disco (ex.: D:\MeusTemplates) e devolve entradas para o catálogo.
 * Para cada .pptx: se existir um .json com o mesmo nome, usa os metadados; senão gera a partir do ficheiro.
 */
async function loadExternalTemplates(externalPath) {
  if (!externalPath || typeof externalPath !== 'string') return [];
  const dir = path.resolve(externalPath.trim());
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const templates = [];
  const internalIds = new Set((loadCatalog().templates || []).map((t) => t.id));
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.toLowerCase().endsWith('.pptx')) continue;
    const fullPath = path.join(dir, file);
    if (!fs.statSync(fullPath).isFile()) continue;
    const baseName = path.basename(file, '.pptx');
    const safeId = baseName.replace(/[^\w-]/g, '-').replace(/-+/g, '-') || 'template';
    const id = internalIds.has(safeId) ? `ext-${safeId}` : safeId;
    internalIds.add(id);
    let name = baseName;
    let description = 'Template da pasta externa (use para apresentações que se adequem ao estilo).';
    let slideLayouts = [];
    let tags = ['externo'];
    const jsonPath = path.join(dir, `${baseName}.json`);
    if (fs.existsSync(jsonPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (meta.name) name = meta.name;
        if (meta.description) description = meta.description;
        if (Array.isArray(meta.slideLayouts)) slideLayouts = meta.slideLayouts;
        if (Array.isArray(meta.tags)) tags = meta.tags;
      } catch (_) {}
    }
    if (slideLayouts.length === 0) {
      try {
        const buf = fs.readFileSync(fullPath);
        const slidesText = await parsePptx(buf);
        slideLayouts = slidesText.map((_, i) => ({ index: i, type: i === 0 ? 'hero' : 'title' }));
        if (!fs.existsSync(jsonPath) && slidesText[0]) {
          const first = slidesText[0].slice(0, 80);
          if (first) description = `Template: ${first}${slidesText[0].length > 80 ? '...' : ''}`;
        }
      } catch (_) {}
    }
    templates.push({
      id,
      name,
      description,
      filename: file,
      path: fullPath,
      slideLayouts,
      tags,
      source: 'external'
    });
  }
  return templates;
}

/**
 * Lista ficheiros .pptx numa pasta do Google Drive e devolve entradas para o catálogo.
 * Pasta partilhada como "Quem tiver o link pode ver" + API key (Google Cloud, Drive API).
 * URL da pasta: https://drive.google.com/drive/folders/FOLDER_ID
 */
function loadGoogleDriveTemplates(folderId, apiKey) {
  return new Promise((resolve) => {
    if (!folderId || !apiKey) return resolve([]);
    const q = encodeURIComponent(`'${folderId}' in parents`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${apiKey}&fields=files(id,name,mimeType)&pageSize=100`;
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (ch) => { data += ch; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const files = json.files || [];
          const pptxMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          const templates = files
            .filter((f) => f.mimeType === pptxMime || (f.name || '').toLowerCase().endsWith('.pptx'))
            .map((f) => {
              const name = (f.name || '').replace(/\.pptx$/i, '') || 'template';
              const id = `gd-${f.id}`;
              return {
                id,
                name: f.name || name,
                description: 'Template do Google Drive. Use para apresentações que se adequem ao estilo.',
                filename: f.name || `${name}.pptx`,
                driveFileId: f.id,
                slideLayouts: [],
                tags: ['google-drive', 'externo'],
                source: 'google_drive'
              };
            });
          resolve(templates);
        } catch (_) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(10000, () => { req.destroy(); resolve([]); });
  });
}

/**
 * Devolve todos os templates (internos + pasta disco + Google Drive).
 */
async function getAllTemplates() {
  const internal = loadCatalog();
  const internalList = internal.templates || [];
  const externalPath = process.env.EXTERNAL_TEMPLATES_PATH;
  const externalList = await loadExternalTemplates(externalPath);
  const driveFolderId = process.env.GOOGLE_DRIVE_TEMPLATES_FOLDER_ID;
  const driveApiKey = process.env.GOOGLE_API_KEY;
  const driveList = await loadGoogleDriveTemplates(driveFolderId, driveApiKey);
  return {
    templates: [...internalList, ...externalList, ...driveList],
    sources: {
      internal: internalList.length,
      external: externalList.length,
      google_drive: driveList.length
    }
  };
}

/**
 * Devolve o catálogo em texto para injetar no prompt da IA (internos + pasta externa).
 */
async function getCatalogForPrompt() {
  const { templates } = await getAllTemplates();
  if (!templates.length) {
    return `
---- BANCO DE REFERÊNCIAS (TEMPLATES PPTX) ----
Ainda não há templates PPTX no banco. Coloca .pptx em reference-library/templates/, define EXTERNAL_TEMPLATES_PATH para uma pasta no teu disco, ou usa POST /api/reference-library/templates.
`;
  }
  const lines = templates.map((t) => {
    const layouts = t.slideLayouts && t.slideLayouts.length ? t.slideLayouts.map((s) => s.type || s).join(', ') : '(slides não tipados)';
    const tags = t.tags && t.tags.length ? ` Tags: ${t.tags.join(', ')}.` : '';
    const src = t.source === 'external' ? ' [pasta externa]' : t.source === 'google_drive' ? ' [Google Drive]' : '';
    return `- **${t.name}** (id: ${t.id}, ficheiro: ${t.filename})${src}: ${t.description} Layouts: ${layouts}.${tags}`;
  });
  return `
---- BANCO DE REFERÊNCIAS (TEMPLATES PPTX REAIS) ----
A ferramenta tem um banco de referências com templates em PPTX (internos, pasta no disco e/ou Google Drive). Deves USAR estes recursos para montar apresentações modernas.

TEMPLATES DISPONÍVEIS (usa o id para referenciar):
${lines.join('\n')}

Ao gerar o JSON, é OBRIGATÓRIO incluir "templateId" com um dos ids listados acima. Escolhe o template que melhor se adequa ao tema e ao pedido do utilizador (usa as tags e a descrição). O export em PPTX usará esse template para manter animações, efeitos e design profissional.
`;
}

function getTemplatesDir() {
  return TEMPLATES_DIR;
}

function getCatalogPath() {
  return CATALOG_PATH;
}

module.exports = {
  loadCatalog,
  saveCatalog,
  addTemplateToCatalog,
  getCatalogForPrompt,
  getAllTemplates,
  loadExternalTemplates,
  loadGoogleDriveTemplates,
  getTemplatesDir,
  getCatalogPath,
  LAYOUT_TYPES
};
