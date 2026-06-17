import { useState } from "react";

const ExpenseForm = ({ members, onAddExpense, groupId }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splits, setSplits] = useState({});
  const [shares, setShares] = useState({});
  const [payments, setPayments] = useState({});
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("other");

  const getName = (m) => (typeof m === "object" ? m.name : m);
  const getId = (m) => (typeof m === "object" ? m._id : m);

  const updateSplit = (id, v) => setSplits((p) => ({ ...p, [id]: Number(v) }));
  const updateShares = (id, v) => setShares((p) => ({ ...p, [id]: Number(v) }));
  const updatePayment = (id, v) => setPayments((p) => ({ ...p, [id]: Number(v) }));
  const CATEGORIES = [
    { value: "food", label: "🍔 Food" },
    { value: "travel", label: "✈️ Travel" },
    { value: "rent", label: "🏠 Rent" },
    { value: "utilities", label: "💡 Utilities" },
    { value: "entertainment", label: "🎬 Entertainment" },
    { value: "shopping", label: "🛍️ Shopping" },
    { value: "health", label: "💊 Health" },
    { value: "other", label: "📦 Other" },
  ];

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      const token = localStorage.getItem("splitwise_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/api/groups/${groupId}/upload-receipt`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await response.json();
      setReceiptUrl(data.url);
    } catch (err) {
      alert("Failed to upload receipt");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const total = Number(amount);
    const paidTotal = Object.values(payments).reduce((a, b) => a + b, 0);
    if (paidTotal !== total) {
      alert("Total paid must equal expense amount");
      return;
    }

    let finalSplits = {};

    if (splitType === "equal") {
      const share = total / members.length;
      members.forEach((m) => (finalSplits[getId(m)] = share));
    }
    if (splitType === "exact") {
      const sum = Object.values(splits).reduce((a, b) => a + b, 0);
      if (sum !== total) { alert("Exact amounts must match total"); return; }
      finalSplits = splits;
    }
    if (splitType === "percentage") {
      const sum = Object.values(splits).reduce((a, b) => a + b, 0);
      if (sum !== 100) { alert("Percentages must total 100%"); return; }
      members.forEach((m) => (finalSplits[getId(m)] = (splits[getId(m)] / 100) * total));
    }
    if (splitType === "shares") {
      const totalShares = Object.values(shares).reduce((a, b) => a + b, 0);
      if (!totalShares) { alert("Enter shares"); return; }
      const perShare = total / totalShares;
      members.forEach((m) => (finalSplits[getId(m)] = (shares[getId(m)] || 0) * perShare));
    }

    const paidById = Object.keys(payments).find((key) => payments[key] > 0) || getId(members[0]);
    const splitBetweenIds = Object.keys(finalSplits);

    try {
      await onAddExpense({
        description,
        amount: total,
        paidById,
        splitBetweenIds,
        receiptUrl,
        category,
      });
      setDescription("");
      setAmount("");
      setSplits({});
      setShares({});
      setPayments({});
      setReceiptUrl(null);
    } catch (error) {
      console.error("Failed to add expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
    glass
    rounded-[32px]
    p-8
    space-y-6
    fade-up
    border
    border-white/10
  "
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            Add Expense
          </h3>

          <p className="text-slate-400 text-sm mt-1">
            Record and split expenses among group members
          </p>
        </div>

        <div
          className="
      h-12
      w-12
      rounded-2xl
      bg-gradient-to-r
      from-cyan-400
      to-emerald-400
      flex
      items-center
      justify-center
      text-black
      font-bold
    "
        >
          ₹
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <select
          className="
      h-12
      rounded-2xl
      bg-white/[0.04]
      border
      border-white/10
      px-4
      outline-none
    "
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="
      h-12
      rounded-2xl
      bg-white/[0.04]
      border
      border-white/10
      px-4
      outline-none
    "
        />

      </div>

      <input
        placeholder="Dinner, Hotel, Cab..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="
    w-full
    h-12
    rounded-2xl
    bg-white/[0.04]
    border
    border-white/10
    px-4
    outline-none
  "
      />

      <select
        className="
  w-full
  h-12
  rounded-2xl
  bg-white/[0.04]
  border
  border-white/10
  px-4
  outline-none
"
        value={splitType}
        onChange={(e) => setSplitType(e.target.value)}
      >
        <option value="equal">Equal</option>
        <option value="exact">Exact</option>
        <option value="percentage">Percentage</option>
        <option value="shares">Shares</option>
      </select>

      {(splitType === "exact" || splitType === "percentage") &&
        members.map((m) => (
          <input
            key={getId(m)}
            placeholder={splitType === "percentage" ? `${getName(m)} %` : `${getName(m)} amount`}
            type="number"
            className="
                w-full
                h-11
                rounded-xl
                bg-white/[0.04]
                border
                border-white/10
                px-4
                outline-none
              "
            onChange={(e) => updateSplit(getId(m), e.target.value)}
          />
        ))}

      {splitType === "shares" &&
        members.map((m) => (
          <input
            key={getId(m)}
            placeholder={`${getName(m)} shares`}
            type="number"
            className="
                w-full
                h-11
                rounded-xl
                bg-white/[0.04]
                border
                border-white/10
                px-4
                outline-none
              "
            onChange={(e) => updateShares(getId(m), e.target.value)}
          />
        ))}

      <div className="pt-4 border-t border-white/20">
        <h4 className="text-sm text-gray-300 mb-2">Who paid?</h4>
        {members.map((m) => (
          <input
            key={getId(m)}
            placeholder={`${getName(m)} paid`}
            type="number"
            className="
                w-full
                h-11
                rounded-xl
                bg-white/[0.04]
                border
                border-white/10
                px-4
                mb-2
                outline-none
              "
            onChange={(e) => updatePayment(getId(m), e.target.value)}
          />
        ))}
      </div>

      {/* RECEIPT UPLOAD */}
      <div className="pt-4 border-t border-white/20">
        <h4 className="text-sm text-gray-300 mb-2">Attach Receipt (optional)</h4>
        <input
          type="file"
          accept="image/*"
          onChange={handleReceiptUpload}
          className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-400 file:text-black file:font-semibold cursor-pointer"
        />
        {uploading && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
        {receiptUrl && (
          <div className="mt-2">
            <img
              src={receiptUrl}
              alt="Receipt"
              className="
                w-28
                h-28
                object-cover
                rounded-2xl
                border
                border-white/10
              "
            />
            <p className="text-xs text-emerald-400 mt-1">✅ Receipt uploaded</p>
          </div>
        )}
      </div>

      <button
        className="
    w-full
    h-14
    rounded-2xl
    bg-gradient-to-r
    from-cyan-400
    to-emerald-400
    text-black
    font-bold
    transition-all
    hover:scale-[1.01]
  "
      >
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;
