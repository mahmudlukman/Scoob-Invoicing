import { LuArrowRight, LuReceipt, LuTrendingUp, LuUser } from "react-icons/lu";
import { addThousandsSeparator, currency } from "../../utils/helper";
interface RevenueByCurrency {
  currency?: string;
  amount: number;
}
interface TopUser {
  userId: string;
  name: string;
  email: string;
  businessName?: string;
  invoiceCount: number;
  revenueByCurrency: RevenueByCurrency[];
}
interface TopUsersProps {
  users?: TopUser[];
  onSeeAll?: () => void;
}
const TopUsers = ({ users = [], onSeeAll }: TopUsersProps) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/80">
      {" "}
      {/* Header */}{" "}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
        {" "}
        <div>
          {" "}
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            {" "}
            Top Users{" "}
          </h3>{" "}
          <p className="text-xs text-slate-500 mt-0.5">
            {" "}
            Users with the most invoice activity{" "}
          </p>{" "}
        </div>{" "}
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-colors cursor-pointer shrink-0"
          >
            {" "}
            <span>See All</span> <LuArrowRight className="text-sm" />{" "}
          </button>
        )}{" "}
      </div>{" "}
      {/* Users */}{" "}
      <div className="mt-3 sm:mt-4 space-y-2">
        {" "}
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {" "}
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-slate-100 items-center justify-center mb-2">
              {" "}
              <LuUser className="w-5 h-5 text-slate-400" />{" "}
            </div>{" "}
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              {" "}
              No top users yet{" "}
            </p>{" "}
            <p className="text-xs text-slate-400 mt-0.5">
              {" "}
              Users with invoice activity will appear here.{" "}
            </p>{" "}
          </div>
        ) : (
          users.map((user, index) => {
            const totalRevenue = user.revenueByCurrency.reduce(
              (total, item) => total + item.amount,
              0,
            );
            return (
              <div
                key={user.userId}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {" "}
                {/* Rank */}{" "}
                <div className="hidden sm:flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  {" "}
                  #{index + 1}{" "}
                </div>{" "}
                {/* Avatar */}{" "}
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center">
                  {" "}
                  <LuUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />{" "}
                </div>{" "}
                {/* User information */}{" "}
                <div className="min-w-0 flex-1">
                  {" "}
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {" "}
                    {user.name}{" "}
                  </p>{" "}
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {" "}
                    {user.businessName || user.email}{" "}
                  </p>{" "}
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    {" "}
                    <LuReceipt className="w-3 h-3 shrink-0" />{" "}
                    <span>
                      {" "}
                      {user.invoiceCount}{" "}
                      {user.invoiceCount === 1 ? "invoice" : "invoices"}{" "}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Revenue */}{" "}
                <div className="shrink-0 text-right">
                  {" "}
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
                    {" "}
                    {currency} {addThousandsSeparator(totalRevenue)}{" "}
                  </p>{" "}
                  <div className="flex items-center justify-end gap-1 text-[10px] sm:text-xs text-green-500 mt-0.5">
                    {" "}
                    <LuTrendingUp className="w-3 h-3" />{" "}
                    <span>Revenue</span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            );
          })
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default TopUsers;
