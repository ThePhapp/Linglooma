import PropTypes from 'prop-types';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PracticeCard = ({ title, description, href, icon: Icon, iconStyle }) => (
  <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconStyle}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
    <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
    <Link to={href} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
      Open practice <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  </article>
);

PracticeCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  iconStyle: PropTypes.string.isRequired,
};
