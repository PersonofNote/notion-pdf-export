import { useState, useEffect } from 'react';
import NotionUrlInput from './components/NotionUrlInput';
import LetterheadEditor from './components/LetterheadEditor';
import PropertyFilter from './components/PropertyFilter';
import DownloadButton from './components/DownloadButton';
import AuthStatus from './components/AuthStatus';
import PreviewDocument from './components/PreviewDocument';
import {
  fetchNotionPage,
  generatePdf,
  downloadPdf,
  checkAuthStatus,
  type NotionResourceData,
  type LetterheadData,
} from './services/api';
import './App.css';

type Step = 1 | 2 | 3 | 4 | 5;

interface AppState {
  step: Step;
  notionUrl: string;
  notionToken: string;
  pageData: NotionResourceData[];  // Can be pages or databases
  letterhead: LetterheadData;
  hiddenProperties: string[];  // For page properties
  hiddenColumns: string[];  // For database columns
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
    pageData: [],  // Can contain pages and/or databases
    letterhead: {
      companyName: '',
      address: '',
      phone: '',
      email: '',
    },
    hiddenProperties: [],  // For page properties
    hiddenColumns: [],  // For database columns
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

  // Step 1: Fetch Notion pages (can be multiple)
  const handleFetchPage = async (urls: string, token?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Split URLs if multiple (comma-separated)
      const urlArray = urls.split(',').map(u => u.trim());

      // Fetch all pages in parallel
      const pageDataPromises = urlArray.map(url => fetchNotionPage(url, token));
      const pagesData = await Promise.all(pageDataPromises);

      setState((prev) => ({
        ...prev,
        notionUrl: urls,
        notionToken: token || '',
        pageData: pagesData,
        step: 2,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pages',
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
      pageData: [],
      notionUrl: '',
      notionToken: '',
    }));
  };

  // Step 2: Update letterhead
  const handleUpdateLetterhead = (letterhead: LetterheadData) => {
    setState((prev) => ({ ...prev, letterhead }));
  };

  const handleNextFromLetterhead = () => {
    // Check if any resources have properties/columns to filter
    const hasFilterableFields = state.pageData.some(resource => {
      if (resource.type === 'database') {
        return Object.keys(resource.schema).length > 0;
      } else {
        return Object.keys(resource.properties || {}).length > 0;
      }
    });

    // Skip property filter if no filterable fields exist
    if (hasFilterableFields) {
      setState((prev) => ({ ...prev, step: 3 }));
    } else {
      setState((prev) => ({ ...prev, step: 4 })); // Skip to preview
    }
  };

  // Step 3: Property/Column filter
  const handleToggleProperty = (propertyName: string) => {
    setState((prev) => ({
      ...prev,
      hiddenProperties: prev.hiddenProperties.includes(propertyName)
        ? prev.hiddenProperties.filter((p) => p !== propertyName)
        : [...prev.hiddenProperties, propertyName],
    }));
  };

  const handleToggleColumn = (columnName: string) => {
    setState((prev) => ({
      ...prev,
      hiddenColumns: prev.hiddenColumns.includes(columnName)
        ? prev.hiddenColumns.filter((c) => c !== columnName)
        : [...prev.hiddenColumns, columnName],
    }));
  };

  const handleNextFromFilter = () => {
    setState((prev) => ({ ...prev, step: 4 }));
  };

  const handleBackToLetterheadFromFilter = () => {
    setState((prev) => ({ ...prev, step: 2 }));
  };

  const handleBackToSelectFromLetterHead = () => {
    setState((prev) => ({ ...prev, step: 1 }));
  };

  // Step 4: Preview navigation
  const handleBackFromPreview = () => {
    // Check if we have properties/columns to go back to filter step
    const hasFilterableFields = state.pageData.some(resource => {
      if (resource.type === 'database') {
        return Object.keys(resource.schema).length > 0;
      } else {
        return Object.keys(resource.properties || {}).length > 0;
      }
    });

    if (hasFilterableFields) {
      setState((prev) => ({ ...prev, step: 3 })); // Back to property filter
    } else {
      setState((prev) => ({ ...prev, step: 2 })); // Back to letterhead
    }
  };

