/**
 * SlideDeck - Apresentações online (estilo Beautiful.ai)
 */

const LAYOUTS = {
  hero: {
    name: 'Hero',
    defaultContent: { title: 'Título impactante', subtitle: 'Subtítulo ou tagline' }
  },
  title: {
    name: 'Título',
    defaultContent: { title: 'Título do slide' }
  },
  'title-subtitle': {
    name: 'Título + Subtítulo',
    defaultContent: { title: 'Título', subtitle: 'Subtítulo ou descrição breve' }
  },
  bullet: {
    name: 'Lista',
    defaultContent: {
      title: 'Título da lista',
      items: [
        { text: 'Primeiro ponto', icon: 'circle' },
        { text: 'Segundo ponto', icon: 'circle' },
        { text: 'Terceiro ponto', icon: 'circle' }
      ]
    }
  },
  timeline: {
    name: 'Timeline',
    defaultContent: {
      title: 'Principais Eventos',
      events: [
        { year: '1822', text: 'Independência do Brasil', icon: 'flag' },
        { year: '1824', text: 'Primeira Constituição', icon: 'book-open' }
      ]
    }
  },
  'two-column': {
    name: 'Duas colunas',
    defaultContent: { left: 'Conteúdo da coluna esquerda.', right: 'Conteúdo da coluna direita.' }
  },
  'big-number': {
    name: 'Número grande',
    defaultContent: { number: '42', label: 'Métrica ou descrição' }
  },
  'stats-row': {
    name: '3 estatísticas',
    defaultContent: { stat1: '99%', label1: 'Satisfação', stat2: '10x', label2: 'Crescimento', stat3: '24h', label3: 'Suporte' }
  },
  quote: {
    name: 'Citação',
    defaultContent: { text: 'Uma citação inspiradora ou importante.', author: '— Nome do autor' }
  },
  section: {
    name: 'Seção',
    defaultContent: { title: 'Nome da seção' }
  },
  'image-text': {
    name: 'Imagem + texto',
    defaultContent: { title: 'Título', body: 'Texto ou descrição. Pode colar URL de imagem no campo ao lado.', imageUrl: '', imageSuggestion: 'Ex.: equipe em reunião, produto' }
  }
};

const DEFAULT_SLIDE = {
  layout: 'title',
  content: { ...LAYOUTS.title.defaultContent },
  transition: 'fade',
  elementAnimation: 'fade'
};

// Transições entre slides (estilo Google Slides / PowerPoint)
const TRANSITIONS = [
  { id: 'none', name: 'Nenhuma' },
  { id: 'fade', name: 'Dissolver' },
  { id: 'slide', name: 'Deslizar' },
  { id: 'zoom', name: 'Zoom' },
  { id: 'convex', name: 'Convexo' },
  { id: 'concave', name: 'Côncavo' }
];

// Animação de entrada dos elementos no slide
const ELEMENT_ANIMATIONS = [
  { id: 'none', name: 'Nenhuma' },
  { id: 'fade', name: 'Aparecer' },
  { id: 'slideUp', name: 'Entrar de baixo' },
  { id: 'slideLeft', name: 'Entrar da esquerda' },
  { id: 'zoom', name: 'Zoom' }
];

// Estado
let state = {
  deckTitle: 'Minha Apresentação',
  slides: [
    { ...DEFAULT_SLIDE, content: { ...LAYOUTS.title.defaultContent } },
    { layout: 'bullet', content: { ...LAYOUTS.bullet.defaultContent } }
  ],
  currentIndex: 0,
  history: [],
  historyIndex: -1,
  theme: 'dark',
  brandColors: null
};

const MAX_HISTORY = 50;

// DOM
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => el.querySelectorAll(sel);

