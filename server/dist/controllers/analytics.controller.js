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
    // ── User stats ────────────────────────────────────────────────────────────
    const totalUsers = await User_1.default.countDocuments();
    const activeUsers = await User_1.default.countDocuments({ isActive: true });
    const inactiveUsers = await User_1.default.countDocuments({ isActive: false });
    // New users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User_1.default.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    // User growth — new signups per month for the last 12 months
    const userGrowth = await User_1.default.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                },
            },
        },
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
    ]);
    // ── Invoice stats ─────────────────────────────────────────────────────────
    const totalInvoices = await Invoice_1.default.countDocuments();
    const paidInvoices = await Invoice_1.default.countDocuments({ status: "Paid" });
    const unpaidInvoices = await Invoice_1.default.countDocuments({ status: "Unpaid" });
    const pendingInvoices = await Invoice_1.default.countDocuments({ status: "Pending" });
    // New invoices in the last 30 days
    const newInvoicesLast30Days = await Invoice_1.default.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    // ── Revenue stats ─────────────────────────────────────────────────────────
    const revenueData = await Invoice_1.default.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$total" },
                paidRevenue: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "Paid"] }, "$total", 0],
                    },
                },
                unpaidRevenue: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "Unpaid"] }, "$total", 0],
                    },
                },
                pendingRevenue: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "Pending"] }, "$total", 0],
                    },
                },
                averageInvoiceValue: { $avg: "$total" },
            },
        },
    ]);
    const revenue = revenueData[0] || {
        totalRevenue: 0,
        paidRevenue: 0,
        unpaidRevenue: 0,
        pendingRevenue: 0,
        averageInvoiceValue: 0,
    };
    // Revenue per month for the last 12 months
    const revenueGrowth = await Invoice_1.default.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                revenue: { $sum: "$total" },
                invoiceCount: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    // ── Top users by invoice volume ───────────────────────────────────────────
    const topUsersByInvoiceCount = await Invoice_1.default.aggregate([
        {
            $group: {
                _id: "$user",
                invoiceCount: { $sum: 1 },
                totalRevenue: { $sum: "$total" },
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
                totalRevenue: 1,
            },
        },
    ]);
    // ── Invoice status breakdown (for pie chart) ──────────────────────────────
    const statusBreakdown = [
        { status: "Paid", count: paidInvoices },
        { status: "Unpaid", count: unpaidInvoices },
        { status: "Pending", count: pendingInvoices },
    ];
    // ── Recent activity — last 10 invoices created ────────────────────────────
    const recentInvoices = await Invoice_1.default.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email businessName")
        .select("invoiceNumber status total createdAt billTo");
    // ── Recent signups — last 10 users ────────────────────────────────────────
    const recentUsers = await User_1.default.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name email businessName isActive createdAt");
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
                total: revenue.totalRevenue,
                paid: revenue.paidRevenue,
                unpaid: revenue.unpaidRevenue,
                pending: revenue.pendingRevenue,
                averageInvoiceValue: Math.round(revenue.averageInvoiceValue || 0),
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
