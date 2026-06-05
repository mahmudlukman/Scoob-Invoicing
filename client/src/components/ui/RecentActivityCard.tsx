import { LuUser, LuFileText, LuTrendingUp } from "react-icons/lu";
import { addThousandsSeparator, currency } from "../../utils/helper";

interface RecentActivityCardProps {
  type: "invoice" | "user";
  name: string;
  subtitle: string;
  date: string;
  amount?: number;
  status?: "Paid" | "Unpaid" | "Pending";
}

const statusStyles: Record<string, string> = {
  Paid: "bg-green-50 text-green-500",
  Unpaid: "bg-red-50 text-red-500",
  Pending: "bg-orange-50 text-orange-500",
};

const RecentActivityCard = ({
  type,
  name,
  subtitle,
  date,
  amount,
  status,
}: RecentActivityCardProps) => {
  return (
    <div className="flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
      <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
        {type === "invoice" ? <LuFileText /> : <LuUser />}
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700 font-medium">{name}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          <p className="text-xs text-gray-400 mt-0.5">{date}</p>
        </div>

        {type === "invoice" && amount !== undefined && status && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${statusStyles[status] ?? "bg-gray-50 text-gray-500"}`}
          >
            <h6 className="text-xs font-medium">
              {currency}
              {addThousandsSeparator(amount)}
            </h6>
            <LuTrendingUp />
          </div>
        )}

        {type === "user" && (
          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-500 rounded-md">
            New User
          </span>
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;
