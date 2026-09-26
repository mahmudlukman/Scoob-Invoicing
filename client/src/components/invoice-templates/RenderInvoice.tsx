import React from "react";
import TemplateOne from "./TemplateOne";
import TemplateTwo from "./TemplateTwo";
import TemplateThree from "./TemplateThree";
import type { Invoice, InvoiceFormData, ItemLabels } from "../../@types";
import { DEFAULT_ITEM_LABELS } from "../../@types";

interface RenderInvoiceProps {
  templateId: string;
  invoice: Invoice | InvoiceFormData;
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
  };
  containerWidth: number;
  // Optional so existing callers that haven't been updated yet still compile
  // and fall back to the stock labels.
  itemLabels?: ItemLabels;
}

const RenderInvoice: React.FC<RenderInvoiceProps> = ({
  templateId,
  invoice,
  colorPalette,
  containerWidth,
  itemLabels = DEFAULT_ITEM_LABELS,
}) => {
  const colorPaletteArray: string[] = [
    colorPalette.background,
    colorPalette.primary,
    colorPalette.background,
    colorPalette.secondary,
    "#4A5565",
  ];

  // Wrap the template in a div that enforces the container width
  const renderTemplate = () => {
    let template;
    switch (templateId) {
      case "01":
        template = (
          <TemplateOne
            invoice={invoice}
            colorPalette={colorPaletteArray}
            containerWidth={containerWidth}
            itemLabels={itemLabels}
          />
        );
        break;
      case "02":
        template = (
          <TemplateTwo
            invoice={invoice}
            colorPalette={colorPaletteArray}
            containerWidth={containerWidth}
            itemLabels={itemLabels}
          />
        );
        break;
      case "03":
        template = (
          <TemplateThree
            invoice={invoice}
            colorPalette={colorPaletteArray}
            containerWidth={containerWidth}
            itemLabels={itemLabels}
          />
        );
        break;
      default:
        template = (
          <TemplateOne
            invoice={invoice}
            colorPalette={colorPaletteArray}
            containerWidth={containerWidth}
            itemLabels={itemLabels}
          />
        );
    }

    return (
      <div
        style={{
          width: containerWidth > 0 ? `${containerWidth}px` : "100%",
          maxWidth: "100%",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        {template}
      </div>
    );
  };

  return renderTemplate();
};

export default RenderInvoice;
