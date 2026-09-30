import PropTypes from 'prop-types';

const Skeleton = ({ className = '' }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
);

Skeleton.propTypes = { className: PropTypes.string };

export default Skeleton;
