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

  const currentUserId =
    (user?.id || user?._id)?.toString();

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
      socketRef?.current?.emit(
        "leave:group",
        groupId
      );

      socketRef?.current?.off("message:new");
    };
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await fetchJsonWithAuth(
        `/api/messages/${groupId}`
      );

      setMessages(data.messages || []);
    } catch (err) {
      console.error(
        "Failed to load messages:",
        err
      );
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    setSending(true);

    try {
      await fetchJsonWithAuth(
        `/api/messages/${groupId}`,
        {
          method: "POST",
          body: { text },
        }
      );

      setText("");
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="
        glass
        rounded-[32px]
        border
        border-white/10
        flex
        flex-col
        overflow-hidden
        h-[70vh]
        min-h-[550px]
      "
    >
      {/* Header */}
      <div
        className="
          px-6
          py-5
          border-b
          border-white/10
          flex
          items-center
          justify-between
        "
      >
        <div>
          <h3 className="text-2xl font-bold">
            Group Chat
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            Real-time group conversation
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            text-emerald-400
            text-sm
            font-medium
          "
        >
          <div
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-emerald-400
            "
          />

          Online
        </div>
      </div>

      {/* Messages */}
      <div
        className="
          flex-1
          overflow-y-auto
          px-6
          py-6
          space-y-4
        "
      >
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              💬
            </div>

            <h4 className="text-xl font-semibold">
              Start the conversation
            </h4>

            <p className="text-slate-500 mt-2">
              No messages yet.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const senderId =
            (
              msg.sender?._id ||
              msg.sender?.id ||
              msg.sender
            )?.toString();

          const isMe =
            senderId === currentUserId;

          return (
            <div
              key={
                msg._id ||
                `${msg.createdAt}-${msg.text}`
              }
              className={`flex ${
                isMe
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[80%]
                  px-5
                  py-3
                  rounded-3xl
                  shadow-lg
                  ${
                    isMe
                      ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
                      : "bg-white/[0.05] border border-white/10 text-white"
                  }
                `}
              >
                {!isMe && (
                  <p
                    className="
                      text-xs
                      font-semibold
                      mb-2
                      text-cyan-400
                    "
                  >
                    {msg.sender?.name ||
                      "Member"}
                  </p>
                )}

                <p className="break-words leading-relaxed">
                  {msg.text}
                </p>

                <p
                  className={`text-[11px] mt-2 ${
                    isMe
                      ? "text-black/60"
                      : "text-slate-400"
                  }`}
                >
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="
          p-5
          border-t
          border-white/10
          flex
          gap-3
        "
      >
        <input
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Type a message..."
          className="
            flex-1
            h-12
            rounded-2xl
            bg-white/[0.04]
            border
            border-white/10
            px-4
            outline-none
            focus:border-cyan-400
          "
        />

        <button
          type="submit"
          disabled={
            sending || !text.trim()
          }
          className="
            px-6
            rounded-2xl
            bg-gradient-to-r
            from-cyan-400
            to-emerald-400
            text-black
            font-semibold
            transition-all
            hover:scale-[1.02]
            disabled:opacity-50
          "
        >
          {sending
            ? "Sending..."
            : "Send"}
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
