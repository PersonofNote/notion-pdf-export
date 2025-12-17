import { initiateOAuth } from '../services/api';
import './OAuthButton.css';

interface OAuthButtonProps {
  disabled?: boolean;
}

export default function OAuthButton({ disabled = false }: OAuthButtonProps) {
  const handleClick = () => {
    if (!disabled) {
      initiateOAuth();
    }
  };

  return (
    <button
      className="oauth-button"
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="notion-logo"
      >
        <path
          d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
          fill="currentColor"
        />
      </svg>
      <span>Connect with Notion</span>
    </button>
  );
}
