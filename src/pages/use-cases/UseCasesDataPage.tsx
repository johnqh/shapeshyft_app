import ScreenContainer from '../../components/layout/ScreenContainer';
import SEO from '../../components/seo/SEO';
import LocalizedLink from '../../components/layout/LocalizedLink';
import { CONSTANTS } from '../../config/constants';

const exampleSchema = `{
  "type": "object",
  "properties": {
    "vendor": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "address": { "type": "string" },
        "taxId": { "type": "string" }
      }
    },
    "invoiceNumber": { "type": "string" },
    "date": { "type": "string", "format": "date" },
    "lineItems": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "quantity": { "type": "number" },
          "unitPrice": { "type": "number" },
          "total": { "type": "number" }
        }
      }
    },
    "subtotal": { "type": "number" },
    "tax": { "type": "number" },
    "total": { "type": "number" }
  },
  "required": ["invoiceNumber", "total"]
}`;

const exampleOutput = `{
  "vendor": {
    "name": "Acme Supplies Inc.",
    "address": "123 Business Ave, NY 10001",
    "taxId": "12-3456789"
  },
  "invoiceNumber": "INV-2024-0892",
  "date": "2024-01-15",
  "lineItems": [
    {
      "description": "Office Supplies",
      "quantity": 50,
      "unitPrice": 12.99,
      "total": 649.50
    }
  ],
  "subtotal": 649.50,
  "tax": 56.83,
  "total": 706.33
}`;

const applications = [
  {
    title: 'Invoice Processing',
    description: 'Extract vendor details, line items, totals, and tax information from invoices in any format. Feed directly into your accounting system.',
    examples: ['AP automation', 'Expense tracking', 'Audit preparation', 'Vendor management'],
  },
  {
    title: 'Resume Parsing',
    description: 'Convert resumes into structured candidate profiles. Extract contact info, work history, education, skills, and certifications consistently.',
    examples: ['ATS integration', 'Candidate matching', 'Skills inventory', 'Recruitment analytics'],
  },
  {
    title: 'Contract Analysis',
    description: 'Pull key terms, dates, parties, and obligations from legal documents. Automate contract review and compliance monitoring.',
    examples: ['Due diligence', 'Risk assessment', 'Renewal tracking', 'Clause extraction'],
  },
  {
    title: 'Form Processing',
    description: 'Digitize paper forms, applications, and questionnaires. Extract field values regardless of layout variations.',
    examples: ['Insurance claims', 'Loan applications', 'Government forms', 'Survey responses'],
  },
];

function UseCasesDataPage() {
  return (
    <ScreenContainer footerVariant="full" showBreadcrumbs>
      <SEO
        canonical="/use-cases/data"
        title={`Data Extraction - Use Cases - ${CONSTANTS.APP_NAME}`}
        description="Extract structured data from unstructured documents with LLMs. Invoice processing, resume parsing, contract analysis, and form digitization."
        keywords="data extraction, document processing, invoice OCR, resume parsing, contract analysis, structured data, LLM extraction"
      />

      <main className="flex-1 overflow-auto">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20" />
          <div className="relative max-w-4xl mx-auto">
            <LocalizedLink
              to="/use-cases"
              className="inline-flex items-center text-sm text-theme-text-secondary hover:text-theme-text-primary mb-6"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Use Cases
            </LocalizedLink>
            <h1 className="text-4xl sm:text-5xl font-bold text-theme-text-primary mb-6">
              Data Extraction
            </h1>
            <p className="text-lg sm:text-xl text-theme-text-secondary max-w-3xl">
              Turn unstructured documents into clean, structured data. Define your target schema,
              and {CONSTANTS.APP_NAME} extracts exactly the information you need—every time.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              How It Works
            </h2>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Define Your Schema</h3>
                <p className="text-theme-text-secondary">
                  Describe the exact data structure you want to extract—nested objects, arrays, typed fields with validation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Send Your Document</h3>
                <p className="text-theme-text-secondary">
                  Pass document text to the {CONSTANTS.APP_NAME} API. We handle the prompting and extraction logic.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Get Structured Data</h3>
                <p className="text-theme-text-secondary">
                  Receive validated JSON matching your schema. Import directly into databases, spreadsheets, or APIs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Schema */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              Example: Invoice Data Extraction
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Your JSON Schema</h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96">
                  <code>{exampleSchema}</code>
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Extracted Output</h3>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm max-h-96">
                  <code>{exampleOutput}</code>
                </pre>
                <p className="text-sm text-theme-text-secondary mt-4">
                  Complex nested structures are extracted accurately, with proper typing for numbers, dates, and arrays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Applications */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              Applications
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {applications.map((app) => (
                <div key={app.title} className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border">
                  <h3 className="text-xl font-semibold text-theme-text-primary mb-3">{app.title}</h3>
                  <p className="text-theme-text-secondary mb-4">{app.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {app.examples.map((example) => (
                      <span
                        key={example}
                        className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-theme-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-8 text-center">
              Why {CONSTANTS.APP_NAME} for Data Extraction?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Schema Enforcement</h3>
                <p className="text-theme-text-secondary">
                  Every extraction matches your exact schema. No missing fields, no unexpected formats.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Format Flexibility</h3>
                <p className="text-theme-text-secondary">
                  Handle variations in document layouts. The same schema works across different formats.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-theme-text-primary mb-2">Instant Integration</h3>
                <p className="text-theme-text-secondary">
                  Get clean JSON ready for databases, APIs, and spreadsheets without post-processing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-theme-text-primary mb-6">
              Start Extracting Data Today
            </h2>
            <p className="text-lg text-theme-text-secondary mb-8">
              Build your first data extraction endpoint in minutes. No ML training required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedLink
                to="/docs"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Read the Docs
              </LocalizedLink>
              <LocalizedLink
                to="/use-cases"
                className="inline-block px-8 py-3 bg-theme-bg-secondary text-theme-text-primary font-semibold rounded-lg border border-theme-border hover:border-blue-300 transition-colors"
              >
                Explore Other Use Cases
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
    </ScreenContainer>
  );
}

export default UseCasesDataPage;
