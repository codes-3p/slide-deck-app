function escapeHtml(s) {
  if (s == null) return '';
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

function ensureAnimations(slide) {
  const s = { ...slide, transition: slide.transition || 'fade', elementAnimation: slide.elementAnimation || 'fade' };
  return s;
}

export function renderSlideToHtml(slide, forPresentation = false, readOnly = false) {
  const s = ensureAnimations(slide);
  const c = s.content || {};
  const layout = s.layout || 'title';
  const noEdit = forPresentation || readOnly;
  const wrap = (order) => forPresentation && order ? ` data-animate-order="${order}" style="animation-delay: ${(order - 1) * 0.12}s"` : '';

  let html = '';
  if (layout === 'hero') {
    html = `<div class="slide-hero"><div class="slide-hero-title" data-field="title"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.title || 'Título')}</div><div class="slide-hero-subtitle" data-field="subtitle"${noEdit ? '' : ' contenteditable="true"'}${wrap(2)}>${escapeHtml(c.subtitle || '')}</div></div>`;
  } else if (layout === 'title') {
    html = `<div class="slide-title" data-field="title"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.title || 'Título')}</div>`;
  } else if (layout === 'title-subtitle') {
    html = `<div class="slide-title" data-field="title"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.title || 'Título')}</div><div class="slide-subtitle" data-field="subtitle"${noEdit ? '' : ' contenteditable="true"'}${wrap(2)}>${escapeHtml(c.subtitle || '')}</div>`;
  } else if (layout === 'bullet') {
    const rawItems = c.items || [];
    const items = rawItems.map((it, i) => {
      const item = typeof it === 'string' ? { text: it, icon: 'circle' } : (it && typeof it === 'object' ? it : { text: '', icon: 'circle' });
      const icon = item.icon || 'circle';
      const text = typeof item.text === 'string' ? item.text : String(item);
      const ce = noEdit ? '' : ' contenteditable="true"';
      return `<li class="slide-bullet-item" data-field="item" data-icon="${escapeAttr(icon)}"><span class="bullet-icon"><iconify-icon icon="lucide:${icon}"></iconify-icon></span><span class="bullet-text"${ce}>${escapeHtml(text)}</span></li>`;
    }).join('');
    html = `<div class="slide-title" data-field="title"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.title || '')}</div><ul class="slide-bullets slide-bullets-cards">${items}</ul>`;
  } else if (layout === 'timeline') {
    const events = c.events || [];
    const eventEls = events.map((ev, i) => {
      const e = ev && typeof ev === 'object' ? ev : { year: '', text: String(ev), icon: 'calendar' };
      const icon = e.icon || 'calendar';
      const ce = noEdit ? '' : ' contenteditable="true"';
      return `<div class="timeline-event" data-field="event" data-index="${i}" data-icon="${escapeAttr(icon)}"><div class="timeline-marker"><iconify-icon icon="lucide:${icon}"></iconify-icon></div><div class="timeline-content"><span class="timeline-year"${ce} data-field="year">${escapeHtml(e.year || '')}</span><span class="timeline-text"${ce} data-field="text">${escapeHtml(e.text || '')}</span></div></div>`;
    }).join('');
    html = `<div class="slide-timeline"><div class="slide-title" data-field="title"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.title || 'Principais Eventos')}</div><div class="timeline-track">${eventEls}</div></div>`;
  } else if (layout === 'two-column') {
    html = `<div class="slide-two-column"><div class="column" data-field="left"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.left || '')}</div><div class="column" data-field="right"${noEdit ? '' : ' contenteditable="true"'}${wrap(2)}>${escapeHtml(c.right || '')}</div></div>`;
  } else if (layout === 'big-number') {
    html = `<div class="slide-big-number"><div class="number" data-field="number"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.number || '0')}</div><div class="label" data-field="label"${noEdit ? '' : ' contenteditable="true"'}${wrap(2)}>${escapeHtml(c.label || '')}</div></div>`;
  } else if (layout === 'quote') {
    html = `<div class="slide-quote"><div class="quote-text" data-field="quote-text"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.text || '')}</div><div class="quote-author" data-field="quote-author"${noEdit ? '' : ' contenteditable="true"'}${wrap(2)}>${escapeHtml(c.author || '')}</div></div>`;
  } else if (layout === 'section') {
    html = `<div class="slide-section"><div class="section-title" data-field="title"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.title || 'Seção')}</div></div>`;
  } else if (layout === 'stats-row') {
    html = `<div class="slide-stats-row"><div class="stat"${wrap(1)}><div class="stat-value" data-field="stat1"${noEdit ? '' : ' contenteditable="true"'}>${escapeHtml(c.stat1 || '')}</div><div class="stat-label" data-field="label1"${noEdit ? '' : ' contenteditable="true"'}>${escapeHtml(c.label1 || '')}</div></div><div class="stat"${wrap(2)}><div class="stat-value" data-field="stat2"${noEdit ? '' : ' contenteditable="true"'}>${escapeHtml(c.stat2 || '')}</div><div class="stat-label" data-field="label2"${noEdit ? '' : ' contenteditable="true"'}>${escapeHtml(c.label2 || '')}</div></div><div class="stat"${wrap(3)}><div class="stat-value" data-field="stat3"${noEdit ? '' : ' contenteditable="true"'}>${escapeHtml(c.stat3 || '')}</div><div class="stat-label" data-field="label3"${noEdit ? '' : ' contenteditable="true"'}>${escapeHtml(c.label3 || '')}</div></div></div>`;
  } else if (layout === 'image-text') {
    const imgSrc = (c.imageUrl || '').trim();
    const imgBlock = forPresentation || readOnly
      ? (imgSrc ? `<div class="slide-image-text-img" style="background-image:url(${escapeAttr(imgSrc)})"></div>` : '<div class="slide-image-text-placeholder">Imagem</div>')
      : `<div class="slide-image-text-editor-img"><input type="text" data-field="imageUrl" placeholder="URL da imagem" value="${escapeAttr(imgSrc)}" class="image-url-input" /></div>`;
    html = `<div class="slide-image-text">${imgBlock}<div class="slide-image-text-content"${wrap(2)}><div class="slide-image-text-title" data-field="title"${noEdit ? '' : ' contenteditable="true"'}>${escapeHtml(c.title || '')}</div><div class="slide-image-text-body" data-field="body"${noEdit ? '' : ' contenteditable="true"'}>${escapeHtml(c.body || '')}</div>${!noEdit ? `<div class="slide-image-suggestion" data-field="imageSuggestion" contenteditable="true">${escapeHtml(c.imageSuggestion || 'Sugestão de imagem')}</div>` : ''}</div></div>`;
  } else {
    html = `<div class="slide-title" data-field="title"${noEdit ? '' : ' contenteditable="true"'}${wrap(1)}>${escapeHtml(c.title || '')}</div>`;
  }
  return html;
}

export function getContentFromEditor(editorEl, slide) {
  if (!editorEl || !slide) return slide?.content || {};
  const layout = slide.layout || 'title';
  const content = { ...(slide.content || {}) };
  const $ = (sel) => editorEl.querySelector(sel);
  const $$ = (sel) => editorEl.querySelectorAll(sel);

  if (layout === 'title') {
    const t = $('[data-field="title"]');
    if (t) content.title = t.textContent.trim() || 'Título';
  } else if (layout === 'title-subtitle' || layout === 'hero') {
    const t = $('[data-field="title"]');
    const s = $('[data-field="subtitle"]');
    if (t) content.title = t.textContent.trim() || 'Título';
    if (s) content.subtitle = s.textContent.trim() || '';
  } else if (layout === 'bullet') {
    const t = $('[data-field="title"]');
    if (t) content.title = t.textContent.trim() || '';
    const items = $$('[data-field="item"]');
    content.items = Array.from(items).map((li) => {
      const icon = li.getAttribute('data-icon') || 'circle';
      const textEl = li.querySelector('.bullet-text');
      const text = textEl ? textEl.textContent.trim() : li.textContent.trim();
      return { text: text || '•', icon };
    });
  } else if (layout === 'timeline') {
    const t = $('[data-field="title"]');
    if (t) content.title = t.textContent.trim() || 'Principais Eventos';
    const eventDivs = $$('.timeline-event');
    content.events = Array.from(eventDivs).map((div) => {
      const icon = div.getAttribute('data-icon') || 'calendar';
      const yearEl = div.querySelector('[data-field="year"]');
      const textEl = div.querySelector('[data-field="text"]');
      return { year: yearEl ? yearEl.textContent.trim() : '', text: textEl ? textEl.textContent.trim() : '', icon };
    }).filter((e) => e.text || e.year);
  } else if (layout === 'two-column') {
    const left = $('[data-field="left"]');
    const right = $('[data-field="right"]');
    if (left) content.left = left.textContent.trim() || '';
    if (right) content.right = right.textContent.trim() || '';
  } else if (layout === 'big-number') {
    const num = $('[data-field="number"]');
    const label = $('[data-field="label"]');
    if (num) content.number = num.textContent.trim() || '0';
    if (label) content.label = label.textContent.trim() || '';
  } else if (layout === 'quote') {
    const text = $('[data-field="quote-text"]');
    const author = $('[data-field="quote-author"]');
    if (text) content.text = text.textContent.trim() || '';
    if (author) content.author = author.textContent.trim() || '';
  } else if (layout === 'section') {
    const t = $('[data-field="title"]');
    if (t) content.title = t.textContent.trim() || 'Seção';
  } else if (layout === 'stats-row') {
    ['stat1', 'label1', 'stat2', 'label2', 'stat3', 'label3'].forEach((key) => {
      const el_ = $('[data-field="' + key + '"]');
      if (el_) content[key] = el_.textContent.trim() || '';
    });
  } else if (layout === 'image-text') {
    const t = $('[data-field="title"]');
    const b = $('[data-field="body"]');
    const imgInput = $('input[data-field="imageUrl"]');
    const sug = $('[data-field="imageSuggestion"]');
    if (t) content.title = t.textContent.trim() || '';
    if (b) content.body = b.textContent.trim() || '';
    if (imgInput) content.imageUrl = (imgInput.value || '').trim();
    if (sug) content.imageSuggestion = sug.textContent.trim().replace(/^💡\s*/, '') || '';
  }
  return content;
}
