import { useState, useRef, useEffect } from 'react';

const WELCOME =
  'Szia! Én vagyok BékaBot 🐸 – a mindentudó. Kérdezz bátran a törökbálinti biológiai szúnyoggyérítésről, a mérési eredményekről, vagy arról, hogyan védheted meg a kerted a szúnyogoktól!';

export default function BekaBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        'Sajnálom, nem sikerült választ generálni. Kérlek, próbáld újra! 🐸';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Kapcsolódási hiba lépett fel. Kérlek, próbáld újra! 🐸' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="bb-wrap">
      {open && (
        <div className="bb-window" role="dialog" aria-label="BékaBot csevegőablak">
          <div className="bb-header">
            <div className="bb-header-avatar">🐸</div>
            <div className="bb-header-info">
              <div className="bb-header-name">BékaBot</div>
              <div className="bb-header-sub">a mindentudó · Törökbálint</div>
            </div>
            <button className="bb-close" onClick={() => setOpen(false)} aria-label="Bezárás">✕</button>
          </div>

          <div className="bb-messages">
            {messages.map((m, i) => (
              <div key={i} className={`bb-row bb-row-${m.role}`}>
                {m.role === 'assistant' && <div className="bb-avatar">🐸</div>}
                <div className="bb-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="bb-row bb-row-assistant">
                <div className="bb-avatar">🐸</div>
                <div className="bb-bubble bb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="bb-footer">
            <textarea
              ref={inputRef}
              className="bb-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Kérdezz a biológiai szúnyoggyérítésről…"
              disabled={loading}
              rows={1}
            />
            <button
              className="bb-send"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Küldés"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        className={`bb-fab${open ? ' bb-fab-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'BékaBot bezárása' : 'BékaBot megnyitása'}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <span className="bb-fab-icon">🐸</span>
        )}
      </button>
    </div>
  );
}
