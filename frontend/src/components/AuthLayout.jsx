import "./AuthLayout.css";

export default function AuthLayout({
  heroTitle = "Welcome To Taxpal",
  heroChip = "Good to see you again!!",
  children,
  footerNote
}) {
  return (
    <div className="auth-grid">
      <div className="auth-left">
        {/* ✅ Logo from public/assets */}
        <div className="logo-wrapper">
          <img src="/assets/logo.png" alt="Taxpal Logo" className="auth-logo" />
        </div>

        <h1 className="hero">{heroTitle}</h1>

        {/* chip + dotted line that reaches the card */}
        <div className="chip-line">
          <div className="hero-chip">{heroChip}</div>
          <div className="line-dash" />
        </div>
      </div>

      {/* the circles are drawn with ::before and ::after of this element */}
      <div className="auth-right glass">
        {children}
        {footerNote && <div className="auth-footer-note">{footerNote}</div>}
      </div>
    </div>
  );
}
