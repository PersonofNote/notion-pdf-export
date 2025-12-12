import { useState } from 'react';
import NotionUrlInput from './components/NotionUrlInput';
import LetterheadEditor from './components/LetterheadEditor';
import PropertyFilter from './components/PropertyFilter';
import DownloadButton from './components/DownloadButton';
import {
  fetchNotionPage,
  generatePdf,
  downloadPdf,
  type NotionPageData,
  type LetterheadData,
} from './services/api';
import './App.css';

type Step = 1 | 2 | 3 | 4;

interface AppState {
  step: Step;
  notionUrl: string;
  notionToken: string;
  pageData: NotionPageData | null;
  letterhead: LetterheadData;
  hiddenProperties: string[];
  loading: boolean;
  error: string | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    step: 1,
    notionUrl: '',
    notionToken: '',
    pageData: null,
    letterhead: {
      companyName: '',
      address: '',
      phone: '',
      email: '',
    },
    hiddenProperties: [],
    loading: false,
    error: null,
  });

  // Step 1: Fetch Notion page
  const handleFetchPage = async (url: string, token: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const pageData = await fetchNotionPage(url, token);

      setState((prev) => ({
        ...prev,
        notionUrl: url,
        notionToken: token,
        pageData,
        step: 2,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch page',
      }));
    }
  };

  // Step 2: Update letterhead
  const handleUpdateLetterhead = (letterhead: LetterheadData) => {
    setState((prev) => ({ ...prev, letterhead }));
  };

  const handleNextFromLetterhead = () => {
    setState((prev) => ({ ...prev, step: 3 }));
  };

  // Step 3: Toggle property visibility
  const handleToggleProperty = (propertyName: string) => {
    setState((prev) => ({
      ...prev,
      hiddenProperties: prev.hiddenProperties.includes(propertyName)
        ? prev.hiddenProperties.filter((p) => p !== propertyName)
        : [...prev.hiddenProperties, propertyName],
    }));
  };

  const handleNextFromFilter = () => {
    setState((prev) => ({ ...prev, step: 4 }));
  };

  // Step 4: Generate PDF
  const handleGeneratePdf = async () => {
    if (!state.pageData) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const pdfBlob = await generatePdf({
        title: state.pageData!.title,
        blocks: state.pageData!.blocks,
        letterhead: state.letterhead,
        properties: state.pageData!.properties,
        hiddenProperties: state.hiddenProperties,
      });

      // Trigger download
      const filename = `${state.pageData.title || 'notion-export'}.pdf`;
      downloadPdf(pdfBlob, filename);

      setState((prev) => ({ ...prev, loading: false, error: null }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      }));
    }
  };

  // Reset to start
  const handleReset = () => {
    setState({
      step: 1,
      notionUrl: '',
      notionToken: '',
      pageData: null,
      letterhead: {
        companyName: '',
        address: '',
        phone: '',
        email: '',
      },
      hiddenProperties: [],
      loading: false,
      error: null,
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Notion PDF Exporter</h1>
        <p className="tagline">Convert Notion pages to branded PDFs</p>
      </header>

      <main className="app-main">
        {/* Progress indicator */}
        <div className="progress-steps">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`progress-step ${state.step === stepNum ? 'active' : ''} ${
                state.step > stepNum ? 'completed' : ''
              }`}
            >
              <div className="step-circle">{stepNum}</div>
              <div className="step-label">
                {stepNum === 1 && 'Fetch Page'}
                {stepNum === 2 && 'Letterhead'}
                {stepNum === 3 && 'Filter'}
                {stepNum === 4 && 'Generate'}
              </div>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="step-content">
          {state.step === 1 && (
            <NotionUrlInput
              onFetch={handleFetchPage}
              loading={state.loading}
              error={state.error}
            />
          )}

          {state.step === 2 && (
            <LetterheadEditor
              letterhead={state.letterhead}
              onUpdate={handleUpdateLetterhead}
              onNext={handleNextFromLetterhead}
            />
          )}

          {state.step === 3 && state.pageData && (
            <PropertyFilter
              properties={state.pageData.properties}
              hiddenProperties={state.hiddenProperties}
              onToggle={handleToggleProperty}
              onNext={handleNextFromFilter}
            />
          )}

          {state.step === 4 && (
            <DownloadButton
              onGenerate={handleGeneratePdf}
              loading={state.loading}
              error={state.error}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Built for converting Notion pages to professional PDFs with custom branding
        </p>
      </footer>
    </div>
  );
}

export default App;