const el = {
  deckTitle: $('#deck-title'),
  slideThumbnails: $('#slide-thumbnails'),
  editorCanvas: $('#editor-canvas'),
  btnAddSlide: $('#btn-add-slide'),
  btnAddSlidePanel: $('#btn-add-slide-panel'),
  btnPresent: $('#btn-present'),
  btnTheme: $('#btn-theme'),
  btnUndo: $('#btn-undo'),
  btnRedo: $('#btn-redo'),
  btnCreateAi: $('#btn-create-ai'),
  presentationMode: $('#presentation-mode'),
  presentationSlide: $('#presentation-slide'),
  presentationClose: $('#presentation-close'),
  presentationPrev: $('#presentation-prev'),
  presentationNext: $('#presentation-next'),
  currentSlideNum: $('#current-slide-num'),
  totalSlidesNum: $('#total-slides-num'),
  templateBtns: $$('.template-btn'),
  transitionSelect: $('#slide-transition'),
  elementAnimationSelect: $('#slide-element-animation'),
  aiModal: $('#ai-modal'),
  aiModalClose: $('#ai-modal-close'),
  aiDescription: $('#ai-description'),
  aiDeckTitle: $('#ai-deck-title'),
  aiFile: $('#ai-file'),
  fileUploadZone: $('#file-upload-zone'),
  fileUploadText: $('#file-upload-text'),
  aiStatus: $('#ai-status'),
  aiGenerate: $('#ai-generate')
};

const presentationPrev = el.presentationPrev;
const presentationNext = el.presentationNext;

function pushHistory() {
  const snapshot = JSON.stringify({
    slides: state.slides.map(s => ({ ...s, content: { ...s.content } })),
    currentIndex: state.currentIndex
  });
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  state.history.push(snapshot);
  if (state.history.length > MAX_HISTORY) state.history.shift();
  state.historyIndex = state.history.length - 1;
  updateUndoRedo();
}

function undo() {
  if (state.historyIndex <= 0) return;
  state.historyIndex--;
  const data = JSON.parse(state.history[state.historyIndex]);
  state.slides = data.slides;
  state.currentIndex = data.currentIndex;
  render();
  updateUndoRedo();
}

function redo() {
  if (state.historyIndex >= state.history.length - 1) return;
  state.historyIndex++;
  const data = JSON.parse(state.history[state.historyIndex]);
  state.slides = data.slides;
  state.currentIndex = data.currentIndex;
  render();
  updateUndoRedo();
}

function updateUndoRedo() {
  if (el.btnUndo) el.btnUndo.disabled = state.historyIndex <= 0;
  if (el.btnRedo) el.btnRedo.disabled = state.historyIndex >= state.history.length - 1;
}

function getCurrentSlide() {
  return state.slides[state.currentIndex] || state.slides[0];
}

