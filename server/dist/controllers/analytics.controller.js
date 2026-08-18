"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const User_1 = __importDefault(require("../models/User"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
// @desc        Get full application analytics
// @route       GET /api/v1/admin/analytics
// @access      Private (Admin only)
exports.getAnalytics = (0, catchAsyncErrors_1.catchAsyncError)(async (req, res, next) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const [totalUsers, activeUsers, inactiveUsers, newUsersLast30Days, userGrowth, invoiceFacetResult, topUsersByInvoiceCount, recentInvoices, recentUsers,] = await Promise.all([
        User_1.default.countDocuments(),
        User_1.default.countDocuments({ isActive: true }),
        User_1.default.countDocuments({ isActive: false }),
        User_1.default.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        // User growth — new signups per month for the last 12 months
        User_1.default.aggregate([
            { $match: { createdAt: { $gte: oneYearAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        Invoice_1.default.aggregate([
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    newLast30Days: [
                        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                        { $count: "count" },
                    ],
                    byStatusAndCurrency: [
                        {
                            $group: {
                                _id: { status: "$status", currency: "$currency.code" },
                                count: { $sum: 1 },
                                total: { $sum: "$total" },
                            },
                        },
                    ],
                    growth: [
                        { $match: { createdAt: { $gte: oneYearAgo } } },
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$createdAt" },
                                    month: { $month: "$createdAt" },
                                    currency: "$currency.code",
                                },
                                revenue: { $sum: "$total" },
                                invoiceCount: { $sum: 1 },
                            },
                        },
                        { $sort: { "_id.year": 1, "_id.month": 1 } },
                    ],
                },
            },
        ]),
        Invoice_1.default.aggregate([
            {
                $group: {
                    _id: { user: "$user", currency: "$currency.code" },
                    invoiceCount: { $sum: 1 },
                    revenue: { $sum: "$total" },
                },
            },
            {
                $group: {
                    _id: "$_id.user",
                    invoiceCount: { $sum: "$invoiceCount" },
                    revenueByCurrency: {
                        $push: { currency: "$_id.currency", amount: "$revenue" },
                    },
                },
            },
            { $sort: { invoiceCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    businessName: "$user.businessName",
                    invoiceCount: 1,
                    revenueByCurrency: 1,
                },
            },
        ]),
        Invoice_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name email businessName")
            .select("invoiceNumber status total createdAt billTo currency"),
        User_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("name email businessName isActive createdAt"),
    ]);
    const facet = invoiceFacetResult[0];
    const totalInvoices = facet.totalCount[0]?.count || 0;
    const newInvoicesLast30Days = facet.newLast30Days[0]?.count || 0;
    const statusCounts = new Map();
    const revenueMap = new Map();
    for (const row of facet.byStatusAndCurrency) {
        const status = row._id.status;
        const currency = row._id.currency || "UNKNOWN";
        statusCounts.set(status, (statusCounts.get(status) || 0) + row.count);
        const entry = revenueMap.get(currency) || {
            currency,
            total: 0,
            paid: 0,
            unpaid: 0,
            pending: 0,
            invoiceCount: 0,
            averageInvoiceValue: 0,
        };
        entry.total += row.total;
        entry.invoiceCount += row.count;
        if (status === "Paid")
            entry.paid += row.total;
        else if (status === "Unpaid")
            entry.unpaid += row.total;
        else if (status === "Pending")
            entry.pending += row.total;
        revenueMap.set(currency, entry);
    }
    const statusBreakdown = Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count }));
    const revenueByCurrency = Array.from(revenueMap.values()).map((r) => ({
        ...r,
        averageInvoiceValue: r.invoiceCount
            ? Math.round(r.total / r.invoiceCount)
            : 0,
    }));
    const paidInvoices = statusCounts.get("Paid") || 0;
    const unpaidInvoices = statusCounts.get("Unpaid") || 0;
    const pendingInvoices = statusCounts.get("Pending") || 0;
    // Reshape monthly growth rows into per-currency series
    const growthByCurrency = new Map();
    for (const row of facet.growth) {
        const currency = row._id.currency || "UNKNOWN";
        const series = growthByCurrency.get(currency) || [];
        series.push({
            year: row._id.year,
            month: row._id.month,
            revenue: row.revenue,
            invoiceCount: row.invoiceCount,
        });
        growthByCurrency.set(currency, series);
    }
    const revenueGrowth = Array.from(growthByCurrency.entries()).map(([currency, months]) => ({ currency, months }));
    res.status(200).json({
        success: true,
        analytics: {
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                newLast30Days: newUsersLast30Days,
                growth: userGrowth,
            },
            invoices: {
                total: totalInvoices,
                paid: paidInvoices,
                unpaid: unpaidInvoices,
                pending: pendingInvoices,
                newLast30Days: newInvoicesLast30Days,
                statusBreakdown,
            },
            revenue: {
                byCurrency: revenueByCurrency,
                growth: revenueGrowth,
            },
            topUsers: topUsersByInvoiceCount,
            recentActivity: {
                invoices: recentInvoices,
                users: recentUsers,
            },
        },
    });
});
