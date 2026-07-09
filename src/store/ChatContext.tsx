/**
 * ChatContext — In-memory chat state provider.
 *
 * Preserves the KrishiMitra AI chat conversation across page navigations
 * within the same app session (React tree stays mounted).
 *
 * Automatically discards all state on:
 *  - Browser refresh (F5 / Ctrl+R)
 *  - Tab/browser close
 *  - New app launch
 *
 * ⚠️  No localStorage, sessionStorage, IndexedDB, cookies, or any persistent
 *     storage is used — state lives purely in React runtime memory.
 */
import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessageItem {
  role: 'user' | 'ai';
  text: string;
  intent?: string;
}

interface ChatState {
  /** Ordered list of chat messages. */
  chatMessages: ChatMessageItem[];
  /** Current (unsent) input value. */
  chatInput: string;
  /** Backend-assigned session ID for multi-turn context. */
  sessionId: string | undefined;
  /** Whether the AI is currently generating a response. */
  chatLoading: boolean;
  /** Selected farm ID for chat context. */
  selectedFarmId: string;
}

interface ChatActions {
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessageItem[]>>;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  setSessionId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFarmId: React.Dispatch<React.SetStateAction<string>>;
  /** Convenience: reset the entire chat to its initial empty state. */
  resetChat: () => void;
}

type ChatContextValue = ChatState & ChatActions;

// ── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState('');

  const resetChat = useCallback(() => {
    setChatMessages([]);
    setChatInput('');
    setSessionId(undefined);
    setChatLoading(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chatMessages,
        chatInput,
        sessionId,
        chatLoading,
        selectedFarmId,
        setChatMessages,
        setChatInput,
        setSessionId,
        setChatLoading,
        setSelectedFarmId,
        resetChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within a <ChatProvider>');
  }
  return ctx;
}
