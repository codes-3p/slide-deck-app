import React, { useState, useRef, useEffect } from 'react';
import './ChatSidebar.css';

const API_BASE = '';

const SUGGESTIONS = [
  'Pitch de startup: problema, solução, métricas e call to action',
  'Relatório trimestral com dados, gráficos e conclusões',
  'Onboarding da equipe: missão, valores e primeiros passos',
  'Apresentação de produto com benefícios e casos de uso'
];

export default function ChatSidebar({ onPresentationGenerated, minimized, onToggleMinimize }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Descreva o tema ou o conteúdo da apresentação. Eu gero os slides para você.', isWelcome: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState('openai');
  const fileInputRef = useRef(null);
  const historyEndRef = useRef(null);

  useEffect(() => {
    fetch((API_BASE || '') + '/api/providers')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.providers) && d.providers.length) {
          setProviders(d.providers);
          const first = d.providers.find((p) => p.id === 'openai') || d.providers[0];
          if (first) setProvider(first.id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: Date.now(), role, text }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !attachment) return;
    addMessage('user', text || (attachment ? `Anexo: ${attachment.name}` : ''));
    setInput('');
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
      if (!data.slides || !data.slides.length) throw new Error('Resposta inválida da API.');

      addMessage('ai', `Apresentação "${data.deckTitle || 'Sem título'}" criada com ${data.slides.length} slides.`);
      onPresentationGenerated && onPresentationGenerated({
        deckTitle: data.deckTitle,
        slides: data.slides,
        brandColors: data.brandColors,
        templateId: data.templateId
      });
    } catch (err) {
      addMessage('ai', `Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
    e.target.value = '';
  };

  const applySuggestion = (text) => {
    setInput(text);
  };

  return (
    <aside className={`chat-sidebar ${minimized ? 'chat-sidebar--minimized' : ''}`}>
      <div className="chat-sidebar__header">
        <h3>Assistente de IA</h3>
        <button type="button" className="chat-sidebar__toggle" onClick={onToggleMinimize} title={minimized ? 'Expandir' : 'Recolher'}>
          {minimized ? '>' : '<'}
        </button>
      </div>
      <div className="chat-sidebar__history">
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg chat-msg--${m.role}`}>
            <div className="chat-msg__avatar">{m.role === 'ai' ? 'IA' : 'Você'}</div>
            <div className="chat-msg__content">
              <p>{m.text}</p>
              {m.isWelcome && (
                <div className="chat-sidebar__suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} type="button" className="chat-sidebar__suggestion-chip" onClick={() => applySuggestion(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg--ai chat-msg--loading">
            <div className="chat-msg__avatar">IA</div>
            <div className="chat-msg__content"><p>Gerando sua apresentação...</p></div>
          </div>
        )}
        <div ref={historyEndRef} />
      </div>
      <div className="chat-sidebar__input-area">
        {providers.length > 1 && (
          <div className="chat-sidebar__provider">
            <label htmlFor="chat-provider">Modelo:</label>
            <select id="chat-provider" className="chat-sidebar__provider-select" value={provider} onChange={(e) => setProvider(e.target.value)}>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
        {attachment && (
          <div className="chat-sidebar__attachment">
            <span>{attachment.name}</span>
            <button type="button" onClick={() => setAttachment(null)} aria-label="Remover anexo">×</button>
          </div>
        )}
        <div className="chat-sidebar__input-wrap">
          <textarea
            className="chat-sidebar__input"
            placeholder="Descreva sua apresentação..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={loading}
          />
          <div className="chat-sidebar__actions">
            <button type="button" className="chat-sidebar__btn-attach" onClick={() => fileInputRef.current?.click()} title="Anexar arquivo">
              Anexar
            </button>
            <button type="button" className="chat-sidebar__btn-send" onClick={handleSend} disabled={loading} title="Enviar">
              Enviar
            </button>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept=".pptx,.txt,.md,.pdf,image/*" hidden onChange={onFileChange} />
      </div>
      <div className="chat-sidebar__footer">
        Enter para enviar · Shift+Enter nova linha
      </div>
    </aside>
  );
}
