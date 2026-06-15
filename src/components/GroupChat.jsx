import { useState, useEffect, useRef } from "react";
import { fetchJsonWithAuth } from "../api";
import useAuth from "../auth/useAuth";
import useSocket from "../context/useSocket";

const GroupChat = ({ groupId }) => {
  const { user } = useAuth();
  const socketRef = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const socket = socketRef?.current;
    if (socket) {
      socket.emit("join:group", groupId);
      socket.on("message:new", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }
    return () => {
      socketRef?.current?.emit("leave:group", groupId);
      socketRef?.current?.off("message:new");
    };
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await fetchJsonWithAuth(`/api/messages/${groupId}`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await fetchJsonWithAuth(`/api/messages/${groupId}`, {
        method: "POST",
        body: { text },
      });
      setText("");
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const currentUserId = user?.id || user?._id;

  return (
    <div className="glass rounded-3xl p-6 flex flex-col" style={{ height: "400px" }}>
      <h3 className="text-xl font-semibold mb-4">Group Chat</h3>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-slate-500 text-sm text-center mt-8">No messages yet. Say hi!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender?._id?.toString() === currentUserId?.toString();
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-emerald-500 text-black" : "bg-slate-700 text-white"}`}>
                {!isMe && <p className="text-xs font-semibold mb-1 text-emerald-300">{msg.sender?.name}</p>}
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-black/60" : "text-slate-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-black/40 rounded-xl px-4 py-2 text-sm outline-none border border-white/10 focus:border-emerald-400"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-emerald-400 text-black px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default GroupChat;