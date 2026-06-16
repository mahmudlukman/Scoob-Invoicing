import { ArrowRight } from "lucide-react";
import { FEATURES } from "../../utils/data";

const Features = () => {
  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 bg-slate-950 overflow-hidden text-white"
    >
      {/* Premium Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md shadow-sm mb-6">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
              Platform Capabilities
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-6">
            Powerful Features to Run Your{" "}
            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#38bdf8_0%,#3b82f6_50%,#1e40af_100%)] font-normal">
              Business Engine
            </span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Everything you need to automate invoicing, track cash flows
            seamlessly, and secure faster client payouts.
          </p>
        </div>

        {/* Premium Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)]"
            >
              {/* Top-right card decorative glow on hover */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/0 rounded-tr-3xl blur-2xl group-hover:bg-blue-500/10 transition-all duration-500" />

              {/* Icon Container with Gradient Fill on Hover */}
              <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/60 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:from-blue-600 group-hover:to-indigo-900 group-hover:border-blue-400 group-hover:scale-110 shadow-inner">
                <feature.icon className="w-6 h-6 text-slate-300 transition-colors duration-500 group-hover:text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-medium text-slate-100 mb-3 group-hover:text-white transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Premium Subtle Action Link */}
              <div className="pt-2">
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-medium text-blue-400 group-hover:text-sky-300 transition-colors duration-200"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
