import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  
  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSplitTypeDropdown, setShowSplitTypeDropdown] = useState(false);

  const getName = (m) => (typeof m === "object" ? m.name : m);
  const getId = (m) => (typeof m === "object" ? m._id : m);

  const updateSplit = (id, v) => setSplits((p) => ({ ...p, [id]: Number(v) }));
  const updateShares = (id, v) => setShares((p) => ({ ...p, [id]: Number(v) }));
  const updatePayment = (id, v) => setPayments((p) => ({ ...p, [id]: Number(v) }));

  // CATEGORIES - Using lowercase values that match backend
  const CATEGORIES = [
    { value: "food", label: "🍔 Food" },
    { value: "travel", label: "✈️ Travel" },
    { value: "rent", label: "🏠 Rent" },
    { value: "utilities", label: "💡 Utilities" },
    { value: "entertainment", label: "🎬 Entertainment" },
    { value: "shopping", label: "🛍️ Shopping" },
    { value: "health", label: "💊 Health" },
    { value: "education", label: "📚 Education" },
    { value: "transportation", label: "🚗 Transportation" },
    { value: "insurance", label: "🛡️ Insurance" },
    { value: "other", label: "📦 Other" },
  ];

  const SPLIT_TYPES = [
    { value: "equal", label: "Equal", description: "Split equally among all members" },
    { value: "exact", label: "Exact", description: "Enter exact amounts per member" },
    { value: "percentage", label: "Percentage", description: "Split by percentage" },
    { value: "shares", label: "Shares", description: "Split by share ratio" },
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
    if (!description || !amount) {
      alert("Please enter a description and amount");
      return;
    }

    const total = Number(amount);
    const paidTotal = Object.values(payments).reduce((a, b) => a + b, 0);
    
    // Check if any payment was entered
    const hasPayment = Object.values(payments).some(val => val > 0);
    if (!hasPayment) {
      alert("Please enter who paid and how much");
      return;
    }
    
    if (paidTotal !== total) {
      alert(`Total paid (₹${paidTotal}) must equal expense amount (₹${total})`);
      return;
    }

    let finalSplits = {};

    if (splitType === "equal") {
      const share = total / members.length;
      members.forEach((m) => (finalSplits[getId(m)] = share));
    }
    if (splitType === "exact") {
      const sum = Object.values(splits).reduce((a, b) => a + b, 0);
      if (sum !== total) { 
        alert(`Exact amounts (₹${sum}) must match total (₹${total})`); 
        return; 
      }
      finalSplits = splits;
    }
    if (splitType === "percentage") {
      const sum = Object.values(splits).reduce((a, b) => a + b, 0);
      if (sum !== 100) { 
        alert(`Percentages (${sum}%) must total 100%`); 
        return; 
      }
      members.forEach((m) => (finalSplits[getId(m)] = (splits[getId(m)] || 0) / 100 * total));
    }
    if (splitType === "shares") {
      const totalShares = Object.values(shares).reduce((a, b) => a + b, 0);
      if (!totalShares) { 
        alert("Please enter shares for all members"); 
        return; 
      }
      const perShare = total / totalShares;
      members.forEach((m) => (finalSplits[getId(m)] = (shares[getId(m)] || 0) * perShare));
    }

    const paidById = Object.keys(payments).find((key) => payments[key] > 0) || getId(members[0]);
    const splitBetweenIds = Object.keys(finalSplits);

    // Log what's being sent for debugging
    console.log("📝 Submitting expense:", {
      description,
      amount: total,
      paidById,
      splitBetweenIds,
      category,
      splitType,
    });

    try {
      await onAddExpense({
        description,
        amount: total,
        paidById,
        splitBetweenIds,
        receiptUrl,
        category, // ✅ Category is being passed correctly
      });
      
      // Reset form
      setDescription("");
      setAmount("");
      setSplits({});
      setShares({});
      setPayments({});
      setReceiptUrl(null);
      setCategory("other");
      setSplitType("equal");
      
      console.log("✅ Expense added successfully!");
    } catch (error) {
      console.error("❌ Failed to add expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };

  // Get selected category label
  const getSelectedCategoryLabel = () => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.label || "📦 Other";
  };

  // Get selected split type label
  const getSelectedSplitLabel = () => {
    const type = SPLIT_TYPES.find(t => t.value === splitType);
    return type?.label || "⚖️ Equal";
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
          <h3 className="text-2xl font-bold">Add Expense</h3>
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
        {/* Category Dropdown - Glass Style */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowSplitTypeDropdown(false);
            }}
            className="
              w-full
              h-12
              rounded-2xl
              bg-white/[0.04]
              border
              border-white/10
              px-4
              outline-none
              flex
              items-center
              justify-between
              hover:bg-white/[0.08]
              transition
              text-left
            "
          >
            <span>{getSelectedCategoryLabel()}</span>
            {showCategoryDropdown ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showCategoryDropdown && (
            <div
              className="
                absolute
                left-0
                top-14
                w-full
                rounded-2xl
                z-[9999]
                bg-slate-950
                border
                border-slate-800
                overflow-hidden
                shadow-[0_20px_50px_rgba(0,0,0,0.6)]
              "
            >
              <div className="p-3 border-b border-white/5">
                <h4 className="text-xs font-semibold text-slate-400">Select Category</h4>
              </div>
              <div className="max-h-[240px] overflow-y-auto p-2 space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat.value);
                      setShowCategoryDropdown(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
                      ${category === cat.value
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-slate-300 hover:bg-white/[0.05]"
                      }
                    `}
                  >
                    <span>{cat.label}</span>
                    {category === cat.value && (
                      <span className="ml-auto text-cyan-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Amount Input */}
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
            focus:border-cyan-400/50
            transition
          "
        />
      </div>

      {/* Description Input */}
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
          focus:border-cyan-400/50
          transition
        "
      />

      {/* Split Type Dropdown - Glass Style */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowSplitTypeDropdown(!showSplitTypeDropdown);
            setShowCategoryDropdown(false);
          }}
          className="
            w-full
            h-12
            rounded-2xl
            bg-white/[0.04]
            border
            border-white/10
            px-4
            outline-none
            flex
            items-center
            justify-between
            hover:bg-white/[0.08]
            transition
            text-left
          "
        >
          <span>{getSelectedSplitLabel()}</span>
          {showSplitTypeDropdown ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showSplitTypeDropdown && (
          <div
            className="
              absolute
              left-0
              top-14
              w-full
              rounded-2xl
              z-[9999]
              bg-slate-950
              border
              border-slate-800
              overflow-hidden
              shadow-[0_20px_50px_rgba(0,0,0,0.6)]
            "
          >
            <div className="p-3 border-b border-white/5">
              <h4 className="text-xs font-semibold text-slate-400">Split Type</h4>
            </div>
            <div className="p-2 space-y-1">
              {SPLIT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSplitType(type.value);
                    setShowSplitTypeDropdown(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
                    ${splitType === type.value
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "text-slate-300 hover:bg-white/[0.05]"
                    }
                  `}
                >
                  <span>{type.label}</span>
                  <span className="text-xs text-slate-500 ml-auto">{type.description}</span>
                  {splitType === type.value && (
                    <span className="text-cyan-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Split Inputs */}
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
              focus:border-cyan-400/50
              transition
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
              focus:border-cyan-400/50
              transition
            "
            onChange={(e) => updateShares(getId(m), e.target.value)}
          />
        ))}

      {/* Who paid section */}
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
              focus:border-cyan-400/50
              transition
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
        type="submit"
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
          hover:shadow-lg
          hover:shadow-cyan-400/20
        "
      >
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;