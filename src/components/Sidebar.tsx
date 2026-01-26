import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  DoorOpen, 
  Calendar, 
  CheckCircle, 
  FileText,
  Shield ,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Room Access',
    href: '/admin/rooms',
    icon: DoorOpen,
    roles: ['admin'],
  },
  
  {
    title: 'Dashboard',
    href: '/staff/dashboard',
    icon: LayoutDashboard,
    roles: ['staff'],
  }
  ,{
    title: 'My Appointments',
    href: '/staff/appointments',
    icon: Calendar,
    roles: ['staff'],
  },
  {
    title: 'Access Validation',
    href: '/staff/validation',
    icon: CheckCircle,
    roles: ['staff'],
  },
  {
    title: 'Entry Logs',
    href: '/staff/logs',
    icon: FileText,
    roles: ['staff'],
  },

  {
    title: 'Dashboard',
    href: '/student/dashboard',
    icon: LayoutDashboard,
    roles: ['student'],
  },

  {
    title: 'Profile',
    href: '/student/profile',
    icon: User,
    roles: ['student'],
  },
  
  {
    title: 'Book Appointment',
    href: '/student/book',
    icon: Calendar,
    roles: ['student'],
  },
  {
    title: 'My Appointments',
    href: '/student/appointments',
    icon: FileText,
    roles: ['student'],
  },
];

const Sidebar = () => {
  const { user } = useAuth();

  const filteredItems = navItems.filter((item) => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">COE Auth</h1>
            <p className="text-xs text-sidebar-foreground/60">System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                  isActive && 'bg-sidebar-accent text-sidebar-foreground font-medium'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            COE Authentication System v1.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
