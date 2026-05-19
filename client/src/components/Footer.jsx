import { Link } from 'react-router-dom';

const LINKS = {
  Services: [
    { label: 'Medical Services', to: '/services' },
    { label: 'Accommodation',    to: '/stay' },
    { label: 'Transport',        to: '/transport' },
    { label: 'Activities',       to: '/activities' },
  ],
  Company: [
    { label: 'Our Partners',  to: '/partners' },
    { label: 'How It Works',  to: '/#how-it-works' },
  ],
  Account: [
    { label: 'Sign Up',    to: '/signup' },
    { label: 'Log In',     to: '/login' },
    { label: 'Dashboard',  to: '/dashboard' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-display text-2xl text-text">
              Hop & Heal
            </Link>
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              Your medical travel concierge for Singapore. We handle everything so you can focus on getting better.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">
                {heading}
              </p>
              <ul className="flex flex-col gap-3">
                {links.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-muted hover:text-text transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-dark">
            © {new Date().getFullYear()} Hop & Heal. All rights reserved.
          </p>
          <p className="text-xs text-muted-dark">
            Singapore Medical Tourism Concierge
          </p>
        </div>
      </div>
    </footer>
  );
}
