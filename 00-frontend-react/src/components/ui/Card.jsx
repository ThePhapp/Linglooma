import PropTypes from 'prop-types';

const Card = ({ as: Component = 'section', className = '', children, ...props }) => (
  <Component className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`} {...props}>
    {children}
  </Component>
);

Card.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Card;
