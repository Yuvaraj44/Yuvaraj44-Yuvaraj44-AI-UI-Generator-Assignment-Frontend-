 

import React, { useEffect } from 'react';
import { DESIGN_SYSTEM } from '../../../Components/ComponentClass/ComponentSchema';

 
function Modal({ 
  isOpen = false,
  onClose,
  title,
  size = 'md',
  children
}) {
  const schema = DESIGN_SYSTEM.components.modal;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={schema.base}>
      <div 
        className={schema.overlay}
        onClick={onClose}
      />
      <div className={schema.container}>
        <div className={`${schema.content} ${schema.sizes[size]}`}>
          {title && (
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          )}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;