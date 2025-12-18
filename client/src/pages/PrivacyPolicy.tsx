import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333'
    }}>
      <Link to="/" style={{ color: '#0066cc', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
        ← Back to App
      </Link>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Last Updated: December 18, 2025</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>1. Introduction</h2>
        <p>
          Welcome to Notion PDF Exporter ("we," "our," or "us"). This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our service to export Notion pages and databases to PDF format.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>2. Information We Collect</h2>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>2.1 OAuth Authentication</h3>
        <p>When you authenticate via Notion OAuth, we receive:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Your Notion access token (stored temporarily in your session)</li>
          <li>Basic account information from Notion</li>
          <li>Access to the pages and databases you explicitly grant permission to</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>2.2 Content Data</h3>
        <p>We temporarily process:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Notion page content and database data you choose to export</li>
          <li>Letterhead information you provide (company name, logo, contact details)</li>
          <li>Page and database metadata necessary for PDF generation</li>
        </ul>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>2.3 Technical Information</h3>
        <p>We automatically collect:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Server logs (IP addresses, timestamps, request paths)</li>
          <li>Error logs for troubleshooting and service improvement</li>
          <li>Usage statistics (rate limiting, API call patterns)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>3. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Generate PDF documents from your Notion content</li>
          <li>Authenticate your access to the service via Notion OAuth</li>
          <li>Maintain your session during active use</li>
          <li>Prevent abuse and ensure service security (rate limiting)</li>
          <li>Troubleshoot errors and improve service quality</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>4. Data Storage and Retention</h2>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>4.1 Temporary Processing</h3>
        <p>
          Your Notion content is processed in memory only for the duration of PDF generation.
          We do not store your Notion pages, databases, or generated PDFs on our servers after delivery.
        </p>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>4.2 Session Data</h3>
        <p>
          Your OAuth access token is stored in an encrypted session cookie for the duration of your session.
          Sessions expire after inactivity or when you close your browser.
        </p>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>4.3 Local Storage</h3>
        <p>
          Letterhead information you provide is stored locally in your browser's localStorage.
          This data never leaves your device unless you explicitly use it to generate a PDF.
        </p>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>4.4 Server Logs</h3>
        <p>
          Technical logs are retained for up to 30 days for security monitoring and troubleshooting purposes.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>5. Data Sharing and Disclosure</h2>
        <p>We do not sell, trade, or rent your personal information. We may disclose information only:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>To Notion API for authentication and content retrieval (as required by OAuth)</li>
          <li>When required by law or legal process</li>
          <li>To protect our rights, property, or safety</li>
          <li>With your explicit consent</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>6. Security</h2>
        <p>We implement industry-standard security measures including:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>HTTPS encryption for all data transmission</li>
          <li>Secure session management with encrypted cookies</li>
          <li>Input validation and sanitization to prevent attacks</li>
          <li>Rate limiting to prevent abuse</li>
          <li>Timeout protection for all operations</li>
        </ul>
        <p>
          However, no method of transmission over the Internet is 100% secure.
          While we strive to protect your information, we cannot guarantee absolute security.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>7. Third-Party Services</h2>
        <p>Our service integrates with:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li><strong>Notion:</strong> For OAuth authentication and content retrieval. See <a href="https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>Notion's Privacy Policy</a></li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>8. Your Rights</h2>
        <p>You have the right to:</p>
        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
          <li>Revoke OAuth access at any time through your Notion account settings</li>
          <li>Clear your letterhead data from localStorage at any time</li>
          <li>Request information about data we've collected</li>
          <li>Request deletion of your data (though we only store minimal session data)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>9. Children's Privacy</h2>
        <p>
          Our service is not intended for users under the age of 13. We do not knowingly collect
          personal information from children under 13. If you believe we have collected information
          from a child under 13, please contact us immediately.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>10. International Users</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own.
          By using our service, you consent to the transfer of information to countries outside of
          your country of residence, which may have different data protection rules.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          updating the "Last Updated" date at the top of this policy. Your continued use of the service
          after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>12. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy or our data practices,
          please contact us through the GitHub repository issues page.
        </p>
      </section>

      <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e0e0e0', color: '#666', fontSize: '0.9rem' }}>
        <Link to="/terms" style={{ color: '#0066cc', textDecoration: 'none', marginRight: '1.5rem' }}>
          Terms of Use
        </Link>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>
          Back to App
        </Link>
      </footer>
    </div>
  );
}
