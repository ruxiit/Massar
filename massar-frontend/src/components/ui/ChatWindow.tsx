"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  X,
  PaperPlaneTilt,
  ChatsCircle,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import apiClient from "@/lib/apiClient";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_role: string;
  created_at: string;
  sender: { full_name: string; role: string };
}

interface ChatWindowProps {
  /** The supervision_request.id this chat belongs to */
  supervisionRequestId: string;
  /** ID of the currently logged-in user (decoded from JWT) */
  currentUserId: string;
  /** Display name of the other party */
  peerName: string;
  /** Called when the user closes the chat window */
  onClose: () => void;
}

export function ChatWindow({
  supervisionRequestId,
  currentUserId,
  peerName,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Fetch messages ───────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      // Sanitize ID: remove any trailing garbage like ':1' if it exists
      const cleanId = supervisionRequestId.split(':')[0];
      const { data } = await apiClient.get(`/chat/${cleanId}`);
      setMessages(data);
    } catch (e) {
      // Silently ignore polling errors
    } finally {
      setLoading(false);
    }
  }, [supervisionRequestId]);

  // Poll every 2 seconds for new messages (real-time feel without WS)
  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMessages]);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || sending) return;

    setSending(true);
    setNewMessage(""); // optimistic clear
    try {
      const cleanId = supervisionRequestId.split(':')[0];
      const { data } = await apiClient.post(`/chat/${cleanId}`, {
        content: text,
      });
      setMessages((prev) => {
        // Avoid duplicate if polling already picked it up
        if (prev.find((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    } catch {
      setNewMessage(text); // restore on error
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("ar-DZ", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 left-6 z-[70] w-[360px] flex flex-col bg-white rounded-[28px] shadow-2xl shadow-dark-navy/25 border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-primary to-dark-navy shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ChatsCircle size={20} weight="fill" className="text-white" />
          </div>
          <div>
            <div className="text-white font-black text-sm truncate max-w-[180px]">
              {peerName}
            </div>
            <div className="text-white/60 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              محادثة مباشرة
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all"
        >
          <X size={16} weight="bold" />
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="overflow-y-auto px-4 py-4 space-y-3 h-[320px] bg-slate-50/40">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ArrowsClockwise size={28} className="animate-spin text-primary opacity-60" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <ChatsCircle size={48} weight="thin" className="text-slate-300" />
            <p className="text-text-muted font-bold text-sm">لا توجد رسائل بعد</p>
            <p className="text-text-muted text-xs">ابدأ المحادثة الآن</p>
          </div>
        ) : (
          messages.map((msg) => {
            // Robust comparison: handle potential case sensitivity or type issues
            const isMe = msg.sender_id && currentUserId && 
                         msg.sender_id.toLowerCase() === currentUserId.toLowerCase();
            
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-start" : "justify-end"}`}
                dir="rtl"
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-[18px] shadow-sm ${
                    isMe
                      ? "bg-primary text-white rounded-tr-[4px]"
                      : "bg-white text-dark-navy rounded-tl-[4px] border border-slate-100"
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-black text-primary mb-1">
                      {msg.sender?.full_name}
                    </p>
                  )}
                  <p className="text-sm font-medium leading-relaxed break-words">
                    {msg.content}
                  </p>
                  <p
                    className={`text-[10px] font-bold mt-1 text-left ${
                      isMe ? "text-white/50" : "text-text-muted"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-3 py-3 border-t border-slate-100 bg-white shrink-0"
      >
        <input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e as any);
            }
          }}
          placeholder="اكتب رسالة..."
          className="flex-1 px-4 py-2.5 rounded-[14px] bg-slate-50 border-2 border-slate-100 focus:border-primary outline-none font-medium text-dark-navy text-sm text-right transition-all"
          dir="rtl"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="w-10 h-10 shrink-0 rounded-[14px] bg-primary hover:bg-dark-navy disabled:opacity-40 flex items-center justify-center text-white transition-all shadow-md shadow-primary/20"
        >
          {sending ? (
            <ArrowsClockwise size={16} className="animate-spin" />
          ) : (
            <PaperPlaneTilt size={18} weight="fill" />
          )}
        </button>
      </form>
    </div>
  );
}