function saveContentFromEditor() {
  const slide = getCurrentSlide();
  if (!slide) return;
  const layout = slide.layout;

  if (layout === 'title') {
    const t = $('[data-field="title"]', el.editorCanvas);
    if (t) slide.content.title = t.textContent.trim() || 'Título';
  } else if (layout === 'title-subtitle') {
    const t = $('[data-field="title"]', el.editorCanvas);
    const s = $('[data-field="subtitle"]', el.editorCanvas);
    if (t) slide.content.title = t.textContent.trim() || 'Título';
    if (s) slide.content.subtitle = s.textContent.trim() || '';
  } else if (layout === 'bullet') {
    const t = $('[data-field="title"]', el.editorCanvas);
    if (t) slide.content.title = t.textContent.trim() || '';
    const items = $$('[data-field="item"]', el.editorCanvas);
    slide.content.items = Array.from(items).map((li) => {
      const icon = li.getAttribute('data-icon') || 'circle';
      const textEl = li.querySelector('.bullet-text');
      const text = textEl ? textEl.textContent.trim() : li.textContent.trim();
      return { text: text || '•', icon };
    });
  } else if (layout === 'timeline') {
    const t = $('[data-field="title"]', el.editorCanvas);
    if (t) slide.content.title = t.textContent.trim() || 'Principais Eventos';
    const eventDivs = $$('.timeline-event', el.editorCanvas);
    slide.content.events = Array.from(eventDivs).map((div) => {
      const icon = div.getAttribute('data-icon') || 'calendar';
      const yearEl = div.querySelector('[data-field="year"]');
      const textEl = div.querySelector('[data-field="text"]');
      return { year: yearEl ? yearEl.textContent.trim() : '', text: textEl ? textEl.textContent.trim() : '', icon };
    }).filter((e) => e.text || e.year);
  } else if (layout === 'two-column') {
    const left = $('[data-field="left"]', el.editorCanvas);
    const right = $('[data-field="right"]', el.editorCanvas);
    if (left) slide.content.left = left.textContent.trim() || '';
    if (right) slide.content.right = right.textContent.trim() || '';
  } else if (layout === 'big-number') {
    const num = $('[data-field="number"]', el.editorCanvas);
    const label = $('[data-field="label"]', el.editorCanvas);
    if (num) slide.content.number = num.textContent.trim() || '0';
    if (label) slide.content.label = label.textContent.trim() || '';
  } else if (layout === 'quote') {
    const text = $('[data-field="quote-text"]', el.editorCanvas);
    const author = $('[data-field="quote-author"]', el.editorCanvas);
    if (text) slide.content.text = text.textContent.trim() || '';
    if (author) slide.content.author = author.textContent.trim() || '';
  } else if (layout === 'section') {
    const t = $('[data-field="title"]', el.editorCanvas);
    if (t) slide.content.title = t.textContent.trim() || 'Seção';
  } else if (layout === 'hero') {
    const t = $('[data-field="title"]', el.editorCanvas);
    const s = $('[data-field="subtitle"]', el.editorCanvas);
    if (t) slide.content.title = t.textContent.trim() || 'Título';
    if (s) slide.content.subtitle = s.textContent.trim() || '';
  } else if (layout === 'stats-row') {
    ['stat1', 'label1', 'stat2', 'label2', 'stat3', 'label3'].forEach(key => {
      const el_ = $('[data-field="' + key + '"]', el.editorCanvas);
      if (el_) slide.content[key] = el_.textContent.trim() || '';
    });
  } else if (layout === 'image-text') {
    const t = $('[data-field="title"]', el.editorCanvas);
    const b = $('[data-field="body"]', el.editorCanvas);
    const imgInput = $('input[data-field="imageUrl"]', el.editorCanvas);
    const sug = $('[data-field="imageSuggestion"]', el.editorCanvas);
    if (t) slide.content.title = t.textContent.trim() || '';
    if (b) slide.content.body = b.textContent.trim() || '';
    if (imgInput) slide.content.imageUrl = (imgInput.value || '').trim();
    if (sug) slide.content.imageSuggestion = sug.textContent.trim().replace(/^💡\s*/, '') || '';
  }
}

function ensureSlideAnimations(slide) {
  if (!slide.transition) slide.transition = 'fade';
  if (!slide.elementAnimation) slide.elementAnimation = 'fade';
  return slide;
}

