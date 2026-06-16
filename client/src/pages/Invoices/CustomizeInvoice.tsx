import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Check, Palette, Save } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import type { RootState } from "../../@types";
import { useUpdateInvoicePreferencesMutation } from "../../redux/features/invoice/invoiceApi";
import RenderInvoice from "../../components/invoice-templates/RenderInvoice";
import { COLOR_PALETTES, PREVIEW_INVOICE, TEMPLATES } from "../../utils/data";

const INVOICE_WIDTH = 680;

const CustomizeInvoice = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateInvoicePreferences, { isLoading }] =
    useUpdateInvoicePreferencesMutation();

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Lazy initialize state to prevent re-running searches on every component rerender
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    () => user?.invoicePreferences?.templateId ?? "01",
  );
  const [selectedPalette, setSelectedPalette] = useState(
    () =>
      COLOR_PALETTES.find(
        (p) => p.id === user?.invoicePreferences?.paletteId,
      ) ?? COLOR_PALETTES[0],
  );

  // Handles responsive scaling/height calculations safely without render cycle leaks
  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const handleResize = () => {
      const containerWidth = container.clientWidth ?? INVOICE_WIDTH;
      const scale = Math.min(1, containerWidth / INVOICE_WIDTH);

      inner.style.setProperty("--preview-scale", String(scale));

      // Force parent wrapper height to map exact scaled canvas matrix bounds
      const naturalHeight = inner.scrollHeight;
      container.style.height = `${naturalHeight * scale}px`;
    };

    // Execute immediately on mount & listen to container element scale transformations
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [selectedTemplate]); // Re-evaluate when template changes heights

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
      {/* Header Panel Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
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
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            icon={Save}
          >
            Save Preferences
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        {/* Preference Input Controls */}
        <div className="space-y-6">
          {/* Template Matrix Group */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Template
            </h2>
            <div className="space-y-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
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

          {/* Color Palettes Selection Blocks */}
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
                  type="button"
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

        {/* Live Vector Preview Canvas View */}
        <div className="bg-slate-100 rounded-xl p-6 overflow-hidden flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Live Preview
          </p>

          <div
            ref={containerRef}
            className="rounded-lg overflow-hidden shadow-lg bg-white"
            style={{ width: "100%" }}
          >
            <div
              ref={innerRef}
              className="origin-top-left lg:transform-none"
              style={{
                transform: `scale(var(--preview-scale, 1))`,
                width: `${INVOICE_WIDTH}px`,
                marginBottom: `calc((var(--preview-scale, 1) - 1) * ${INVOICE_WIDTH}px * 1.414)`,
              }}
            >
              <RenderInvoice
                templateId={selectedTemplate}
                invoice={PREVIEW_INVOICE}
                colorPalette={{
                  primary: selectedPalette.primary,
                  secondary: selectedPalette.secondary,
                  background: selectedPalette.background,
                }}
                containerWidth={INVOICE_WIDTH}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeInvoice;
