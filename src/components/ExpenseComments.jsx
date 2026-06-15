import { useState, useEffect } from "react";
import { fetchJsonWithAuth } from "../api";
import useAuth from "../auth/useAuth";

const ExpenseComments = ({ expenseId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

useEffect(() => {
  if (!open) return;

  const loadComments = async () => {
    try {
      const data = await fetchJsonWithAuth(`/api/comments/${expenseId}`);
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  loadComments();
}, [open, expenseId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const data = await fetchJsonWithAuth(`/api/comments/${expenseId}`, {
        method: "POST",
        body: { text },
      });
      setComments((prev) => [...prev, data.comment]);
      setText("");
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-slate-400 hover:text-white transition"
      >
        {open ? "Hide" : `💬 Comments (${comments.length})`}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {comments.map((c) => (
            <div key={c._id} className="bg-black/20 rounded-lg px-3 py-2">
              <p className="text-xs text-emerald-400 font-medium">{c.author?.name}</p>
              <p className="text-sm text-white">{c.text}</p>
            </div>
          ))}
          <form onSubmit={handleAdd} className="flex gap-2 mt-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-black/30 rounded-lg px-3 py-1.5 text-xs outline-none border border-white/10 focus:border-emerald-400"
            />
            <button type="submit" className="text-emerald-400 text-xs font-semibold">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExpenseComments;