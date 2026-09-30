import { Link, useLocation } from 'react-router-dom';

const SidebarLink = ({ href, icon, children }) => {
  const { pathname } = useLocation();
  const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`));

  return (
    <li>
      <Link to={href} aria-current={isActive ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
        {icon}<span>{children}</span>
      </Link>
    </li>
  );
};

export default SidebarLink;