  const handleContinueFromPreview = () => {
    setState((prev) => ({ ...prev, step: 5 }));
  };

  // Step 5: Generate PDFs (single or batch)
  const handleGeneratePdf = async () => {
    if (state.pageData.length === 0) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      if (state.pageData.length === 1) {
        // Single PDF
        const resource = state.pageData[0];

        let pdfRequest;
        if (resource.type === 'database') {
          pdfRequest = {
            type: 'database' as const,
            database: resource,
            letterhead: state.letterhead,
            hiddenColumns: state.hiddenColumns,
          };
        } else {
          pdfRequest = {
            type: 'page' as const,
            title: resource.title,
            blocks: resource.blocks,
            letterhead: state.letterhead,
            properties: resource.properties,
            hiddenProperties: state.hiddenProperties,
          };
        }

        const pdfBlob = await generatePdf(pdfRequest);
        const filename = `${resource.title || 'notion-export'}.pdf`;
        downloadPdf(pdfBlob, filename);
      } else {
        // Multiple PDFs - generate batch
        const response = await fetch('/api/pdf/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            pages: state.pageData,  // Now includes full resource data with type
            letterhead: state.letterhead,
            hiddenProperties: state.hiddenProperties,
            hiddenColumns: state.hiddenColumns,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate PDFs');
        }

        // Download zip file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'notion-exports.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

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
      pageData: [],
      letterhead: {
        companyName: '',
        address: '',
        phone: '',
        email: '',
      },
      hiddenProperties: [],
      hiddenColumns: [],
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
          {[1, 2, 3, 4, 5].map((stepNum) => {
            // Hide property filter step indicator if no filterable fields
            const hasFilterableFields = state.pageData.some(resource => {
              if (resource.type === 'database') {
                return Object.keys(resource.schema).length > 0;
              } else {
                return Object.keys(resource.properties || {}).length > 0;
              }
            });

            if (stepNum === 3 && !hasFilterableFields) {
              return null; // Don't show step 3 indicator if no filterable fields
            }

            return (
              <div
                key={stepNum}
                className={`progress-step ${state.step === stepNum ? 'active' : ''} ${
                  state.step > stepNum ? 'completed' : ''
                }`}
              >
                <div className="step-circle">{stepNum}</div>
                <div className="step-label">
                  {stepNum === 1 && 'Choose Content'}
                  {stepNum === 2 && 'Letterhead'}
                  {stepNum === 3 && 'Property Filter'}
                  {stepNum === 4 && 'Preview'}
                  {stepNum === 5 && 'Generate'}
                </div>
              </div>
            );
          })}
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
              onBack={handleBackToSelectFromLetterHead}
            />
          )}

          {state.step === 3 && state.pageData.length > 0 && (
            <PropertyFilter
              resources={state.pageData}
              hiddenProperties={state.hiddenProperties}
              hiddenColumns={state.hiddenColumns}
              onToggleProperty={handleToggleProperty}
              onToggleColumn={handleToggleColumn}
              onNext={handleNextFromFilter}
              onBack={handleBackToLetterheadFromFilter}
            />
          )}

          {state.step === 4 && state.pageData.length > 0 && (
            <PreviewDocument
              pages={state.pageData}
              letterhead={state.letterhead}
              hiddenProperties={state.hiddenProperties}
              hiddenColumns={state.hiddenColumns}
              onBack={handleBackFromPreview}
              onContinue={handleContinueFromPreview}
            />
          )}

          {state.step === 5 && (
            <DownloadButton
              onGenerate={handleGeneratePdf}
              loading={state.loading}
              error={state.error}
              onReset={handleReset}
              pageCount={state.pageData.length}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Built for converting Notion pages to PDFs with custom branding
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          <a href="/privacy" style={{ color: '#666', textDecoration: 'none', marginRight: '1rem' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms of Use</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
