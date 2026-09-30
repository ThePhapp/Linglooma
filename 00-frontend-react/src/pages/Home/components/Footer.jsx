import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const footerLinks = [
  { name: 'Reading', href: '/admin/features/reading' },
  { name: 'Listening', href: '/admin/features/listening' },
  { name: 'Speaking', href: '/admin/features' },
  { name: 'Writing', href: '/admin/features/writing' },
  { name: 'Speaking history', href: '/admin/features/speaking/history' },
  { name: 'Speaking analytics', href: '/admin/analytics' },
];

const Footer = () => (
  <footer className="bg-slate-950 text-white">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-xl font-bold">L</div>
            <div><h2 className="text-2xl font-bold">Linglooma</h2><p className="text-sm text-gray-300">IELTS practice</p></div>
          </div>
          <p className="mt-5 max-w-md leading-7 text-gray-300">
            Practice with the activities currently available across four English skills. Feedback and saved progress vary by module.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <h2 className="text-lg font-bold">Practice and progress</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {footerLinks.map((link) => <li key={link.name}><Link to={link.href} className="text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">{link.name}</Link></li>)}
          </ul>
          <div className="mt-6 flex gap-5 text-sm font-semibold">
            <Link to="/register" className="text-brand-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">Create account</Link>
            <Link to="/login" className="text-brand-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">Sign in</Link>
          </div>
        </nav>
      </div>
      <div className="mt-10 border-t border-white/10 pt-6 text-sm text-gray-300">
        © {new Date().getFullYear()} Linglooma. Made with <Heart aria-label="care" className="inline h-4 w-4 fill-red-400 text-red-400" /> for English learners.
      </div>
    </div>
  </footer>
);

export default Footer;
