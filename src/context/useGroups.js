import { useContext } from "react";
import GroupContext from "./GroupContext.js";

const useGroups = () => {
  const context = useContext(GroupContext);

  if (!context) {
    throw new Error(
      "useGroups must be used inside GroupProvider"
    );
  }

  return context;
};

export default useGroups;
