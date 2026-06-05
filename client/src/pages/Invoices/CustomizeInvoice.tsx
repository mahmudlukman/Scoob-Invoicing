import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Check, Palette } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import type { InvoiceFormData, RootState } from "../../@types";
import { useUpdateInvoicePreferencesMutation } from "../../redux/features/invoice/invoiceApi";
import RenderInvoice from "../../components/invoice-templates/RenderInvoice";

// ─── Sample data for live preview ────────────────────────────────────────────
const PREVIEW_INVOICE: InvoiceFormData = {
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

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
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

// ─── Color Palettes ───────────────────────────────────────────────────────────
const COLOR_PALETTES = [
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

const CustomizeInvoice = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateInvoicePreferences, { isLoading }] =
    useUpdateInvoicePreferencesMutation();

  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    user?.invoicePreferences?.templateId ?? "01",
  );
  const [selectedPalette, setSelectedPalette] = useState(
    COLOR_PALETTES.find((p) => p.id === user?.invoicePreferences?.paletteId) ??
      COLOR_PALETTES[0],
  );

  const handleSave = async () => {
    try {
      await updateInvoicePreferences({
        templateId: selectedTemplate,
        paletteId: selectedPalette.id,
        colorPalette: {
          primary: selectedPalette.primary,
          secondary: selectedPalette.secondary,
          background: selectedPalette.background,
        },
      }).unwrap();
      toast.success("Preferences saved!");
      navigate(-1);
    } catch {
      toast.error("Failed to save preferences. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Customize Invoice
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose a template and color palette. Changes apply to all invoices.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
            Save Preferences
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        {/* ── Left panel: controls ─────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Template picker */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Template
            </h2>
            <div className="space-y-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedTemplate === t.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.description}
                      </p>
                    </div>
                    {selectedTemplate === t.id && (
                      <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Palette picker */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Color Palette
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  onClick={() => setSelectedPalette(palette)}
                  className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                    selectedPalette.id === palette.id
                      ? "border-slate-900"
                      : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="flex gap-0.5 rounded overflow-hidden">
                    <div
                      className="w-5 h-8 rounded-l"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <div
                      className="w-5 h-8"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <div
                      className="w-5 h-8 rounded-r border border-slate-200"
                      style={{ backgroundColor: palette.background }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {palette.label}
                  </span>
                  {selectedPalette.id === palette.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel: live preview ────────────────────────────────────── */}
        <div className="bg-slate-100 rounded-xl p-6 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Live Preview
          </p>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <RenderInvoice
              templateId={selectedTemplate}
              invoice={PREVIEW_INVOICE}
              colorPalette={{
                primary: selectedPalette.primary,
                secondary: selectedPalette.secondary,
                background: selectedPalette.background,
              }}
              containerWidth={680}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeInvoice;
