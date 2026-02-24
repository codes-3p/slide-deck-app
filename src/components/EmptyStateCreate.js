import React, { useState, useRef } from 'react';
import './EmptyStateCreate.css';

const API_BASE = '';

const SUGGESTIONS = [
  'Pitch de startup: problema, solução, métricas e call to action',
  'Relatório trimestral com dados e conclusões',
  'Onboarding: missão, valores e primeiros passos',
  'Apresentação de produto com benefícios e casos de uso'
];

export default function EmptyStateCreate({ onCreated }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState('openai');
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text && !attachment) return;
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', text || 'Gere uma apresentação com base no arquivo anexado.');
      formData.append('deckTitle', 'Minha Apresentação');
      formData.append('provider', provider);
      if (attachment) formData.append('file', attachment);
      setAttachment(null);

      const res = await fetch((API_BASE || '') + '/api/generate', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      if (!data.slides?.length) throw new Error('Resposta inválida da API.');

      onCreated?.({
        deckTitle: data.deckTitle,
        slides: data.slides,
        brandColors: data.brandColors,
        templateId: data.templateId
      });
    } catch (err) {
      setError(err.message || 'Algo deu errado. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) setAttachment(file);
    e.target.value = '';
  };

  return (
    <div className="empty-state-create">
      <div className="empty-state-create__card">
        <h2 className="empty-state-create__title">Crie sua apresentação com IA</h2>
        <p className="empty-state-create__subtitle">
          Descreva o tema, o público e o objetivo. Em segundos você terá os slides prontos para editar e exportar em PowerPoint.
        </p>

        <form className="empty-state-create__form" onSubmit={handleSubmit}>
          <textarea
            className="empty-state-create__input"
            placeholder="Ex.: Apresentação para investidores sobre nossa startup de saúde digital, 10 slides, foco em problema e solução..."
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
                Anexar arquivo
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
              {loading ? 'Gerando...' : 'Gerar apresentação'}
            </button>
          </div>
          {attachment && (
            <div className="empty-state-create__attachment">
              {attachment.name}
              <button type="button" onClick={() => setAttachment(null)} aria-label="Remover">×</button>
            </div>
          )}
          {error && <p className="empty-state-create__error">{error}</p>}
        </form>

        <p className="empty-state-create__hint">Sugestões:</p>
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