function renderEditorSlide(slide, forPresentation = false) {
  slide = ensureSlideAnimations(slide);
  const c = slide.content;
  const layout = slide.layout;
  const anim = slide.elementAnimation || 'fade';
  const wrap = (content, order) => forPresentation && order ? ` data-animate-order="${order}" style="animation-delay: ${(order - 1) * 0.12}s"` : '';

  let html = '';
  if (layout === 'hero') {
    html = `
      <div class="slide-hero">
        <div class="slide-hero-title" data-field="title" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.title || 'Título')}</div>
        <div class="slide-hero-subtitle" data-field="subtitle" contenteditable="true"${wrap('', 2)}>${escapeHtml(c.subtitle || '')}</div>
      </div>
    `;
  } else if (layout === 'title') {
    html = `<div class="slide-title" data-field="title" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.title || 'Título')}</div>`;
  } else if (layout === 'title-subtitle') {
    html = `
      <div class="slide-title" data-field="title" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.title || 'Título')}</div>
      <div class="slide-subtitle" data-field="subtitle" contenteditable="true"${wrap('', 2)}>${escapeHtml(c.subtitle || '')}</div>
    `;
  } else if (layout === 'bullet') {
    const rawItems = c.items || [];
    const items = rawItems.map((it, i) => {
      const item = typeof it === 'string' ? { text: it, icon: 'circle' } : (it && typeof it === 'object' ? it : { text: '', icon: 'circle' });
      const icon = item.icon || 'circle';
      const text = typeof item.text === 'string' ? item.text : String(item);
      const anim = forPresentation ? ` data-animate-order="${i + 2}" style="animation-delay: ${(i + 1) * 0.12}s"` : '';
      const ce = forPresentation ? '' : ' contenteditable="true"';
      return `<li class="slide-bullet-item" data-field="item" data-icon="${escapeAttr(icon)}"${anim}>
        <span class="bullet-icon"><iconify-icon icon="lucide:${icon}"></iconify-icon></span>
        <span class="bullet-text"${ce}>${escapeHtml(text)}</span>
      </li>`;
    }).join('');
    html = `
      <div class="slide-title" data-field="title" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.title || '')}</div>
      <ul class="slide-bullets slide-bullets-cards">${items}</ul>
    `;
  } else if (layout === 'timeline') {
    const events = c.events || [];
    const eventEls = events.map((ev, i) => {
      const e = ev && typeof ev === 'object' ? ev : { year: '', text: String(ev), icon: 'calendar' };
      const icon = e.icon || 'calendar';
      const anim = forPresentation ? ` data-animate-order="${i + 2}" style="animation-delay: ${(i + 1) * 0.12}s"` : '';
      const ce = forPresentation ? '' : ' contenteditable="true"';
      return `<div class="timeline-event" data-field="event" data-index="${i}" data-icon="${escapeAttr(icon)}"${anim}>
        <div class="timeline-marker"><iconify-icon icon="lucide:${icon}"></iconify-icon></div>
        <div class="timeline-content">
          <span class="timeline-year"${ce} data-field="year">${escapeHtml(e.year || '')}</span>
          <span class="timeline-text"${ce} data-field="text">${escapeHtml(e.text || '')}</span>
        </div>
      </div>`;
    }).join('');
    html = `
      <div class="slide-timeline">
        <div class="slide-title" data-field="title" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.title || 'Principais Eventos')}</div>
        <div class="timeline-track">${eventEls}</div>
      </div>
    `;
  } else if (layout === 'two-column') {
    html = `
      <div class="slide-two-column">
        <div class="column" data-field="left" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.left || '')}</div>
        <div class="column" data-field="right" contenteditable="true"${wrap('', 2)}>${escapeHtml(c.right || '')}</div>
      </div>
    `;
  } else if (layout === 'big-number') {
    html = `
      <div class="slide-big-number">
        <div class="number" data-field="number" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.number || '0')}</div>
        <div class="label" data-field="label" contenteditable="true"${wrap('', 2)}>${escapeHtml(c.label || '')}</div>
      </div>
    `;
  } else if (layout === 'quote') {
    html = `
      <div class="slide-quote">
        <div class="quote-text" data-field="quote-text" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.text || '')}</div>
        <div class="quote-author" data-field="quote-author" contenteditable="true"${wrap('', 2)}>${escapeHtml(c.author || '')}</div>
      </div>
    `;
  } else if (layout === 'section') {
    html = `<div class="slide-section"><div class="section-title" data-field="title" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.title || 'Seção')}</div></div>`;
  } else if (layout === 'stats-row') {
    html = `
      <div class="slide-stats-row">
        <div class="stat"${wrap('', 1)}><div class="stat-value" data-field="stat1" contenteditable="true">${escapeHtml(c.stat1 || '')}</div><div class="stat-label" data-field="label1" contenteditable="true">${escapeHtml(c.label1 || '')}</div></div>
        <div class="stat"${wrap('', 2)}><div class="stat-value" data-field="stat2" contenteditable="true">${escapeHtml(c.stat2 || '')}</div><div class="stat-label" data-field="label2" contenteditable="true">${escapeHtml(c.label2 || '')}</div></div>
        <div class="stat"${wrap('', 3)}><div class="stat-value" data-field="stat3" contenteditable="true">${escapeHtml(c.stat3 || '')}</div><div class="stat-label" data-field="label3" contenteditable="true">${escapeHtml(c.label3 || '')}</div></div>
      </div>
    `;
  } else if (layout === 'image-text') {
    const imgSrc = (c.imageUrl || '').trim();
    const imgBlock = forPresentation
      ? (imgSrc ? `<div class="slide-image-text-img" style="background-image:url(${escapeAttr(imgSrc)})"></div>` : '<div class="slide-image-text-placeholder">📷 Imagem</div>')
      : `<div class="slide-image-text-editor-img"><input type="text" data-field="imageUrl" placeholder="URL da imagem" value="${escapeAttr(imgSrc)}" class="image-url-input" /></div>`;
    const imgWrap = forPresentation ? `<div class="slide-image-text-img-wrap"${wrap('', 1)}>` : '';
    const imgWrapEnd = forPresentation ? '</div>' : '';
    html = `
      <div class="slide-image-text">
        ${imgWrap}${imgBlock}${imgWrapEnd}
        <div class="slide-image-text-content"${wrap('', 2)}>
          <div class="slide-image-text-title" data-field="title" contenteditable="true">${escapeHtml(c.title || '')}</div>
          <div class="slide-image-text-body" data-field="body" contenteditable="true">${escapeHtml(c.body || '')}</div>
          ${!forPresentation ? `<div class="slide-image-suggestion" data-field="imageSuggestion" contenteditable="true">💡 ${escapeHtml(c.imageSuggestion || 'Sugestão de imagem')}</div>` : ''}
        </div>
      </div>
    `;
    if (forPresentation && c.imageSuggestion && !imgSrc) {
      html = html.replace('>📷 Imagem</div>', '>📷 ' + escapeHtml(c.imageSuggestion) + '</div>');
    }
  } else {
    html = `<div class="slide-title" data-field="title" contenteditable="true"${wrap('', 1)}>${escapeHtml(c.title || '')}</div>`;
  }

  if (forPresentation && anim !== 'none') {
    html = `<div class="slide-animation-wrap element-animation-${anim}">${html}</div>`;
  }
  return html;
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function escapeAttr(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML.replace(/"/g, '&quot;');
}

function renderThumbnails() {
  el.slideThumbnails.innerHTML = state.slides.map((slide, i) => {
    const title = slide.content?.title || slide.content?.text || 'Slide';
    const preview = typeof title === 'string' ? title : (slide.content?.left || '').slice(0, 60);
    const canDelete = state.slides.length > 1;
    return `
      <div class="slide-thumb ${i === state.currentIndex ? 'active' : ''}" data-index="${i}">
        <span class="slide-thumb-num">${i + 1}</span>
        <div class="slide-thumb-actions">
          <button type="button" class="slide-thumb-action duplicate" data-index="${i}" title="Duplicar">⎘</button>
          ${canDelete ? `<button type="button" class="slide-thumb-action delete" data-index="${i}" title="Excluir">×</button>` : ''}
        </div>
        <div class="slide-thumb-content">${escapeHtml(preview)}</div>
      </div>
    `;
  }).join('');

  $$('.slide-thumb', el.slideThumbnails).forEach(thumb => {
    const idx = parseInt(thumb.dataset.index, 10);
    thumb.addEventListener('click', (e) => {
      if (e.target.closest('.slide-thumb-action')) return;
      saveContentFromEditor();
      state.currentIndex = idx;
      render();
    });
    thumb.querySelector('.duplicate')?.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateSlide(idx);
    });
    thumb.querySelector('.delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSlide(idx);
    });
  });
}

