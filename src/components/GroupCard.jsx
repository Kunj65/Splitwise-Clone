import { useNavigate } from "react-router-dom";

function GroupCard({ name, members, id }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/group/${id}`)}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {name}
        </h2>
        <span className="text-sm text-gray-400">
          {members} members
        </span>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        You are settled up
      </div>
    </div>
  );
}

export default GroupCard;
