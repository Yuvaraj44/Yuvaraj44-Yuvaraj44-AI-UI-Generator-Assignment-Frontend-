 

import React from 'react';
import { DESIGN_SYSTEM } from '../../../Components/ComponentClass/ComponentSchema';
 
function Sidebar({ 
  variant = 'default',
  items = [],
  isOpen = true
}) {
  const schema = DESIGN_SYSTEM.components.sidebar;
  const variantClass = schema.variants[variant];

  return (
    <aside 
      className={`${schema.base} ${variantClass} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx}>
              <a
                href={item.href || '#'}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                {item.icon && <span>{item.icon}</span>}
                {variant !== 'compact' && <span>{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;