function renderEditor() {
  const slide = getCurrentSlide();
  if (!slide) return;
  ensureSlideAnimations(slide);
  el.editorCanvas.innerHTML = renderEditorSlide(slide, false);

  el.templateBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layout === slide.layout);
  });
  if (el.transitionSelect) el.transitionSelect.value = slide.transition || 'fade';
  if (el.elementAnimationSelect) el.elementAnimationSelect.value = slide.elementAnimation || 'fade';
}

const TRANSITION_DURATION_MS = 380;

function clearTransitionClasses() {
  if (!el.presentationSlide) return;
  el.presentationSlide.classList.remove('slide-exit', 'slide-enter');
  ['none', 'fade', 'slide', 'zoom', 'convex', 'concave'].forEach(t => {
    el.presentationSlide.classList.remove('exit-' + t, 'enter-' + t);
  });
}

function renderPresentation(runEnterAnimation = true) {
  const slide = getCurrentSlide();
  if (!slide) return;
  ensureSlideAnimations(slide);
  const transition = slide.transition || 'fade';
  el.presentationSlide.setAttribute('data-transition', transition);
  el.presentationSlide.innerHTML = '<div class="slide-content-inner">' + renderEditorSlide(slide, true) + '</div>';
  el.currentSlideNum.textContent = state.currentIndex + 1;
  el.totalSlidesNum.textContent = state.slides.length;
  if (runEnterAnimation && transition !== 'none') {
    clearTransitionClasses();
    el.presentationSlide.classList.add('slide-enter', 'enter-' + transition);
    setTimeout(clearTransitionClasses, TRANSITION_DURATION_MS);
  }
}

