import AnimatedPage from "../components/AnimatedPage";
import useGroups from "../context/useGroups";
import useAuth from "../auth/useAuth";
import { calculateBalancesWithDetails } from "../utils/splitLogic";

const Summary = () => {
  const { user } = useAuth();
  const data = useGroups();

  const groups = data?.groups ?? [];
  const expensesByGroup = data?.expensesByGroup ?? {};

  let totalYouOwe = 0;
  let totalYouGet = 0;

  const currentUserId = user?.id || user?._id;

  groups.forEach((group) => {
    const expenses = (
      expensesByGroup[group.id] ||
      expensesByGroup[group._id] ||
      []
    ).filter((e) => !e.deleted);

    const balances = calculateBalancesWithDetails(
      expenses,
      group.members || [],
      currentUserId
    );

    // Look up current user's balance by their ID
    const myBalance = balances[currentUserId?.toString()];
    if (!myBalance) return;

    if (myBalance.total < 0) {
      totalYouOwe += Math.abs(myBalance.total);
    } else {
      totalYouGet += myBalance.total;
    }
  });

  const net = totalYouGet - totalYouOwe;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white py-10">
        <div className="max-w-3xl mx-auto px-4 space-y-8">

          <h1 className="text-3xl font-bold text-center">Summary</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 text-center">
              <p className="text-gray-400 mb-2">You Owe</p>
              <p className="text-3xl font-bold text-red-400">
                ₹{totalYouOwe.toFixed(2)}
              </p>
            </div>
            <div className="glass rounded-3xl p-6 text-center">
              <p className="text-gray-400 mb-2">You Get</p>
              <p className="text-3xl font-bold text-emerald-400">
                ₹{totalYouGet.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 text-center">
            <p className="text-gray-400 mb-2">Net Balance</p>
            <p className={`text-2xl font-bold ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ₹{net.toFixed(2)}
            </p>
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
};

export default Summary;