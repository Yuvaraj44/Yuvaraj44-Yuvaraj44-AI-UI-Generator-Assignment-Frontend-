import React from 'react';
import { getComponentClasses } from '../../../Components/ComponentClass/ComponentSchema';


function Card({ variant = 'default', padding = 'md', title = 'Card Title',
  subtitle = 'Lorem ipsum', children }) {
  const className = getComponentClasses('card', { variant, padding });

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="border-b border-gray-200 pb-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;