import { logout } from '../services/api';
import './AuthStatus.css';

interface AuthStatusProps {
  workspaceName?: string;
  workspaceIcon?: string;
  onLogout: () => void;
}

export default function AuthStatus({ workspaceName, workspaceIcon, onLogout }: AuthStatusProps) {
  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error('Failed to logout:', error);
      // Still call onLogout to clear local state
      onLogout();
    }
  };

  return (
    <div className="auth-status">
      <div className="auth-status-info">
        {workspaceIcon && (
          <img src={workspaceIcon} alt="" className="workspace-icon" />
        )}
        <span className="workspace-name">
          Connected: {workspaceName || 'Notion Workspace'}
        </span>
      </div>
      <button
        className="disconnect-button"
        onClick={handleLogout}
        type="button"
      >
        Disconnect
      </button>
    </div>
  );
}
