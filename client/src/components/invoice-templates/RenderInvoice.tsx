import React from "react";
import TemplateOne from "./TemplateOne";
import TemplateTwo from "./TemplateTwo";
import TemplateThree from "./TemplateThree";
import type { Invoice, InvoiceFormData } from "../../@types";

interface RenderInvoiceProps {
  templateId: string;
  invoice: Invoice | InvoiceFormData;
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
  };
  containerWidth: number;
}

const RenderInvoice: React.FC<RenderInvoiceProps> = ({
  templateId,
  invoice,
  colorPalette,
  containerWidth,
}) => {
  // Convert colorPalette object to array format expected by the templates
  // [bg, primary, accent, secondary, text]
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
          />
        );
        break;
      case "02":
        template = (
          <TemplateTwo
            invoice={invoice}
            colorPalette={colorPaletteArray}
            containerWidth={containerWidth}
          />
        );
        break;
      case "03":
        template = (
          <TemplateThree
            invoice={invoice}
            colorPalette={colorPaletteArray}
            containerWidth={containerWidth}
          />
        );
        break;
      default:
        template = (
          <TemplateOne
            invoice={invoice}
            colorPalette={colorPaletteArray}
            containerWidth={containerWidth}
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
