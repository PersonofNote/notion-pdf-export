import { useState } from 'react';
import { fileToBase64, type LetterheadData } from '../services/api';
import './LetterheadEditor.css';

interface LetterheadEditorProps {
  letterhead: LetterheadData;
  onUpdate: (letterhead: LetterheadData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function LetterheadEditor({ letterhead, onUpdate, onNext, onBack }: LetterheadEditorProps) {
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    try {
      setUploading(true);
      const base64 = await fileToBase64(file);
      onUpdate({ ...letterhead, logoUrl: base64 });
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    onUpdate({ ...letterhead, logoUrl: undefined });
  };

  const updateField = (field: keyof LetterheadData, value: string) => {
    onUpdate({ ...letterhead, [field]: value });
  };

  const canProceed = letterhead.companyName.trim().length > 0;

  return (
    <div className="letterhead-editor">
      <h2>Step 2: Configure Letterhead</h2>
      <p className="description">
        Add your company logo and contact information for the PDF header.
      </p>

      <div className="form-section">
        <div className="form-group">
          <label>Company Logo (Optional)</label>
          <div className="logo-upload">
            {letterhead.logoUrl ? (
              <div className="logo-preview">
                <img src={letterhead.logoUrl} alt="Company logo" />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="remove-logo"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="logo-upload-area">
                <label htmlFor="logo-input" className="upload-label">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                  <input
                    id="logo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                <small>PNG, JPG, or SVG (max 2MB)</small>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="company-name">
            Company Name <span className="required">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={letterhead.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder="Acme Corporation"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address (Optional)</label>
          <input
            id="address"
            type="text"
            value={letterhead.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="123 Main Street, City, State 12345"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone (Optional)</label>
            <input
              id="phone"
              type="tel"
              value={letterhead.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (Optional)</label>
            <input
              id="email"
              type="email"
              value={letterhead.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="contact@acme.com"
            />
          </div>
        </div>
        <div className="form-row">
          <button className="back-button" onClick={onBack}>Back</button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="next-button"
          >
            Next
        </button>
        </div>
      </div>
    </div>
  );
}
