import { motion } from "framer-motion";
void motion;
import { calculateBalancesWithDetails } from "../utils/splitLogic";

const BalanceList = ({ expenses, members }) => {
  const balances = calculateBalancesWithDetails(expenses, members);

  return (
    <motion.div
      className="glass rounded-3xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-xl font-semibold mb-4">Balances</h3>

      {Object.entries(balances).map(([person, data]) => (
        <motion.div
          key={person}
          whileHover={{ scale: 1.02 }}
          className="bg-black/30 rounded-xl p-4 mb-3"
        >
          <div className="flex justify-between">
            <span>{person}</span>
            <span className={data.total >= 0 ? "text-green-400" : "text-red-400"}>
              ₹{Math.abs(data.total)}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BalanceList;
