import React from 'react';
import { getComponentClasses } from '../../../Components/ComponentClass/ComponentSchema';


function Button({ variant = 'primary', size = 'md', label = 'Button', onClick, disabled = false, fullWidth = false, }) {
  const className = getComponentClasses('button', { variant, size, fullWidth });

  return (
    <button className={className} onClick={onClick} disabled={disabled} >
      {label || "Button"}
    </button>
  );
}

export default Button;