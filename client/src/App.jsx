import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';

// ─── Public pages ────────────────────────────────────────────────
import HomePage          from './pages/HomePage';
import ServicesPage      from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import StayPage          from './pages/StayPage';
import TransportPage     from './pages/TransportPage';
import ActivitiesPage    from './pages/ActivitiesPage';
import PartnersPage      from './pages/PartnersPage';

// ─── Auth pages ──────────────────────────────────────────────────
import LoginPage         from './pages/LoginPage';
import SignupPage        from './pages/SignupPage';

// ─── Client pages ────────────────────────────────────────────────
import DashboardPage     from './pages/DashboardPage';
import EnquiriesPage     from './pages/EnquiriesPage';
import NewEnquiryPage    from './pages/NewEnquiryPage';
import EnquiryDetailPage from './pages/EnquiryDetailPage';
import BookingsPage      from './pages/BookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProfilePage       from './pages/ProfilePage';

// ─── Admin pages ─────────────────────────────────────────────────
import AdminLoginPage      from './pages/admin/AdminLoginPage';
import AdminLayout         from './pages/admin/AdminLayout';
import AdminDashboardPage  from './pages/admin/AdminDashboardPage';
import AdminServicesPage   from './pages/admin/AdminServicesPage';
import AdminStayPage       from './pages/admin/AdminStayPage';
import AdminTransportPage  from './pages/admin/AdminTransportPage';
import AdminActivitiesPage from './pages/admin/AdminActivitiesPage';
import AdminPartnersPage   from './pages/admin/AdminPartnersPage';
import AdminEnquiriesPage        from './pages/admin/AdminEnquiriesPage';
import AdminProposalsPage        from './pages/admin/AdminProposalsPage';
import AdminProposalBuilderPage  from './pages/admin/AdminProposalBuilderPage';
import AdminBookingsPage         from './pages/admin/AdminBookingsPage';
import AdminUsersPage            from './pages/admin/AdminUsersPage';

// ─── Route guards ────────────────────────────────────────────────

// Redirects to /login if client is not logged in
function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null; // still loading
  return user ? children : <Navigate to="/login" replace />;
}

// Redirects to /dashboard if client is already logged in (for /login, /signup)
function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

// Redirects to /admin/login if admin is not authenticated
function AdminRoute({ children }) {
  const { admin } = useAdminAuth();
  if (admin === undefined) return null; // still loading
  return admin ? children : <Navigate to="/admin/login" replace />;
}

const NotFound = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center text-center px-4">
    <div>
      <p className="text-6xl font-semibold text-muted mb-4">404</p>
      <p className="text-text mb-2">Page not found.</p>
      <a href="/" className="text-accent hover:underline text-sm">Go home</a>
    </div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* ─ Public ─ */}
              <Route path="/"               element={<HomePage />} />
              <Route path="/services"       element={<ServicesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage />} />
              <Route path="/stay"           element={<StayPage />} />
              <Route path="/transport"      element={<TransportPage />} />
              <Route path="/activities"     element={<ActivitiesPage />} />
              <Route path="/partners"       element={<PartnersPage />} />

              {/* ─ Auth ─ */}
              <Route path="/login"  element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

              {/* ─ Authenticated client ─ */}
              <Route path="/dashboard"     element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/enquiries"     element={<PrivateRoute><EnquiriesPage /></PrivateRoute>} />
              <Route path="/enquiries/new" element={<NewEnquiryPage />} />
              <Route path="/enquiries/:id" element={<PrivateRoute><EnquiryDetailPage /></PrivateRoute>} />
              <Route path="/bookings"      element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
              <Route path="/bookings/:id"  element={<PrivateRoute><BookingDetailPage /></PrivateRoute>} />
              <Route path="/profile"       element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

              {/* ─ Admin ─ */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={<AdminRoute><AdminLayout /></AdminRoute>}
              >
                <Route index          element={<AdminDashboardPage />} />
                <Route path="services"   element={<AdminServicesPage />} />
                <Route path="stay"       element={<AdminStayPage />} />
                <Route path="transport"  element={<AdminTransportPage />} />
                <Route path="activities" element={<AdminActivitiesPage />} />
                <Route path="partners"   element={<AdminPartnersPage />} />
                <Route path="enquiries"          element={<AdminEnquiriesPage />} />
                <Route path="proposals"          element={<AdminProposalsPage />} />
                <Route path="proposals/:id"      element={<AdminProposalBuilderPage />} />
                <Route path="bookings"           element={<AdminBookingsPage />} />
                <Route path="users"      element={<AdminUsersPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
