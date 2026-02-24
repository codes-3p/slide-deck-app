import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  ImageIcon,
  FileUp,
  Sparkles,
  MonitorIcon,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Command,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EMPTY_STATE, SUGGESTIONS } from '../../constants/copy';
import './AnimatedAIChat.css';

const API_BASE = '';

function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(
    (reset) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const commandSuggestions = [
  { icon: <Sparkles className="animated-chat__command-icon" style={{ width: 16, height: 16 }} />, label: 'Pitch de startup', description: 'Problema, solução, métricas e CTA', prefix: '/pitch' },
  { icon: <MonitorIcon className="animated-chat__command-icon" style={{ width: 16, height: 16 }} />, label: 'Relatório trimestral', description: 'Dados e conclusões', prefix: '/relatorio' },
  { icon: <FileUp className="animated-chat__command-icon" style={{ width: 16, height: 16 }} />, label: 'Onboarding', description: 'Missão, valores e primeiros passos', prefix: '/onboarding' },
  { icon: <ImageIcon className="animated-chat__command-icon" style={{ width: 16, height: 16 }} />, label: 'Apresentação de produto', description: 'Benefícios e casos de uso', prefix: '/produto' },
];

function TypingDots() {
  return (
    <div className="animated-chat__dots">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="animated-chat__dot"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function AnimatedAIChat({ onCreated }) {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState('openai');
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch((API_BASE || '') + '/api/providers')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.providers) && d.providers.length) {
          setProviders(d.providers);
          const first = d.providers.find((p) => p.id === 'openai') || d.providers[0];
          if (first) setProvider(first.id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommandPalette(true);
      const idx = commandSuggestions.findIndex((cmd) => cmd.prefix.startsWith(value));
      setActiveSuggestion(idx >= 0 ? idx : -1);
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const commandButton = document.querySelector('[data-command-button]');
      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getErrorMessage = (err, status) => {
    if (err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('fetch'))
      return EMPTY_STATE.errorNetwork;
    if (status === 429) return 'Muitas gerações agora. Espere um minuto e tente de novo.';
    if (status >= 500) return EMPTY_STATE.errorGeneric + ' ' + EMPTY_STATE.errorRetry;
    return err?.message || EMPTY_STATE.errorGeneric;
  };

  const handleSendMessage = async () => {
    const text = value.trim();
    if (!text && attachments.length === 0) return;
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', text || 'Gere uma apresentação com base no arquivo anexado.');
      formData.append('deckTitle', 'Minha Apresentação');
      formData.append('provider', provider);
      attachments.forEach((file) => formData.append('file', file));

      const res = await fetch((API_BASE || '') + '/api/generate', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(getErrorMessage(new Error(data.error || `Erro ${res.status}`), res.status));
        setIsLoading(false);
        return;
      }
      if (!data.slides?.length) {
        setError(EMPTY_STATE.errorEmpty);
        setIsLoading(false);
        return;
      }

      onCreated?.({
        deckTitle: data.deckTitle || 'Minha Apresentação',
        slides: data.slides,
        brandColors: data.brandColors,
        templateId: data.templateId,
      });
      setValue('');
      setAttachments([]);
      adjustHeight(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion((prev) => (prev < commandSuggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : commandSuggestions.length - 1));
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selected = commandSuggestions[activeSuggestion];
          setValue(SUGGESTIONS[activeSuggestion] || selected.prefix + ' ');
          setShowCommandPalette(false);
          setTimeout(() => setActiveSuggestion(-1), 100);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() || attachments.length) handleSendMessage();
    }
  };

  const handleAttachFile = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const files = e.target?.files;
    if (files?.length) setAttachments((prev) => [...prev, ...Array.from(files)]);
    e.target.value = '';
  };

  const removeAttachment = (index) => setAttachments((prev) => prev.filter((_, i) => i !== index));

  const selectCommandSuggestion = (index) => {
    const selected = commandSuggestions[index];
    setValue(SUGGESTIONS[index] || selected.prefix + ' ');
    setShowCommandPalette(false);
    setTimeout(() => setActiveSuggestion(-1), 100);
  };

  const canSubmit = (value.trim() || attachments.length) && !isLoading;

  return (
    <div className="animated-chat lab-bg">
      <div className="animated-chat__bg">
        <div className="animated-chat__blur animated-chat__blur--1" />
        <div className="animated-chat__blur animated-chat__blur--2" />
        <div className="animated-chat__blur animated-chat__blur--3" />
      </div>

      <div className="animated-chat__container">
        <motion.div
          className="animated-chat__inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="animated-chat__header">
            <motion.h1
              className="animated-chat__title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {EMPTY_STATE.title}
            </motion.h1>
            <motion.p
              className="animated-chat__subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {EMPTY_STATE.subtitle}
            </motion.p>
          </div>

          <motion.div
            className="animated-chat__card"
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence>
              {showCommandPalette && (
                <motion.div
                  ref={commandPaletteRef}
                  className="animated-chat__command-palette"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="animated-chat__command-list">
                    {commandSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.prefix}
                        className={`animated-chat__command-item ${activeSuggestion === index ? 'animated-chat__command-item--active' : ''}`}
                        onClick={() => selectCommandSuggestion(index)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {suggestion.icon}
                        <span className="animated-chat__command-label">{suggestion.label}</span>
                        <span className="animated-chat__command-prefix">{suggestion.prefix}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="animated-chat__input-wrap">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(null);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={EMPTY_STATE.inputPlaceholder}
                className="animated-chat__textarea"
                style={{ overflow: 'hidden' }}
                disabled={isLoading}
              />
            </div>

            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  className="animated-chat__attachments"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      className="animated-chat__attachment"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <span>{file.name}</span>
                      <button type="button" className="animated-chat__attachment-remove" onClick={() => removeAttachment(index)} aria-label="Remover">
                        <XIcon size={12} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="animated-chat__error-wrap">
                <p className="animated-chat__error">{error}</p>
                <button type="button" className="animated-chat__error-retry" onClick={() => setError(null)}>
                  {EMPTY_STATE.errorRetry}
                </button>
              </div>
            )}

            <div className="animated-chat__footer">
              <div className="animated-chat__actions">
                <input ref={fileInputRef} type="file" accept=".pptx,.txt,.md,.pdf,image/*" multiple hidden onChange={onFileChange} />
                <button
                  type="button"
                  className="animated-chat__btn-icon"
                  onClick={handleAttachFile}
                  disabled={isLoading}
                  aria-label="Anexar"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  type="button"
                  data-command-button
                  className={`animated-chat__btn-icon ${showCommandPalette ? 'animated-chat__btn-icon--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCommandPalette((prev) => !prev);
                  }}
                  disabled={isLoading}
                  aria-label="Comandos"
                >
                  <Command size={16} />
                </button>
                {providers.length > 1 && (
                  <select
                    className="animated-chat__select"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    disabled={isLoading}
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <button
                type="button"
                className={`animated-chat__submit ${canSubmit ? 'animated-chat__submit--primary' : 'animated-chat__submit--muted'}`}
                onClick={handleSendMessage}
                disabled={!canSubmit}
              >
                {isLoading ? <LoaderIcon size={16} className="animated-chat__spinner" /> : <SendIcon size={16} />}
                <span>{EMPTY_STATE.generateButton}</span>
              </button>
            </div>
          </motion.div>

          <div className="animated-chat__chips">
            {commandSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.prefix}
                type="button"
                className="animated-chat__chip"
                onClick={() => selectCommandSuggestion(index)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                disabled={isLoading}
              >
                {suggestion.icon}
                <span>{suggestion.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="animated-chat__typing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="animated-chat__typing-inner">
              <div className="animated-chat__typing-avatar">IA</div>
              <div className="animated-chat__typing-text">
                <span>{EMPTY_STATE.generatingButton}</span>
                <TypingDots />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {inputFocused && (
        <motion.div
          className="animated-chat__spotlight"
          animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150, mass: 0.5 }}
        />
      )}
    </div>
  );
}
