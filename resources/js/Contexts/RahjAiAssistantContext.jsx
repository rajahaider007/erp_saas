import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import RahjAiSlidePanel from '../Components/RahjAi/RahjAiSlidePanel';

const RahjAiAssistantContext = createContext(null);

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function RahjAiAssistantProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);

  const openAssistant = useCallback(() => setOpen(true), []);
  const closeAssistant = useCallback(() => setOpen(false), []);

  const replacePending = useCallback((pendingId, updater) => {
    setMessages((prev) => prev.map((msg) => {
      if (msg.id !== pendingId) {
        return msg;
      }
      return typeof updater === 'function' ? updater(msg) : updater;
    }));
  }, []);

  const normalizeHistoryMessage = useCallback((msg, index) => ({
    id: String(msg.id || `h-${index}`),
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: String(msg.content || ''),
    model: msg.model || null,
    sources: Array.isArray(msg.sources) ? msg.sources : [],
    meta: msg.meta && typeof msg.meta === 'object' ? msg.meta : null,
    action: msg.action && typeof msg.action === 'object' ? msg.action : null,
    error: Boolean(msg.error),
    pending: false,
  }), []);

  const refreshConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const response = await window.axios.get('/rahj-ai/conversations');
      const payload = response?.data || {};
      if (payload.success && Array.isArray(payload.conversations)) {
        setConversations(payload.conversations);
      }
    } catch {
      // Ignore sidebar history load failure.
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const loadConversation = useCallback(async (id) => {
    if (!id) return;

    setThreadLoading(true);
    try {
      const response = await window.axios.get('/rahj-ai/history', { params: { conversation_id: id } });
      const payload = response?.data || {};
      if (!payload.success) {
        return;
      }

      const history = Array.isArray(payload.messages) ? payload.messages : [];
      setMessages(history.map(normalizeHistoryMessage));
      setConversationId(payload.conversation_id || null);
    } catch {
      // Keep current thread if fetch fails.
    } finally {
      setThreadLoading(false);
    }
  }, [normalizeHistoryMessage]);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        const response = await window.axios.get('/rahj-ai/history');
        const payload = response?.data || {};
        if (!active || !payload.success) {
          return;
        }

        const history = Array.isArray(payload.messages) ? payload.messages : [];
        setMessages(history.map(normalizeHistoryMessage));

        setConversationId(payload.conversation_id || null);
      } catch (error) {
        // Ignore history bootstrap errors and allow fresh conversation.
      } finally {
        if (active) {
          setHistoryLoaded(true);
        }
      }
    };

    loadHistory();
    refreshConversations();

    return () => {
      active = false;
    };
  }, [normalizeHistoryMessage, refreshConversations]);

  const sendMessage = useCallback(async (overrideText) => {
    const raw = overrideText !== undefined && overrideText !== null ? String(overrideText) : draft;
    const text = raw.trim();
    if (!text) return;

    if (overrideText === undefined || overrideText === null) {
      setDraft('');
    }

    const pendingId = nextId('a');
    setMessages((m) => [
      ...m,
      { id: nextId('u'), role: 'user', content: text },
      { id: pendingId, role: 'assistant', pending: true, content: '' },
    ]);

    try {
      const response = await window.axios.post('/rahj-ai/chat', {
        message: text,
        conversation_id: conversationId,
      });
      const payload = response?.data || {};

      if (!payload.success) {
        throw new Error(payload.message || 'RAHJ AI request failed');
      }

      if (payload.conversation_id) {
        setConversationId(payload.conversation_id);
      }

      replacePending(pendingId, {
        id: pendingId,
        role: 'assistant',
        pending: false,
        content: String(payload.answer || '').trim() || 'No response received.',
        model: payload.model || null,
        sources: Array.isArray(payload.sources) ? payload.sources : [],
        meta: payload.meta && typeof payload.meta === 'object' ? payload.meta : null,
        action: payload.action && typeof payload.action === 'object' ? payload.action : null,
      });

      refreshConversations();
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unable to reach RAHJ AI right now.';
      replacePending(pendingId, {
        id: pendingId,
        role: 'assistant',
        pending: false,
        error: true,
        content: message,
      });
    }
  }, [conversationId, draft, replacePending, refreshConversations]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setDraft('');
  }, []);

  const clearConversation = useCallback(async () => {
    if (conversationId) {
      try {
        await window.axios.delete(`/rahj-ai/conversations/${conversationId}`);
      } catch {
        // Even if delete fails, allow local reset.
      }
    }

    setMessages([]);
    setConversationId(null);
    setDraft('');
    refreshConversations();
  }, [conversationId, refreshConversations]);

  const clearAllConversations = useCallback(async () => {
    try {
      await window.axios.delete('/rahj-ai/conversations');
    } catch {
      // Even if clear-all fails, keep local thread reset for UX continuity.
    }

    setMessages([]);
    setConversationId(null);
    setDraft('');
    refreshConversations();
  }, [refreshConversations]);

  const clearConversationLocal = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setDraft('');
  }, []);

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
      startNewChat,
      clearConversation,
      clearAllConversations,
      clearConversationLocal,
      conversations,
      conversationsLoading,
      refreshConversations,
      loadConversation,
      threadLoading,
      conversationId,
      historyLoaded,
    }),
    [
      open,
      openAssistant,
      closeAssistant,
      messages,
      draft,
      sendMessage,
      startNewChat,
      clearConversation,
      clearAllConversations,
      clearConversationLocal,
      conversations,
      conversationsLoading,
      refreshConversations,
      loadConversation,
      threadLoading,
      conversationId,
      historyLoaded,
    ],
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
