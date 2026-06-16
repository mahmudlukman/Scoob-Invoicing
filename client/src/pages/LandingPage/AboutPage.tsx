import { ShieldCheck, Zap, BarChart3, Users } from "lucide-react";

const PILLARS = [
  {
    icon: Zap,
    title: "Instant Generation",
    desc: "Eliminate repetitive typing and legacy manual entry. Compile beautiful, standard-compliant corporate PDFs in clicks.",
  },
  {
    icon: ShieldCheck,
    title: "Strict Compliance",
    desc: "Built from the ground up to respect local corporate data regulations, maintaining airtight privacy standards for ledger custody.",
  },
  {
    icon: BarChart3,
    title: "Aesthetic Credibility",
    desc: "An invoice is a physical reflection of your brand. We deliver hyper-sharp layout configurations that command respect from stakeholders.",
  },
  {
    icon: Users,
    title: "Built for Scale",
    desc: "Engineered cleanly to support small business owners, expanding startups, and multi-user administrative departments seamlessly.",
  },
];

const AboutPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-700 antialiased">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-900/50">
            Our Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
            The Standard for Professional Invoicing
          </h1>
          <p className="text-slate-400 mt-4 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Skoob Invoice is a premier full-stack administrative engine built to
            streamline billing operations, minimize document errors, and
            organize records.
          </p>
        </div>
      </section>

      {/* Main Philosophy Grid */}
      <section className="max-w-6xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Why We Exist
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              We focus on building software that solves real administrative
              bottlenecks.
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
              Managing business growth is complex enough without wrestling with
              poor file formats, misaligned columns, or scattered transaction
              records. We designed Skoob Invoice to eliminate manual accounting
              frictions.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed text-sm sm:text-base">
              By removing the overhead of direct payment processing traps, our
              utility asset remains single-mindedly locked on one core
              performance benchmark:{" "}
              <strong>
                giving you absolute, frictionless custody over document
                accuracy.
              </strong>
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Our Operating Metric
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              How we define engineering success across our application layout
              lifecycle.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  0s
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                  Delay in database transaction state caching lines.
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                  Structural vector PDF print rendering accuracy bounds.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="bg-white border-t border-slate-200 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Built on Pillars of Reliability
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Every system asset we compile is stress-tested to maximize
              professional efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PILLARS.map((p, idx) => {
              const IconComponent = p.icon;
              return (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-xl hover:bg-slate-50/80 transition-colors duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {p.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
