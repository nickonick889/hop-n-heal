import { ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFetch } from '../hooks/useFetch';

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border p-6 animate-pulse space-y-3">
      <div className="h-12 w-12 rounded-xl bg-border" />
      <div className="h-5 bg-border rounded w-1/2" />
      <div className="h-4 bg-border rounded w-3/4" />
    </div>
  );
}

function PartnerCard({ partner }) {
  return (
    <div className="group bg-surface border border-border rounded-2xl p-6 hover:border-accent/40 transition-all">
      {/* Logo placeholder */}
      <div className="w-12 h-12 rounded-xl bg-surface-alt flex items-center justify-center mb-4 text-accent font-semibold text-lg">
        {partner.partner_name.charAt(0)}
      </div>
      <h3 className="font-semibold text-text mb-1">{partner.partner_name}</h3>
      {partner.description && (
        <p className="text-muted text-sm mb-4 leading-relaxed">{partner.description}</p>
      )}
      {partner.website_url && (
        <a
          href={partner.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
        >
          Visit website <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}

export default function PartnersPage() {
  const { data, loading, error } = useFetch('/api/partners');
  const partners = data?.partners || [];

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-3">Our network</p>
          <h1 className="text-4xl md:text-5xl text-text mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Affiliated Partners
          </h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            We work with Singapore's leading hospitals, specialist centres, and healthcare
            organisations to give you access to the best care available.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && <p className="text-muted text-center py-24">Could not load partners.</p>}

        {!loading && !error && partners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map(p => <PartnerCard key={p.id} partner={p} />)}
          </div>
        )}

        {!loading && !error && partners.length === 0 && (
          <p className="text-muted text-center py-24">No partners listed yet.</p>
        )}
      </div>

      <Footer />
    </div>
  );
}
