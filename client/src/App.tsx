import { useState, useEffect } from 'react';
import NotionUrlInput from './components/NotionUrlInput';
import LetterheadEditor from './components/LetterheadEditor';
import PropertyFilter from './components/PropertyFilter';
import DownloadButton from './components/DownloadButton';
import AuthStatus from './components/AuthStatus';
import {
  fetchNotionPage,
  generatePdf,
  downloadPdf,
  checkAuthStatus,
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
  authenticated: boolean;
  workspaceName?: string;
  workspaceIcon?: string;
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
    authenticated: false,
  });

  // Check authentication status on mount and handle OAuth callback
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await checkAuthStatus();
        setState((prev) => ({
          ...prev,
          authenticated: authStatus.authenticated,
          workspaceName: authStatus.workspaceName,
          workspaceIcon: authStatus.workspaceIcon,
        }));
      } catch (error) {
        console.error('Failed to check auth status:', error);
      }
    };

    // Handle OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authResult = urlParams.get('auth');
    const errorParam = urlParams.get('error');

    if (authResult === 'success') {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Check auth status to update UI
      checkAuth();
    } else if (errorParam) {
      setState((prev) => ({
        ...prev,
        error: `Authentication failed: ${errorParam}`,
      }));
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Normal page load - just check auth status
      checkAuth();
    }
  }, []);

  // Step 1: Fetch Notion page
  const handleFetchPage = async (url: string, token?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const pageData = await fetchNotionPage(url, token);

      setState((prev) => ({
        ...prev,
        notionUrl: url,
        notionToken: token || '',
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

  // Handle logout
  const handleLogout = () => {
    setState((prev) => ({
      ...prev,
      authenticated: false,
      workspaceName: undefined,
      workspaceIcon: undefined,
      // Reset to step 1 if user was in the middle of a flow
      step: 1,
      pageData: null,
      notionUrl: '',
      notionToken: '',
    }));
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
      authenticated: state.authenticated,
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
        {state.authenticated && (
          <AuthStatus
            workspaceName={state.workspaceName}
            workspaceIcon={state.workspaceIcon}
            onLogout={handleLogout}
          />
        )}
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
                {stepNum === 1 && 'Choose Page(s)'}
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
              authenticated={state.authenticated}
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
          Built for converting Notion pages to PDFs with custom branding
        </p>
      </footer>
    </div>
  );
}

export default App;
