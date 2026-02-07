import Header from "./Header";

type PageShellProps = {
  children: React.ReactNode;
  onLoginClick: () => void;
};

const PageShell = ({ children, onLoginClick }: PageShellProps) => {
  return (
    <div className="page-shell">
      <Header onLoginClick={onLoginClick} />
      <main className="page-content">{children}</main>
    </div>
  );
};

export default PageShell;