function addSlide() {
  pushHistory();
  const newSlide = {
    layout: 'title',
    content: { ...LAYOUTS.title.defaultContent },
    transition: 'fade',
    elementAnimation: 'fade'
  };
  state.slides.splice(state.currentIndex + 1, 0, newSlide);
  state.currentIndex++;
  render();
}

function duplicateSlide(index) {
  pushHistory();
  const copy = JSON.parse(JSON.stringify(state.slides[index]));
  state.slides.splice(index + 1, 0, copy);
  state.currentIndex = index + 1;
  render();
}

function deleteSlide(index) {
  if (state.slides.length <= 1) return;
  pushHistory();
  state.slides.splice(index, 1);
  if (state.currentIndex >= state.slides.length) state.currentIndex = state.slides.length - 1;
  else if (state.currentIndex >= index && state.currentIndex > 0) state.currentIndex--;
  render();
}

function setLayout(layoutKey) {
  const slide = getCurrentSlide();
  if (!slide || !LAYOUTS[layoutKey]) return;
  pushHistory();
  saveContentFromEditor();
  slide.layout = layoutKey;
  slide.content = { ...LAYOUTS[layoutKey].defaultContent };
  render();
}

function render() {
  renderThumbnails();
  renderEditor();
  if (state.presentationOpen) renderPresentation();
}

function openPresentation() {
  state.presentationOpen = true;
  el.presentationMode.classList.remove('hidden');
  renderPresentation();
  document.body.style.overflow = 'hidden';
}

function closePresentation() {
  state.presentationOpen = false;
  el.presentationMode.classList.add('hidden');
  document.body.style.overflow = '';
}

