import CustomPieChart from "../Charts/CustomPieChart";

interface InvoiceOverviewProps {
  paid: number;
  unpaid: number;
  pending: number;
  total: number;
}

const InvoiceOverview = ({ paid, unpaid, pending, total }: InvoiceOverviewProps) => {
  const COLORS = ["#4fbf8b", "#FA2C37", "#FA8C16"];

  const invoiceData = [
    { name: "Paid", amount: paid },
    { name: "Unpaid", amount: unpaid },
    { name: "Pending", amount: pending },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Invoice Overview</h5>
      </div>
      <CustomPieChart
        data={invoiceData}
        label="Total Invoices"
        colors={COLORS}
        totalInspections={total}
        showTextAnchor
      />
    </div>
  );
};

export default InvoiceOverview;