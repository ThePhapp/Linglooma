import PropTypes from 'prop-types';

const StatePanel = ({ icon, title, description, action, tone = 'neutral', className = '' }) => {
  const tones = {
    neutral: 'border-slate-200 bg-white',
    info: 'border-brand-200 bg-brand-50',
    warning: 'border-amber-200 bg-amber-50',
    error: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`rounded-xl border p-6 text-center ${tones[tone]} ${className}`} role={tone === 'error' ? 'alert' : 'status'}>
      {icon && <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm">{icon}</div>}
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {description && <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-600">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
};

StatePanel.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
  tone: PropTypes.oneOf(['neutral', 'info', 'warning', 'error']),
  className: PropTypes.string,
};

export default StatePanel;