function presentationPrevSlide() {
  if (state.currentIndex <= 0) return;
  const currentSlide = getCurrentSlide();
  const exitTransition = currentSlide?.transition || 'fade';
  if (exitTransition === 'none') {
    state.currentIndex--;
    renderPresentation(true);
    return;
  }
  clearTransitionClasses();
  el.presentationSlide.classList.add('slide-exit', 'exit-' + exitTransition);
  setTimeout(() => {
    state.currentIndex--;
    renderPresentation(true);
  }, TRANSITION_DURATION_MS);
}

function presentationNextSlide() {
  if (state.currentIndex >= state.slides.length - 1) return;
  const currentSlide = getCurrentSlide();
  const exitTransition = currentSlide?.transition || 'fade';
  if (exitTransition === 'none') {
    state.currentIndex++;
    renderPresentation(true);
    return;
  }
  clearTransitionClasses();
  el.presentationSlide.classList.add('slide-exit', 'exit-' + exitTransition);
  setTimeout(() => {
    state.currentIndex++;
    renderPresentation(true);
  }, TRANSITION_DURATION_MS);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme === 'light' ? 'light' : '');
  if (state.theme === 'dark') document.documentElement.removeAttribute('data-theme');
  applyBrandColors();
}

/** Aplica cores de marca (do manual de identidade) aos slides quando existem em state. */
function applyBrandColors() {
  const root = document.documentElement;
  if (!state.brandColors || !state.brandColors.primary) {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-hover');
    root.style.removeProperty('--accent-muted');
    return;
  }
  const primary = state.brandColors.primary;
  const secondary = state.brandColors.secondary || primary;
  root.style.setProperty('--accent', primary);
  root.style.setProperty('--accent-hover', secondary);
  root.style.setProperty('--accent-muted', primary.startsWith('#') ? hexToRgba(primary, 0.2) : primary);
}

function hexToRgba(hex, a) {
  const m = hex.slice(1).match(/.{2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map(x => parseInt(x, 16));
  return `rgba(${r},${g},${b},${a})`;
}

// ----- Criar com IA -----
function getApiBase() {
  return '';
}

function openAiModal() {
  if (el.aiModal) el.aiModal.classList.remove('hidden');
  if (el.aiStatus) { el.aiStatus.textContent = ''; el.aiStatus.classList.remove('error', 'loading'); }
  if (el.aiDescription) el.aiDescription.value = '';
  if (el.aiDeckTitle) el.aiDeckTitle.value = state.deckTitle;
  if (el.aiFile) el.aiFile.value = '';
  if (el.fileUploadText) el.fileUploadText.textContent = 'Arrasta um ficheiro ou clica para escolher';
}

function closeAiModal() {
  if (el.aiModal) el.aiModal.classList.add('hidden');
}

async function generateWithAi() {
  const description = el.aiDescription?.value?.trim();
  if (!description) {
    if (el.aiStatus) { el.aiStatus.textContent = 'Escreve uma descrição da apresentação.'; el.aiStatus.classList.add('error'); }
    return;
  }
  const deckTitleHint = el.aiDeckTitle?.value?.trim() || '';
  const file = el.aiFile?.files?.[0];
  const base = getApiBase();
  const url = `${base}/api/generate`;
  if (el.aiStatus) { el.aiStatus.textContent = file ? 'A processar ficheiro e a gerar...' : 'A gerar...'; el.aiStatus.classList.add('loading'); el.aiStatus.classList.remove('error'); }
  if (el.aiGenerate) { el.aiGenerate.disabled = true; }
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('deckTitle', deckTitleHint);
    if (file) formData.append('file', file);
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('API não encontrada. Abre a app em http://localhost:3788 (com o servidor Node a correr na pasta server).');
      }
      throw new Error(data.error || `Erro ${res.status}`);
    }
    if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error('Resposta inválida da API.');
    }
    pushHistory();
    state.deckTitle = data.deckTitle || 'Minha Apresentação';
    state.slides = data.slides;
    state.currentIndex = 0;
    state.brandColors = data.brandColors || null;
    if (el.deckTitle) el.deckTitle.value = state.deckTitle;
    applyBrandColors();
    render();
    closeAiModal();
  } catch (err) {
    if (el.aiStatus) {
      el.aiStatus.textContent = err.message || 'Erro ao gerar. Verifica se o servidor está a correr (npm start na pasta server) e abre http://localhost:3788';
      el.aiStatus.classList.add('error');
      el.aiStatus.classList.remove('loading');
    }
  } finally {
    if (el.aiGenerate) el.aiGenerate.disabled = false;
  }
}

