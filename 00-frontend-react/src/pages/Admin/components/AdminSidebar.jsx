import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, History, Home, LogOut, MessageSquare, Settings, Shapes, X } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import SidebarLink from './SidebarLink';

const primaryLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/features', label: 'Practice skills', icon: Shapes },
  { href: '/admin/history', label: 'Practice history', icon: History },
  { href: '/admin/ai-chat', label: 'AI chat', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Speaking analytics', icon: Activity },
];

const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuth({ isAuthenticated: false, user: {} });
    navigate('/');
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="flex min-h-16 items-center gap-3 border-b border-slate-800 px-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-bold tracking-tight">Linglooma</p>
          <p className="text-xs text-slate-400">IELTS workspace</p>
        </div>
        <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden" aria-label="Close navigation"><X className="h-5 w-5" /></button>
      </div>

      <div className="border-b border-slate-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold">{auth?.user?.username?.charAt(0)?.toUpperCase() || 'S'}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{auth?.user?.username || 'Student'}</p>
            <p className="truncate text-xs text-slate-400">{auth?.user?.email || 'Signed in'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Workspace navigation">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Workspace</p>
        <ul className="space-y-1">
          {primaryLinks.map(({ href, label, icon: Icon }) => <SidebarLink key={href} href={href} icon={<Icon className="h-5 w-5" aria-hidden="true" />}>{label}</SidebarLink>)}
        </ul>
        <p className="mt-6 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Account</p>
        <ul><SidebarLink href="/admin/settings" icon={<Settings className="h-5 w-5" aria-hidden="true" />}>Settings</SidebarLink></ul>
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
          <LogOut className="h-5 w-5" aria-hidden="true" /> Log out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
