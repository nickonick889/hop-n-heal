import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, HeartPulse } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFetch } from '../hooks/useFetch';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/api/services/${slug}`);
  const service = data?.service;

  return (
    <div className="bg-bg min-h-screen text-text">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">

        {/* Back link */}
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Services
        </Link>

        {/* Loading skeleton */}
        {loading && (
          <div className="animate-pulse space-y-6">
            <div className="aspect-[16/7] bg-border rounded-3xl" />
            <div className="h-4 bg-border rounded w-1/6" />
            <div className="h-10 bg-border rounded w-2/3" />
            <div className="space-y-3">
              <div className="h-4 bg-border rounded w-full" />
              <div className="h-4 bg-border rounded w-full" />
              <div className="h-4 bg-border rounded w-5/6" />
              <div className="h-4 bg-border rounded w-4/6" />
            </div>
          </div>
        )}

        {/* Error / not found */}
        {error && (
          <div className="text-center py-24">
            <p className="text-muted text-lg">Service not found.</p>
            <Link to="/services" className="mt-4 inline-block text-accent text-sm hover:underline">
              Browse all services
            </Link>
          </div>
        )}

        {/* Content */}
        {!loading && service && (
          <>
            {/* Hero image */}
            <div className="relative overflow-hidden rounded-3xl aspect-[16/7] bg-gradient-to-br from-surface-alt to-border mb-10">
              {service.image_url && (
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* Dark gradient overlay so text reads on any image */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/60 via-transparent to-transparent" />
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted mb-4">
              <Link to="/services" className="hover:text-text transition-colors">Services</Link>
              <ChevronRight size={12} />
              <span className="text-text">{service.title}</span>
            </div>

            {/* Specialty badge + price */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-surface border border-border text-accent text-xs font-medium px-3 py-1.5 rounded-full">
                <HeartPulse size={12} /> {service.specialty}
              </span>
              {service.price_from != null ? (
                <span className="text-accent font-semibold text-sm">
                  from SGD {Number(service.price_from).toLocaleString()}
                </span>
              ) : (
                <span className="text-muted text-xs">Price on request</span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-5xl text-text mb-6"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {service.title}
            </h1>

            {/* Description */}
            <p className="text-muted text-lg leading-relaxed max-w-3xl mb-12">
              {service.description}
            </p>

            {/* CTA */}
            <div className="border-t border-border pt-10 flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1">
                <p className="text-text font-semibold mb-1">Interested in this service?</p>
                <p className="text-muted text-sm">
                  Create a free account and submit an enquiry — our team will put together
                  a personalised package including this service.
                </p>
              </div>
              <Link
                to="/enquiries/new"
                className="shrink-0 bg-accent text-[#080808] font-semibold px-6 py-3 rounded-full text-sm hover:bg-accent-hover transition-colors"
              >
                Start an enquiry
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
