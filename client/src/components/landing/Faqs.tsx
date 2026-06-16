import { useState } from "react";
import { FAQS } from "../../utils/data";
import { ChevronDown, HelpCircle } from "lucide-react";

type Faq = {
  question: string;
  answer: string;
};

type FaqItemProps = {
  faq: Faq;
  isOpen: boolean;
  onClick: () => void;
};

const FaqItem = ({ faq, isOpen, onClick }: FaqItemProps) => (
  <div
    className={`group border rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-xl ${
      isOpen
        ? "bg-white border-blue-500/30 shadow-[0_15px_30px_rgba(59,130,246,0.04)]"
        : "bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/40"
    }`}
  >
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-6 cursor-pointer text-left focus:outline-none"
    >
      <div className="flex items-start space-x-4 pr-4">
        {/* Subtle left-side indicator icon */}
        <HelpCircle
          className={`w-5 h-5 mt-0.5 flex-shrink-0 transition-colors duration-300 ${
            isOpen
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        />
        <span
          className={`text-base sm:text-lg font-medium transition-colors duration-200 ${
            isOpen ? "text-slate-950 font-semibold" : "text-slate-800"
          }`}
        >
          {faq.question}
        </span>
      </div>

      {/* Premium wrapped chevron block */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-blue-50 text-blue-600"
            : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"
        }`}
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>
    </button>

    {/* Smooth height transition logic wrapper */}
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        <div className="px-6 pb-6 ml-9 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-50 pt-4">
          {faq.answer}
        </div>
      </div>
    </div>
  </div>
);

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative py-24 lg:py-32 bg-slate-50 overflow-hidden"
    >
      {/* Background radial soft-focus rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/[0.03] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/[0.02] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grid-slate-900/[0.015] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-200 bg-white/80 backdrop-blur-md shadow-sm mb-6">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-700">
              Support Blueprint
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-950 mb-6">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#38bdf8_0%,#3b82f6_50%,#1e40af_100%)] font-normal">
              Questions
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our smart workflows, automation
            pipelines, and localized billing options.
          </p>
        </div>

        {/* FAQ Dynamic Stack */}
        <div className="space-y-4 relative z-10">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faqs;
