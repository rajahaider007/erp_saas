import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import RahjAiSlidePanel from '../Components/RahjAi/RahjAiSlidePanel';

const RahjAiAssistantContext = createContext(null);

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function RahjAiAssistantProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  const openAssistant = useCallback(() => setOpen(true), []);
  const closeAssistant = useCallback(() => setOpen(false), []);

  const sendMessage = useCallback((overrideText) => {
    const raw = overrideText !== undefined && overrideText !== null ? String(overrideText) : draft;
    const text = raw.trim();
    if (!text) return;
    if (overrideText === undefined || overrideText === null) {
      setDraft('');
    }
    setMessages((m) => [
      ...m,
      { id: nextId('u'), role: 'user', content: text },
      { id: nextId('a'), role: 'assistant', pending: true, content: '' },
    ]);
  }, [draft]);

  const value = useMemo(
    () => ({
      openAssistant,
      closeAssistant,
      isOpen: open,
      setAssistantOpen: setOpen,
      messages,
      draft,
      setDraft,
      sendMessage,
    }),
    [open, openAssistant, closeAssistant, messages, draft, sendMessage],
  );

  return (
    <RahjAiAssistantContext.Provider value={value}>
      {children}
      <RahjAiSlidePanel open={open} onOpenChange={setOpen} />
    </RahjAiAssistantContext.Provider>
  );
}

export function useRahjAiAssistant() {
  const ctx = useContext(RahjAiAssistantContext);
  if (!ctx) {
    throw new Error('useRahjAiAssistant must be used within RahjAiAssistantProvider');
  }
  return ctx;
}
