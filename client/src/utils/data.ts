import {
  BarChart2,
  FileText,
  LayoutDashboard,
  Mail,
  Plus,
  Sparkles,
  User,
  UserRoundCog,
} from "lucide-react";
import type { InvoiceFormData } from "../@types";

export const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Invoice Creation",
    description:
      "Paste any text, email, or receipt, and let our AI Instantly generate a complete, professional invoice for you.",
  },
  {
    icon: BarChart2,
    title: "AI-Powered Dashboard",
    description:
      "Get smart, actionable insights about your business finances, generated automatically by our AI analyst.",
  },
  {
    icon: Mail,
    title: "Smart Reminders",
    description:
      "Automatically generate polite and effective payment reminder emails for overdue invoices with a single click.",
  },
  {
    icon: FileText,
    title: "Easy Invoice Management",
    description:
      "Easily manage all your invoices, track payment, and send reminders for overdue payments.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      '"This app saved me hours of work, I can now create and  send invoices in minutes!"',
    author: "Jane Doe",
    title: "Freelance Designer",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=JD",
  },
  {
    quote:
      '"The invoicing app I have ever used. Simple, intutive, and powerful"',
    author: "Jane Smith",
    title: "Small Business Owner",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=JS",
  },
  {
    quote:
      '"I love the dashboard and reporting features. It helps me keep track of my finances effortessly."',
    author: "Peter Jones",
    title: "Consultant",
    avatar: "https://placehold.co/100x100/000000/ffffff?text=PJ",
  },
];

export const FAQS = [
  {
    question: "How does the AI invoice creation work?",
    answer:
      "Simply paste any text that contains invoice details-like an email.",
  },
  {
    question: "Is there of free trial available?",
    answer:
      "Yes, you can try our platform for free for 14 days. If you want, we will provide..",
  },
  {
    question: "Can i change my plan letter?",
    answer:
      "Of course. Our pricing scales with your company. Chat to our friendly team to connect.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "We understand that things change. you can cancel your plan at anytime.",
  },
  {
    question: "Can other info be added to and invoice?",
    answer:
      "Yes, you can add notes, payment terms, and even attach file to your invoices.",
  },
  {
    question: "How does billing work?",
    answer:
      "Plants are per workspace, not par account. You can upgrade one workspace.",
  },
];

// Navigation items configuration
export const NAVIGATION_MENU = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    visible: ["user", "admin"] as const,
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart2,
    visible: ["admin"] as const,
  },
  {
    id: "all-users",
    name: "All Users",
    icon: UserRoundCog,
    visible: ["admin"] as const,
  },
  {
    id: "invoices",
    name: "Invoices",
    icon: FileText,
    visible: ["user", "admin"] as const,
  },
  {
    id: "invoices/new",
    name: "Create Invoice",
    icon: Plus,
    visible: ["user", "admin"] as const,
  },
  {
    id: "invoice/customize",
    name: "Customize Invoice",
    icon: Sparkles,
    visible: ["user", "admin"] as const,
  },
  {
    id: "profile",
    name: "Profile",
    icon: User,
    visible: ["user", "admin"],
  },
];

export const PREVIEW_INVOICE: InvoiceFormData = {
  invoiceNumber: "INV-0042",
  invoiceDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  paymentTerms: "Net 14",
  status: "Pending",
  billFrom: {
    businessName: "Acme Studios",
    address: "12 Design Lane, Lagos",
    email: "hello@acmestudios.co",
    phone: "+234 800 000 0000",
  },
  billTo: {
    clientName: "Bright Futures Ltd",
    address: "5 Commerce Road, Abuja",
    email: "accounts@brightfutures.ng",
    phone: "+234 801 234 5678",
  },
  items: [
    {
      name: "Brand Identity Design",
      quantity: 1,
      unitPrice: 250000,
      taxPercent: 0,
      total: 250000,
    },
    {
      name: "Website Development",
      quantity: 1,
      unitPrice: 450000,
      taxPercent: 0,
      total: 450000,
    },
    {
      name: "Monthly Retainer",
      quantity: 3,
      unitPrice: 80000,
      taxPercent: 0,
      total: 240000,
    },
  ],
  subtotal: 940000,
  taxTotal: 47000,
  total: 987000,
  notes:
    "All payments should be made to:\nAccount Name: Acme Studios\nAccount Number: 1234567890",
};

export const TEMPLATES = [
  {
    id: "01",
    name: "Classic",
    description: "Sidebar layout with a clean, professional feel",
  },
  {
    id: "02",
    name: "Modern",
    description: "Bold dark header with a contemporary look",
  },
  {
    id: "03",
    name: "Editorial",
    description: "Minimal accent bar, refined typographic style",
  },
];

export const COLOR_PALETTES = [
  {
    id: "green",
    label: "Forest",
    primary: "#16A34A",
    secondary: "#15803D",
    background: "#F0FDF4",
  },
  {
    id: "blue",
    label: "Ocean",
    primary: "#1D4ED8",
    secondary: "#1E40AF",
    background: "#EFF6FF",
  },
  {
    id: "amber",
    label: "Ember",
    primary: "#D97706",
    secondary: "#92400E",
    background: "#FAFAF9",
  },
  {
    id: "rose",
    label: "Rose",
    primary: "#E11D48",
    secondary: "#9F1239",
    background: "#FFF1F2",
  },
  {
    id: "violet",
    label: "Violet",
    primary: "#7C3AED",
    secondary: "#5B21B6",
    background: "#F5F3FF",
  },
  {
    id: "slate",
    label: "Slate",
    primary: "#334155",
    secondary: "#0F172A",
    background: "#F8FAFC",
  },
  {
    id: "teal",
    label: "Teal",
    primary: "#0D9488",
    secondary: "#0F766E",
    background: "#F0FDFA",
  },
  {
    id: "orange",
    label: "Terracotta",
    primary: "#EA580C",
    secondary: "#9A3412",
    background: "#FFF7ED",
  },
];
