import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Check, Palette, Save, Layout, Type, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import { useUpdateInvoicePreferencesMutation } from "../../redux/features/invoice/invoiceApi";
import RenderInvoice from "../../components/invoice-templates/RenderInvoice";
import { COLOR_PALETTES, PREVIEW_INVOICE, TEMPLATES } from "../../utils/data";
import type { RootState } from "../../redux/store";
import { DEFAULT_ITEM_LABELS, type ItemLabels } from "../../@types";

const TARGET_INVOICE_WIDTH = 750;

type ActiveTab = "template" | "colors" | "labels";

const CustomizeInvoice = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateInvoicePreferences, { isLoading }] =
    useUpdateInvoicePreferencesMutation();

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Active Control Panel Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("template");

  // State initialization
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    () => user?.invoicePreferences?.templateId ?? "01",
  );
  const [selectedPalette, setSelectedPalette] = useState(
    () =>
      COLOR_PALETTES.find(
        (p) => p.id === user?.invoicePreferences?.paletteId,
      ) ?? COLOR_PALETTES[0],
  );
  const [itemLabels, setItemLabels] = useState<ItemLabels>(() => ({
    ...DEFAULT_ITEM_LABELS,
    ...user?.invoicePreferences?.itemLabels,
  }));

  const [previewScale, setPreviewScale] = useState(1);

  // Purely dynamic scaling observer without layout-thrashing DOM height overrides
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const availableWidth = entry.contentRect.width - 32; // Include padding buffer
        if (availableWidth > 0) {
          const calculatedScale = Math.min(
            1,
            availableWidth / TARGET_INVOICE_WIDTH,
          );
          setPreviewScale(calculatedScale);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleResetItemLabels = () => {
    setItemLabels(DEFAULT_ITEM_LABELS);
    toast.success("Labels reset to defaults");
  };

  const handleItemLabelChange = (key: keyof ItemLabels, value: string) => {
    setItemLabels((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const sanitizedItemLabels = Object.fromEntries(
      Object.entries(itemLabels).map(([key, value]) => [
        key,
        value.trim() || DEFAULT_ITEM_LABELS[key as keyof ItemLabels],
      ]),
    ) as ItemLabels;

    try {
      await updateInvoicePreferences({
        templateId: selectedTemplate,
        paletteId: selectedPalette.id,
        colorPalette: {
          primary: selectedPalette.primary,
          secondary: selectedPalette.secondary,
          background: selectedPalette.background,
        },
        itemLabels: sanitizedItemLabels,
      }).unwrap();
      toast.success("Preferences saved successfully!");
      navigate(-1);
    } catch {
      toast.error("Failed to save preferences. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Panel Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Invoice Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalize your invoices with modern templates, custom branding,
            and flexible labels.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={isLoading}
            className="flex-1 sm:flex-none justify-center"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isLoading}
            icon={Save}
            className="flex-1 sm:flex-none justify-center shadow-md shadow-blue-500/20"
          >
            Save Preferences
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Left Control Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Navigation Control Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("template")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "template"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Template
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("colors")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "colors"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Palette
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("labels")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "labels"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Labels
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="p-6">
            {/* TEMPLATE TAB */}
            {activeTab === "template" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Select Layout Style
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the design layout that best fits your business tone.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {TEMPLATES.map((t) => {
                    const isSelected = selectedTemplate === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/30 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {t.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {t.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COLOR PALETTES TAB */}
            {activeTab === "colors" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Color Schemes
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Colors automatically apply to headings, borders, and status
                    tags.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {COLOR_PALETTES.map((palette) => {
                    const isSelected = selectedPalette.id === palette.id;
                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => setSelectedPalette(palette)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all relative ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/20 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex h-10 w-full rounded-lg overflow-hidden border border-slate-200/80 shadow-inner mb-2">
                          <div
                            className="flex-1"
                            style={{ backgroundColor: palette.primary }}
                          />
                          <div
                            className="flex-1"
                            style={{ backgroundColor: palette.secondary }}
                          />
                          <div
                            className="flex-1"
                            style={{ backgroundColor: palette.background }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate w-full text-center">
                          {palette.label}
                        </span>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LABELS TAB */}
            {activeTab === "labels" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Line Item Column Headers
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rename headings for custom services or billable hours.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetItemLabels}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Reset to default labels"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {(
                    Object.keys(DEFAULT_ITEM_LABELS) as (keyof ItemLabels)[]
                  ).map((key) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, " $1")} Header
                      </label>
                      <input
                        type="text"
                        maxLength={24}
                        value={itemLabels[key]}
                        onChange={(e) =>
                          handleItemLabelChange(key, e.target.value)
                        }
                        placeholder={DEFAULT_ITEM_LABELS[key]}
                        className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Vector Canvas View */}
        <div
          ref={previewContainerRef}
          className="bg-slate-200/60 rounded-2xl p-6 border border-slate-200/80 min-h-[600px] flex flex-col items-center justify-start overflow-hidden relative"
        >
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Preview
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {Math.round(previewScale * 100)}% Scale
            </span>
          </div>

          {/* Scaled Render Container */}
          <div
            className="transition-transform origin-top duration-150 ease-out shadow-2xl rounded-lg overflow-hidden bg-white"
            style={{
              width: `${TARGET_INVOICE_WIDTH}px`,
              transform: `scale(${previewScale})`,
              marginBottom: `${(previewScale - 1) * 100}%`,
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
              containerWidth={TARGET_INVOICE_WIDTH}
              itemLabels={itemLabels}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeInvoice;
