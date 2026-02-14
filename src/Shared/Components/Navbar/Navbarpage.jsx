 

import React from 'react';
import { DESIGN_SYSTEM } from '../../../Components/ComponentClass/ComponentSchema';

 
function Navbar({ 
  variant = 'default',
  title = 'App',
  logo,
  items = []
}) {
  const schema = DESIGN_SYSTEM.components.navbar;
  const variantClass = schema.variants[variant];

  return (
    <nav className={`${schema.base} ${variantClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {logo && <span className="text-2xl">{logo}</span>}
            <span className="text-xl font-bold">{title}</span>
          </div>
          
          {items.length > 0 && (
            <div className="flex items-center gap-4">
              {items.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href || '#'}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;