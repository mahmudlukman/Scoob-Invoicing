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

  switch (templateId) {
    case "01":
      return (
        <TemplateOne
          invoice={invoice}
          colorPalette={colorPaletteArray}
          containerWidth={containerWidth}
        />
      );
    case "02":
      return (
        <TemplateTwo
          invoice={invoice}
          colorPalette={colorPaletteArray}
          containerWidth={containerWidth}
        />
      );
    case "03":
      return (
        <TemplateThree
          invoice={invoice}
          colorPalette={colorPaletteArray}
          containerWidth={containerWidth}
        />
      );
    default:
      return (
        <TemplateOne
          invoice={invoice}
          colorPalette={colorPaletteArray}
          containerWidth={containerWidth}
        />
      );
  }
};

export default RenderInvoice;
