import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Stethoscope, BedDouble, Car, Sparkles,
  Building2, ClipboardList, FileText, PackageCheck, Users, LogOut,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/services',     icon: Stethoscope,     label: 'Services'           },
  { to: '/admin/stay',         icon: BedDouble,       label: 'Stay'               },
  { to: '/admin/transport',    icon: Car,             label: 'Transport'          },
  { to: '/admin/activities',   icon: Sparkles,        label: 'Activities'         },
  { to: '/admin/partners',     icon: Building2,       label: 'Partners'           },
  { to: '/admin/enquiries',    icon: ClipboardList,   label: 'Enquiries'          },
  { to: '/admin/proposals',    icon: FileText,        label: 'Proposals'          },
  { to: '/admin/bookings',     icon: PackageCheck,    label: 'Bookings'           },
  { to: '/admin/users',        icon: Users,           label: 'Admin Users'        },
];

export default function AdminLayout() {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <p className="text-xs tracking-[0.3em] uppercase text-muted">Hop & Heal</p>
          <p className="text-sm font-semibold text-accent mt-0.5">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'text-accent bg-accent/8 border-r-2 border-accent'
                    : 'text-muted hover:text-text hover:bg-surface-alt'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-border px-6 py-4">
          {admin && (
            <>
              <p className="text-xs font-medium text-text truncate">{admin.full_name}</p>
              <p className="text-xs text-muted capitalize">{admin.role?.replace('_', ' ')}</p>
            </>
          )}
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-xs text-muted hover:text-red-400 transition-colors"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
