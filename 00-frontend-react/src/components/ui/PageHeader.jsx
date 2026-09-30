import PropTypes from 'prop-types';

const PageHeader = ({ eyebrow, title, description, actions, className = '' }) => (
  <header className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}>
    <div className="min-w-0 max-w-3xl">
      {eyebrow && <p className="mb-1 text-sm font-semibold text-brand-700">{eyebrow}</p>}
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

PageHeader.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
};

export default PageHeader;
