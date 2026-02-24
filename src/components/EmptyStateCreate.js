import React, { useState, useRef } from 'react';
import SkeletonCreate from './SkeletonCreate';
import { EMPTY_STATE, SUGGESTIONS } from '../constants/copy';
import './EmptyStateCreate.css';

const API_BASE = '';

export default function EmptyStateCreate({ onCreated }) {
  const [input, setInput] = useState('');
  const [deckTitle, setDeckTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [providers, setProviders] = useState(() => {
    try {
      const list = window.__SLIDEDECK_PROVIDERS__;
      return Array.isArray(list) ? list : [];
    } catch (_) { return []; }
  });
  const [provider, setProvider] = useState(() => {
    try {
      const list = window.__SLIDEDECK_PROVIDERS__;
      if (Array.isArray(list) && list.length) {
        const p = list.find((x) => x.id === 'openai') || list[0];
        return p ? p.id : 'openai';
      }
    } catch (_) {}
    return 'openai';
  });
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    fetch((API_BASE || '') + '/api/providers?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.providers) && d.providers.length) {
          setProviders(d.providers);
          const first = d.providers.find((p) => p.id === 'openai') || d.providers[0];
          if (first) setProvider((prev) => (prev ? prev : first.id));
        }
      })
      .catch(() => {});
  }, []);

  const getErrorMessage = (err, status) => {
    if (err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('fetch')) return EMPTY_STATE.errorNetwork;
    if (status === 429) return 'Muitas gerações agora. Espere um minuto e tente de novo.';
    if (status >= 500) return EMPTY_STATE.errorGeneric + ' ' + EMPTY_STATE.errorRetry;
    if (err?.message?.includes('Resposta inválida') || err?.message?.includes('slides')) return EMPTY_STATE.errorEmpty;
    return err?.message || EMPTY_STATE.errorGeneric;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text && !attachment) return;
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', text || 'Gere uma apresentação com base no arquivo anexado.');
      formData.append('deckTitle', deckTitle.trim() || 'Minha Apresentação');
      formData.append('provider', provider);
      if (attachment) formData.append('file', attachment);
      setAttachment(null);

      const res = await fetch((API_BASE || '') + '/api/generate', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(getErrorMessage(new Error(data.error || `Erro ${res.status}`), res.status));
        setLoading(false);
        return;
      }
      if (!data.slides?.length) {
        setError(EMPTY_STATE.errorEmpty);
        setLoading(false);
        return;
      }

      onCreated?.({
        deckTitle: data.deckTitle || deckTitle.trim() || 'Minha Apresentação',
        slides: data.slides,
        brandColors: data.brandColors,
        templateId: data.templateId
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) setAttachment(file);
    e.target.value = '';
  };

  if (loading) return <SkeletonCreate />;

  return (
    <div className="empty-state-create">
      <div className="empty-state-create__card">
        <h2 className="empty-state-create__title">{EMPTY_STATE.title}</h2>
        <p className="empty-state-create__subtitle">{EMPTY_STATE.subtitle}</p>

        <form className="empty-state-create__form" onSubmit={handleSubmit}>
          <label className="empty-state-create__label">{EMPTY_STATE.titleLabel}</label>
          <input
            type="text"
            className="empty-state-create__title-input"
            placeholder={EMPTY_STATE.titlePlaceholder}
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            disabled={loading}
          />
          <textarea
            className="empty-state-create__input"
            placeholder={EMPTY_STATE.inputPlaceholder}
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            rows={4}
            disabled={loading}
          />
          <div className="empty-state-create__row">
            <div className="empty-state-create__actions">
              <button
                type="button"
                className="empty-state-create__btn secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                {EMPTY_STATE.attachFile}
              </button>
              <input ref={fileInputRef} type="file" accept=".pptx,.txt,.md,.pdf,image/*" hidden onChange={onFileChange} />
              {providers.length > 1 && (
                <select
                  className="empty-state-create__select"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  disabled={loading}
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="submit"
              className="empty-state-create__btn primary"
              disabled={loading || (!input.trim() && !attachment)}
            >
              {EMPTY_STATE.generateButton}
            </button>
          </div>
          {attachment && (
            <div className="empty-state-create__attachment">
              {attachment.name}
              <button type="button" onClick={() => setAttachment(null)} aria-label="Remover">×</button>
            </div>
          )}
          {error && (
            <div className="empty-state-create__error-wrap">
              <p className="empty-state-create__error">{error}</p>
              <button type="button" className="empty-state-create__error-retry" onClick={() => setError(null)}>
                {EMPTY_STATE.errorRetry}
              </button>
            </div>
          )}
        </form>

        <p className="empty-state-create__hint">{EMPTY_STATE.suggestionsLabel}</p>
        <div className="empty-state-create__chips">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              type="button"
              className="empty-state-create__chip"
              onClick={() => setInput(s)}
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
