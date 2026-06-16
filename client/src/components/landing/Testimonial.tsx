import { Quote } from "lucide-react";
import { TESTIMONIALS } from "../../utils/data";

const Testimonial = () => {
  return (
    <section
      id="testimonials"
      className="relative py-24 lg:py-32 bg-slate-50 overflow-hidden"
    >
      {/* Premium subtle background glow accents to draw focus */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-12 left-1/4 w-[500px] h-[500px] bg-sky-400/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grid-slate-900/[0.015] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-200 bg-white/80 backdrop-blur-md shadow-sm mb-6">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-700">
              User Testimonials
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-950 mb-6">
            What Our{" "}
            <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#38bdf8_0%,#3b82f6_50%,#1e40af_100%)] font-normal">
              Customers Say
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            We power invoicing automation for fast-growing businesses,
            freelancers, and global remote teams.
          </p>
        </div>

        {/* Testimonials Masonry/Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white border border-slate-200/80 rounded-3xl p-8 backdrop-blur-xl transition-all duration-500 hover:border-blue-400/50 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)]"
            >
              {/* Dynamic Quote Mark Box */}
              <div className="absolute -top-4 left-8 w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center text-white shadow-md shadow-slate-900/10 transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-800 group-hover:shadow-blue-500/20 group-hover:rotate-6">
                <Quote className="w-4 h-4 fill-white/10" />
              </div>

              {/* Verified User Pill / Subtle Design Accent */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                  Verified Client
                </span>
              </div>

              {/* Testimonial Message */}
              <p className="text-slate-700 mb-8 leading-relaxed font-light text-base pt-2 group-hover:text-slate-900 transition-colors duration-300">
                “{testimonial.quote}”
              </p>

              {/* Divider line separating quote and metadata */}
              <div className="w-full h-px bg-slate-100 mb-6 group-hover:bg-blue-50 transition-colors duration-300" />

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md shadow-slate-200/50 group-hover:border-blue-100 transition-colors duration-300"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-base truncate group-hover:text-blue-950 transition-colors duration-300">
                    {testimonial.author}
                  </p>
                  <p className="text-slate-400 text-xs tracking-medium truncate uppercase mt-0.5">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
