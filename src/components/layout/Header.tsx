import { useAuth } from "../../auth/useAuth";

type HeaderProps = {
  onLoginClick: () => void;
};

const Header = ({ onLoginClick }: HeaderProps) => {
  const { user, isAuthed, logout } = useAuth();
  const username = user?.username || user?.handle || user?.name || "user";

  return (
    <header className="app-header">
      <div className="brand">SelfLink</div>
      <div className="header-actions">
        {isAuthed ? (
          <>
            <div className="user-info">@{username}</div>
            <button className="btn secondary" onClick={() => void logout()}>
              Log out
            </button>
          </>
        ) : (
          <button className="btn" onClick={onLoginClick}>
            Log in
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
