import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function EnquiryCTA({
  title       = 'Ready to plan your trip?',
  description = 'Tell us what you need and we\'ll put together a personalised package — medical care, accommodation, transport, and activities all in one.',
}) {
  return (
    <div className="mt-20 bg-surface border border-border rounded-3xl px-10 py-14 md:px-16 md:py-20 text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">Get started</p>
      <h2
        className="text-3xl md:text-4xl text-text mb-5"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        {title}
      </h2>
      <p className="text-muted text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
        {description}
      </p>
      <Link
        to="/enquiries/new"
        className="inline-flex items-center gap-2 bg-accent text-[#080808] font-semibold px-8 py-3.5 rounded-full text-sm hover:bg-accent-hover transition-colors"
      >
        Start an enquiry <ArrowRight size={16} />
      </Link>
    </div>
  );
}
