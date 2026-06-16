const TermsOfUsePage = () => {
  const lastUpdated = "June 2026";

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 text-slate-700 antialiased">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-sm rounded-2xl p-8 sm:p-12">
        {/* Header */}
        <div className="border-b border-slate-100 pb-8 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Terms of Use
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account or accessing the dashboard workspace
              provided by Skoob Invoice ("the Service"), you agree to be bound
              legally by these Terms of Use. If you do not agree to these terms,
              you must immediately cease using the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              2. Description of Service Scope
            </h2>
            <p>
              Skoob Invoice is a specialized Full-Stack business-to-business
              (B2B) utility application designed solely to facilitate the
              creation, management, formatting, and tracking of standard billing
              invoice documents.
            </p>
            <p className="mt-2 text-amber-700 font-medium bg-amber-50/60 border border-amber-100 rounded-lg p-3">
              ⚠️ Scope Limitation: Skoob Invoice is not a payment gateway, money
              transmitter, or clearinghouse platform. We do not settle financial
              transactions, receive escrow balances, or collect electronic
              client funds. All financial settlement relationships must be
              completed independently between you and your respective clients.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              3. User Responsibilities & Conduct
            </h2>
            <p className="mb-2">
              As a registered account holder, you agree that you are entirely
              responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                The operational accuracy, commercial legality, and tax
                truthfulness of all entries keyed into your invoice line-items.
              </li>
              <li>
                Maintaining the confidentiality of your session keys, passwords,
                and security profiles.
              </li>
              <li>
                Ensuring you possess the explicit legal right to input your
                clients' business details into our system database.
              </li>
              <li>
                Refraining from generating fraudulent documents,
                money-laundering logs, or invoices representing illicit
                services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              4. Intellectual Property
            </h2>
            <p>
              The code architecture, layout designs, design systems, trade
              marks, graphics, and system engines utilized to power Skoob
              Invoice remain the exclusive intellectual property of the platform
              owners. You retain full and exclusive ownership over raw text
              inputs, corporate logos, and client identity data points injected
              into your custom invoices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              5. Limitation of Liability
            </h2>
            <p>
              Skoob Invoice provides its software features on an "As-Is" and
              "As-Available" baseline framework without structural warranties of
              any explicit type. We bear zero liability for business
              disruptions, tax computation inaccuracies, delayed invoice
              transmissions, or any financial disputes arising between you and
              your commercial clients.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              6. Termination of Accounts
            </h2>
            <p>
              We reserve the absolute right to suspend, terminate, or limit
              access privileges to your Skoob Invoice profile workspace at our
              sole discretion, without notice, if we discover violations of
              these terms, fraudulent actions, or systemic application abuse.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
