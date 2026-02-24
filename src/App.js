import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LAYOUTS, DEFAULT_SLIDE, TRANSITIONS, ELEMENT_ANIMATIONS } from './constants';
import { TOOLBAR, EDITOR, LAYOUT_GROUPS } from './constants/copy';
import { renderSlideToHtml, getContentFromEditor } from './utils/slideRender';
import { downloadPptx } from './utils/exportPptx';
import { ChatSidebar } from './components/ChatSidebar';
import { AnimatedAIChat } from './components/ui/AnimatedAIChat';
import './App.css';

const THEME_KEY = 'slidedeck-theme';
const initialSlides = [];

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (_) {}
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export default function App() {
  const [deckTitle, setDeckTitle] = useState('Minha Apresentação');
  const [slides, setSlides] = useState(initialSlides);
  const [templateId, setTemplateId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brandColors, setBrandColors] = useState(null);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [theme, setThemeState] = useState('dark');
  const editorRef = useRef(null);

  const currentSlide = slides[currentIndex] || slides[0];
  const hasSlides = slides.length > 0;

  useEffect(() => {
    const t = getInitialTheme();
    document.documentElement.setAttribute('data-theme', t);
    setThemeState(t);
  }, []);

  const setTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    setThemeState(newTheme);
    try { localStorage.setItem(THEME_KEY, newTheme); } catch (_) {}
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handlePresentationGenerated = ({ deckTitle: title, slides: newSlides, brandColors: colors, templateId: tplId }) => {
    setDeckTitle(title || 'Minha Apresentação');
    setSlides(newSlides);
    setCurrentIndex(0);
    setBrandColors(colors || null);
    setTemplateId(tplId || null);
  };

  const syncContentFromEditor = useCallback(() => {
    if (!editorRef.current || currentIndex < 0 || currentIndex >= slides.length) return;
    const content = getContentFromEditor(editorRef.current, slides[currentIndex]);
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

  if (!hasSlides) {
    return (
      <div className="app-empty">
        <AnimatedAIChat onCreated={handlePresentationGenerated} />
      </div>
    );
  }

  return (
    <div className={`app ${chatMinimized ? 'chat-collapsed' : ''}`} data-theme={theme}>
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="logo">
            <span className="logo-icon">◇</span>
            <span>SlideDeck</span>
          </div>
          <input
            type="text"
            className="deck-title-input"
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            placeholder="Título da apresentação"
          />
        </div>
        <div className="top-bar-center">
          {templateId && <span className="template-badge">Template: {templateId}</span>}
        </div>
        <div className="top-bar-right">
          <button className="btn-icon" onClick={toggleTheme} title="Alternar tema">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn btn-ai" onClick={() => setChatMinimized(!chatMinimized)}>
            ✨ Criar com IA
          </button>
          <button className="btn btn-secondary" onClick={() => downloadPptx({ deckTitle, slides, templateId })}>
            📥 Exportar
          </button>
          <button className="btn btn-primary" onClick={() => setPresentationOpen(true)}>
            ▶ Apresentar
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="workspace">
        {/* Left Sidebar - Chat */}
        <aside className={`left-sidebar ${chatMinimized ? 'collapsed' : ''}`}>
          <ChatSidebar
            onPresentationGenerated={handlePresentationGenerated}
            minimized={chatMinimized}
            onToggleMinimize={() => setChatMinimized(!chatMinimized)}
          />
        </aside>

        {/* Center - Canvas */}
        <main className="center-area">
          <div className="canvas-container">
            <div className="editor-canvas-wrapper" onBlur={syncContentFromEditor}>
              <div ref={editorRef} className="editor-canvas" data-ratio="16/9" />
            </div>
          </div>

          {/* Navigation */}
          <div className="slide-nav">
            <button
              className="nav-btn"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              ‹ Anterior
            </button>
            <span className="slide-counter">
              {currentIndex + 1} / {slides.length}
            </span>
            <button
              className="nav-btn"
              onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))}
              disabled={currentIndex === slides.length - 1}
            >
              Próximo ›
            </button>
          </div>

          {/* Layout Controls */}
          <div className="layout-controls">
            <span className="control-label">Layout:</span>
            <div className="layout-buttons">
              {Object.entries(LAYOUTS).map(([key, layout]) => (
                <button
                  key={key}
                  className={`layout-btn ${currentSlide?.layout === key ? 'active' : ''}`}
                  onClick={() => setSlideLayout(key)}
                  title={layout.name}
                >
                  {layout.name}
                </button>
              ))}
            </div>
          </div>

          {/* Slide Thumbnails - Horizontal */}
          <div className="thumbnails-strip">
            <div className="thumbnails-scroll">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={`thumb-item ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(i)}
                >
                  <span className="thumb-num">{i + 1}</span>
                  <div className="thumb-preview">
                    {slide.content?.title?.slice(0, 30) || 'Slide'}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-add-slide" onClick={addSlide}>+</button>
          </div>
        </main>
      </div>

      {/* Presentation Mode */}
      {presentationOpen && (
        <div className="presentation-mode">
          <button className="presentation-close" onClick={() => setPresentationOpen(false)}>
            ×
          </button>
          <div className="presentation-content">
            <div
              className="presentation-slide"
              dangerouslySetInnerHTML={{ __html: renderSlideToHtml(currentSlide, true) }}
            />
          </div>
          <div className="presentation-nav">
            <button
              className="pres-nav-btn"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              ‹
            </button>
            <span className="pres-counter">{currentIndex + 1} / {slides.length}</span>
            <button
              className="pres-nav-btn"
              onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))}
              disabled={currentIndex === slides.length - 1}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
