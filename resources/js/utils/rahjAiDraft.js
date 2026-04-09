const RAHJ_AI_DRAFT_KEY = 'rahj_ai_draft_action';

function safeParse(raw) {
  if (!raw || typeof raw !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function stashRahjAiDraftAction(action) {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }

  if (!action || typeof action !== 'object') {
    return;
  }

  const next = {
    ...action,
    stored_at: Date.now(),
  };

  window.sessionStorage.setItem(RAHJ_AI_DRAFT_KEY, JSON.stringify(next));
}

export function consumeRahjAiDraftPayload(target) {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  const parsed = safeParse(window.sessionStorage.getItem(RAHJ_AI_DRAFT_KEY));
  if (!parsed || parsed.target !== target || typeof parsed.payload !== 'object' || !parsed.payload) {
    return null;
  }

  window.sessionStorage.removeItem(RAHJ_AI_DRAFT_KEY);
  return parsed.payload;
}
