import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LAYOUTS, DEFAULT_SLIDE, TRANSITIONS, ELEMENT_ANIMATIONS } from './constants';
import { TOOLBAR, EDITOR, LAYOUT_GROUPS } from './constants/copy';
import { renderSlideToHtml, getContentFromEditor } from './utils/slideRender';
import { downloadPptx } from './utils/exportPptx';
import ChatSidebar from './components/ChatSidebar';
import { AnimatedAIChat } from './components/ui/AnimatedAIChat';
import './App.css';

const THEME_KEY = 'slidedeck-theme';
const DRAG_HINT_KEY = 'slidedeck-drag-hint-seen';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (_) {}
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

const initialSlides = [];

export default function App() {
  const [deckTitle, setDeckTitle] = useState('Minha Apresentação');
  const [slides, setSlides] = useState(initialSlides);
  const [templateId, setTemplateId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brandColors, setBrandColors] = useState(null);
  const [chatMinimized, setChatMinimized] = useState(true);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [dragSlideIndex, setDragSlideIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [showDragHint, setShowDragHint] = useState(false);
  const editorRef = useRef(null);

  const currentSlide = slides[currentIndex] || slides[0];

  useEffect(() => {
    const t = getInitialTheme();
    document.documentElement.setAttribute('data-theme', t);
    setThemeState(t);
  }, []);

  const [theme, setThemeState] = useState('dark');

  const setTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    setThemeState(newTheme);
    try { localStorage.setItem(THEME_KEY, newTheme); } catch (_) {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const seen = slides.length >= 2 && !localStorage.getItem(DRAG_HINT_KEY);
    setShowDragHint(!!seen);
  }, [slides.length]);

  const dismissDragHint = () => {
    try { localStorage.setItem(DRAG_HINT_KEY, '1'); } catch (_) {}
    setShowDragHint(false);
  };

  useEffect(() => {
    document.body.style.overflow = presentationOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [presentationOpen]);

  useEffect(() => {
    if (!presentationOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setPresentationOpen(false);
      if (e.key === 'ArrowLeft') setCurrentIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(slides.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presentationOpen, slides.length]);

  useEffect(() => {
    if (!brandColors?.primary) {
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent-hover');
      document.documentElement.style.removeProperty('--accent-muted');
      return;
    }
    document.documentElement.style.setProperty('--accent', brandColors.primary);
    document.documentElement.style.setProperty('--accent-hover', brandColors.secondary || brandColors.primary);
    if (brandColors.primary.startsWith('#')) {
      const m = brandColors.primary.slice(1).match(/.{2}/g);
      if (m) {
        const [r, g, b] = m.map((x) => parseInt(x, 16));
        document.documentElement.style.setProperty('--accent-muted', `rgba(${r},${g},${b},0.2)`);
      }
    }
  }, [brandColors]);

  const handlePresentationGenerated = ({ deckTitle: title, slides: newSlides, brandColors: colors, templateId: tplId }) => {
    setDeckTitle(title || 'Minha Apresentação');
    setSlides(newSlides);
    setCurrentIndex(0);
    setBrandColors(colors || null);
    setTemplateId(tplId || null);
  };

  const syncContentFromEditor = useCallback(() => {
    if (!editorRef.current || currentIndex < 0 || currentIndex >= slides.length) return;
    const slide = slides[currentIndex];
    const content = getContentFromEditor(editorRef.current, slide);
    if (!content || Object.keys(content).length === 0) return;
    setSlides((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], content };
      return next;
    });
  }, [currentIndex, slides]);

  useEffect(() => {
    const slide = slides[currentIndex];
    if (!slide) return;
    const html = renderSlideToHtml(slide, false, false);
    if (editorRef.current) editorRef.current.innerHTML = html;
  }, [currentIndex, slides]);

  const openPresentation = () => setPresentationOpen(true);
  const closePresentation = () => setPresentationOpen(false);

  const moveSlide = (fromIndex, direction) => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
    setCurrentIndex(toIndex);
  };

  const addSlide = () => {
    const newSlide = { ...DEFAULT_SLIDE, content: { ...LAYOUTS.title.defaultContent } };
    setSlides((prev) => {
      const next = [...prev];
      next.splice(currentIndex + 1, 0, newSlide);
      return next;
    });
    setCurrentIndex(currentIndex + 1);
  };

  const duplicateSlide = (index) => {
    const slide = slides[index];
    if (!slide) return;
    setSlides((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, { ...slide, content: { ...(slide.content || {}) } });
      return next;
    });
    setCurrentIndex(index + 1);
  };

  const removeSlide = (index) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setCurrentIndex((i) => (i >= index && i > 0 ? i - 1 : i));
  };

  const setSlideLayout = (layout) => {
    if (!LAYOUTS[layout]) return;
    setSlides((prev) => {
      const next = [...prev];
      const slide = next[currentIndex];
      next[currentIndex] = { ...slide, layout, content: { ...LAYOUTS[layout].defaultContent, ...(slide.content || {}) } };
      return next;
    });
  };

  const setSlideTransition = (transition) => {
    setSlides((prev) => {
      const next = [...prev];
      const slide = next[currentIndex];
      next[currentIndex] = { ...slide, transition };
      return next;
    });
  };

  const setSlideElementAnimation = (elementAnimation) => {
    setSlides((prev) => {
      const next = [...prev];
      const slide = next[currentIndex];
      next[currentIndex] = { ...slide, elementAnimation };
      return next;
    });
  };

  const reorderSlides = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= slides.length || toIndex >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
    setCurrentIndex(toIndex);
  };

  const handleSlideDragStart = (e, index) => {
    setDragSlideIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleSlideDragEnd = () => {
    setDragSlideIndex(null);
    setDropTargetIndex(null);
  };
  const handleSlideDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };
  const handleSlideDragLeave = () => setDropTargetIndex(null);
  const handleSlideDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) reorderSlides(fromIndex, toIndex);
    setDragSlideIndex(null);
    setDropTargetIndex(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (presentationOpen) return;
      const target = e.target;
      const isEditable = target && (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (isEditable) return;
      if (e.key === 'Delete' && slides.length > 1) {
        e.preventDefault();
        removeSlide(currentIndex);
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowUp') { e.preventDefault(); moveSlide(currentIndex, 'up'); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); moveSlide(currentIndex, 'down'); }
        else if (e.key === 'd') { e.preventDefault(); duplicateSlide(currentIndex); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presentationOpen, currentIndex, slides.length]);

  const presentationSlide = slides[currentIndex];
  const presentationHtml = presentationSlide ? renderSlideToHtml(presentationSlide, true) : '';
  const hasSlides = slides.length > 0;

  return (
    <div className={`app ${chatMinimized ? '' : 'app--chat-open'} ${hasSlides ? 'app--has-slides' : ''}`}>
      {hasSlides && (
        <ChatSidebar
          onPresentationGenerated={handlePresentationGenerated}
          minimized={chatMinimized}
          onToggleMinimize={() => setChatMinimized((m) => !m)}
        />
      )}

      <header className="toolbar">
        <div className="toolbar-left">
          <h1 className="logo">
            <span className="logo-icon" aria-hidden="true" />
            SlideDeck
          </h1>
          {hasSlides && (
            <>
              <span className="deck-title-input deck-title-display" title="Título da apresentação">{deckTitle}</span>
              {templateId && (
                <span className="toolbar-template-badge" title="Template usado no export PPTX">
                  Template: {templateId}
                </span>
              )}
            </>
          )}
        </div>
        <div className="toolbar-right">
          <button type="button" className="toolbar-theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'} aria-label="Alternar tema">
            <iconify-icon icon="lucide:sun" className="theme-icon theme-icon--light" />
            <iconify-icon icon="lucide:moon" className="theme-icon theme-icon--dark" />
          </button>
          {hasSlides && (
            <>
              <button type="button" className="btn btn-ai" onClick={() => setChatMinimized(false)} title="Gerar mais slides com IA">
                {TOOLBAR.createWithAI}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => {
                  try {
                    await downloadPptx({ deckTitle, slides, templateId });
                  } catch (e) {
                    alert(e?.message || 'Erro ao baixar. Verifica se o servidor está a correr (porta 3788).');
                  }
                }}
                title={TOOLBAR.downloadPptxTitle}
              >
                {TOOLBAR.downloadPptx}
              </button>
              <button type="button" className="btn btn-primary" onClick={openPresentation} title={TOOLBAR.presentTitle}>
                {TOOLBAR.present}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="workspace">
        {!hasSlides ? (
          <AnimatedAIChat onCreated={handlePresentationGenerated} />
        ) : (
          <>
            <aside className="slide-panel">
              <div className="slide-panel-header">
                <span>{EDITOR.slidesLabel}</span>
                <button type="button" className="btn btn-icon slide-panel-add" onClick={addSlide} title={TOOLBAR.addSlide}>+</button>
              </div>
              {showDragHint && (
                <div className="slide-panel-drag-hint">
                  <span>{EDITOR.dragHint}</span>
                  <button type="button" className="slide-panel-drag-hint-dismiss" onClick={dismissDragHint} aria-label="Fechar">×</button>
                </div>
              )}
              <div className="slide-thumbnails">
                {slides.map((slide, i) => {
                  const title = slide.content?.title || slide.content?.text || 'Slide';
                  const preview = typeof title === 'string' ? title : (slide.content?.left || '').slice(0, 60);
                  const isDragging = dragSlideIndex === i;
                  const isDropTarget = dropTargetIndex === i;
                  return (
                <div
                  key={i}
                  className={`slide-thumb ${i === currentIndex ? 'active' : ''} ${isDragging ? 'slide-thumb--dragging' : ''} ${isDropTarget ? 'slide-thumb--drop-target' : ''}`}
                  draggable
                  onDragStart={(e) => handleSlideDragStart(e, i)}
                  onDragEnd={handleSlideDragEnd}
                  onDragOver={(e) => handleSlideDragOver(e, i)}
                  onDragLeave={handleSlideDragLeave}
                  onDrop={(e) => handleSlideDrop(e, i)}
                  onClick={() => setCurrentIndex(i)}
                >
                  <span className="slide-thumb-num">{i + 1}</span>
                  <div className="slide-thumb-content">{preview}</div>
                  <div className="slide-thumb-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="slide-thumb-btn" onClick={() => moveSlide(i, 'up')} disabled={i === 0} title={EDITOR.moveUp} aria-label={EDITOR.moveUp}>
                      <iconify-icon icon="lucide:arrow-up" />
                    </button>
                    <button type="button" className="slide-thumb-btn" onClick={() => moveSlide(i, 'down')} disabled={i === slides.length - 1} title={EDITOR.moveDown} aria-label={EDITOR.moveDown}>
                      <iconify-icon icon="lucide:arrow-down" />
                    </button>
                    <button type="button" className="slide-thumb-btn" onClick={() => duplicateSlide(i)} title={EDITOR.duplicate} aria-label={EDITOR.duplicate}>
                      <iconify-icon icon="lucide:copy" />
                    </button>
                    <button type="button" className="slide-thumb-btn slide-thumb-remove" onClick={() => removeSlide(i)} disabled={slides.length <= 1} title={EDITOR.remove} aria-label={EDITOR.remove}>
                      <iconify-icon icon="lucide:trash-2" />
                    </button>
                  </div>
                </div>
              );
                })}
              </div>
            </aside>

            <section className="editor-area">
              <div className="editor-canvas-wrapper" onBlur={syncContentFromEditor}>
                <div ref={editorRef} className="editor-canvas" data-ratio="16/9" />
              </div>
              <p className="editor-area__hint">{EDITOR.hint}</p>
              <div className="slide-templates">
                <span className="templates-label">{EDITOR.layoutLabel}</span>
                <div className="slide-templates-groups">
                  {LAYOUT_GROUPS.map((group) => (
                    <div key={group.label} className="template-group">
                      <span className="template-group__label">{group.label}</span>
                      <div className="template-buttons">
                        {group.keys.map((key) => (
                          <button
                            key={key}
                            type="button"
                            className={`template-btn ${currentSlide?.layout === key ? 'active' : ''}`}
                            onClick={() => setSlideLayout(key)}
                          >
                            {LAYOUTS[key]?.name || key}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {currentSlide && (
                  <div className="slide-options-row">
                    <label className="slide-options-label">{EDITOR.transitionLabel}</label>
                <select
                  className="slide-options-select"
                  value={currentSlide.transition || 'fade'}
                  onChange={(e) => setSlideTransition(e.target.value)}
                >
                  {TRANSITIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                    <label className="slide-options-label">{EDITOR.animationLabel}</label>
                <select
                  className="slide-options-select"
                  value={currentSlide.elementAnimation || 'fade'}
                  onChange={(e) => setSlideElementAnimation(e.target.value)}
                >
                  {ELEMENT_ANIMATIONS.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>
          </>
        )}
      </main>

      {presentationOpen && (
        <div className="presentation-mode" id="presentation-mode">
          <button type="button" className="presentation-close" onClick={closePresentation} aria-label="Sair">×</button>
          <div className="presentation-slide-wrapper">
            <div className="presentation-slide" dangerouslySetInnerHTML={{ __html: presentationHtml }} />
          </div>
          <div className="presentation-nav">
            <button type="button" className="presentation-nav-btn" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} aria-label="Anterior">‹</button>
            <span className="presentation-counter">{currentIndex + 1} / {slides.length}</span>
            <button type="button" className="presentation-nav-btn" onClick={() => setCurrentIndex((i) => Math.min(slides.length - 1, i + 1))} aria-label="Próximo">›</button>
          </div>
        </div>
      )}
    </div>
  );
}