// Eventos
el.deckTitle.addEventListener('input', () => { state.deckTitle = el.deckTitle.value; });
el.deckTitle.addEventListener('blur', () => { el.deckTitle.value = state.deckTitle; });

el.btnAddSlide.addEventListener('click', addSlide);
el.btnAddSlidePanel.addEventListener('click', addSlide);

el.btnPresent.addEventListener('click', () => {
  saveContentFromEditor();
  openPresentation();
});

el.presentationClose.addEventListener('click', closePresentation);
presentationPrev.addEventListener('click', presentationPrevSlide);
presentationNext.addEventListener('click', presentationNextSlide);

el.btnTheme.addEventListener('click', toggleTheme);
el.btnUndo.addEventListener('click', undo);
el.btnRedo.addEventListener('click', redo);

if (el.btnCreateAi) el.btnCreateAi.addEventListener('click', openAiModal);
if (el.aiModalClose) el.aiModalClose.addEventListener('click', closeAiModal);
if (el.aiModal) el.aiModal.addEventListener('click', (e) => { if (e.target === el.aiModal) closeAiModal(); });
if (el.aiGenerate) el.aiGenerate.addEventListener('click', generateWithAi);

if (el.fileUploadZone && el.aiFile) {
  el.fileUploadZone.addEventListener('click', () => el.aiFile.click());
  el.fileUploadZone.addEventListener('dragover', (e) => { e.preventDefault(); el.fileUploadZone.classList.add('dragover'); });
  el.fileUploadZone.addEventListener('dragleave', () => el.fileUploadZone.classList.remove('dragover'));
  el.fileUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    el.fileUploadZone.classList.remove('dragover');
    const f = e.dataTransfer?.files?.[0];
    if (f && /\.(pptx|txt|md|pdf|jpg|jpeg|png|webp|gif)$/i.test(f.name)) {
      const dt = new DataTransfer();
      dt.items.add(f);
      el.aiFile.files = dt.files;
      if (el.fileUploadText) el.fileUploadText.textContent = f.name;
    }
  });
}
if (el.aiFile && el.fileUploadText) {
  el.aiFile.addEventListener('change', () => {
    const f = el.aiFile.files?.[0];
    el.fileUploadText.textContent = f ? f.name : 'Arrasta um ficheiro ou clica para escolher';
  });
}

el.templateBtns.forEach(btn => {
  btn.addEventListener('click', () => setLayout(btn.dataset.layout));
});

if (el.transitionSelect) {
  el.transitionSelect.addEventListener('change', () => {
    const slide = getCurrentSlide();
    if (!slide) return;
    pushHistory();
    slide.transition = el.transitionSelect.value;
  });
}
if (el.elementAnimationSelect) {
  el.elementAnimationSelect.addEventListener('change', () => {
    const slide = getCurrentSlide();
    if (!slide) return;
    pushHistory();
    slide.elementAnimation = el.elementAnimationSelect.value;
  });
}

document.addEventListener('keydown', (e) => {
  if (state.presentationOpen) {
    if (e.key === 'Escape') closePresentation();
    else if (e.key === 'ArrowLeft') presentationPrevSlide();
    else if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      presentationNextSlide();
    }
    return;
  }
  if (e.key === 'F5') {
    e.preventDefault();
    saveContentFromEditor();
    openPresentation();
  }
});

// Inicialização
pushHistory();
render();
el.deckTitle.value = state.deckTitle;
applyBrandColors();
