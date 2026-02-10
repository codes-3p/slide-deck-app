import React, { useState, useRef, useEffect } from 'react';
import { LAYOUTS, DEFAULT_SLIDE } from './constants';
import { renderSlideToHtml } from './utils/slideRender';
import { downloadPptx } from './utils/exportPptx';
import ChatSidebar from './components/ChatSidebar';
import './App.css';

const initialSlides = [
  { ...DEFAULT_SLIDE, content: { ...LAYOUTS.title.defaultContent } },
  { layout: 'bullet', content: { ...LAYOUTS.bullet.defaultContent }, transition: 'fade', elementAnimation: 'fade' }
];

export default function App() {
  const [deckTitle, setDeckTitle] = useState('Minha Apresentação');
  const [slides, setSlides] = useState(initialSlides);
  const [templateId, setTemplateId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brandColors, setBrandColors] = useState(null);
  const [chatMinimized, setChatMinimized] = useState(true);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const editorRef = useRef(null);

  const currentSlide = slides[currentIndex] || slides[0];

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

  useEffect(() => {
    const slide = slides[currentIndex];
    if (!slide) return;
    const html = renderSlideToHtml(slide, false, true);
    if (editorRef.current) editorRef.current.innerHTML = html;
  }, [currentIndex, slides]);

  const openPresentation = () => setPresentationOpen(true);

  const closePresentation = () => setPresentationOpen(false);

  const presentationSlide = slides[currentIndex];
  const presentationHtml = presentationSlide ? renderSlideToHtml(presentationSlide, true) : '';

  return (
    <div className={`app ${chatMinimized ? '' : 'app--chat-open'}`}>
      <ChatSidebar
        onPresentationGenerated={handlePresentationGenerated}
        minimized={chatMinimized}
        onToggleMinimize={() => setChatMinimized((m) => !m)}
      />

      <header className="toolbar">
        <div className="toolbar-left">
          <h1 className="logo">
            <span className="logo-icon" aria-hidden="true" />
            SlideDeck
          </h1>
          <span className="deck-title-input deck-title-display">{deckTitle}</span>
        </div>
        <div className="toolbar-right">
          {chatMinimized && (
            <button type="button" className="btn btn-ai" onClick={() => setChatMinimized(false)}>Criar com IA</button>
          )}
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
            disabled={!slides.length}
          >
            Baixar PPTX
          </button>
          <button type="button" className="btn btn-primary" onClick={openPresentation} disabled={!slides.length}>
            Visualizar
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="slide-panel">
          <div className="slide-panel-header">
            <span>Slides</span>
          </div>
          <div className="slide-thumbnails">
            {slides.map((slide, i) => {
              const title = slide.content?.title || slide.content?.text || 'Slide';
              const preview = typeof title === 'string' ? title : (slide.content?.left || '').slice(0, 60);
              return (
                <div
                  key={i}
                  className={`slide-thumb ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(i)}
                >
                  <span className="slide-thumb-num">{i + 1}</span>
                  <div className="slide-thumb-content">{preview}</div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="editor-area">
          <div className="editor-canvas-wrapper">
            <div ref={editorRef} className="editor-canvas" data-ratio="16/9" />
          </div>
        </section>
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
