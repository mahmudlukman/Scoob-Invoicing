import { BarChart2, FileText, LayoutDashboard, Mail, Plus, Sparkles, User } from "lucide-react";

export const FEATURES = [
    {
        icon: Sparkles,
        title: "AI Invoice Creation",
        description: "Paste any text, email, or receipt, and let our AI Instantly generate a complete, professional invoice for you.",
    },
    {
        icon: BarChart2,
        title: "AI-Powered Dashboard",
        description: "Get smart, actionable insights about your business finances, generated automatically by our AI analyst.",
    },
    {
        icon: Mail,
        title: "Smart Reminders",
        description: "Automatically generate polite and effective payment reminder emails for overdue invoices with a single click.",
    },
    {
        icon: FileText,
        title: "Easy Invoice Management",
        description: "Easily manage all your invoices, track payment, and send reminders for overdue payments.",
    }
];

export const TESTIMONIALS = [
    {
        quote: '"This app saved me hours of work, I can now create and  send invoices in minutes!"',
        author: "Jane Doe",
        title: "Freelance Designer",
        avatar: "https://placehold.co/100x100/000000/ffffff?text=JD",
    },
    {
        quote: '"The invoicing app I have ever used. Simple, intutive, and powerful"',
        author: "Jane Smith",
        title: "Small Business Owner",
        avatar: "https://placehold.co/100x100/000000/ffffff?text=JS",
    },
    {
        quote: '"I love the dashboard and reporting features. It helps me keep track of my finances effortessly."',
        author: "Peter Jones",
        title: "Consultant",
        avatar: "https://placehold.co/100x100/000000/ffffff?text=PJ",
    },
];

export const FAQS = [
    {
        question: "How does the AI invoice creation work?",
        answer: "Simply paste any text that contains invoice details-like an email."
    },
    {
        question: "Is there of free trial available?",
        answer: "Yes, you can try our platform for free for 14 days. If you want, we will provide.."
    },
    {
        question: "Can i change my plan letter?",
        answer: "Of course. Our pricing scales with your company. Chat to our friendly team to connect."
    },
    {
        question: "What is your cancellation policy?",
        answer: "We understand that things change. you can cancel your plan at anytime."
    },
    {
        question: "Can other info be added to and invoice?",
        answer: "Yes, you can add notes, payment terms, and even attach file to your invoices."
    },
    {
        question: "How does billing work?",
        answer: "Plants are per workspace, not par account. You can upgrade one workspace."
    },
];

// Navigation items configuration
export const NAVIGATION_MENU = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "invoices", name: "Invoices", icon: FileText },
    { id: "invoices/new", name: "Create Invoice", icon: Plus },
    { id: "profile", name: "Profile", icon: User },
];