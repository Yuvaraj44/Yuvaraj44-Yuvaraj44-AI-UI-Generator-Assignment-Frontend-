import React from 'react';
import { getComponentClasses } from '../../../Components/ComponentClass/ComponentSchema';

function Input({ variant = 'primary', size = 'md', type = 'text', placeholder = '', value, onChange, label, error, disabled = false }) {
    const className = getComponentClasses('input', {
        variant: error ? 'error' : variant,
        size
    });

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-black mb-1">
                    {label}
                </label>
            )}
            <input type={type} className={className} placeholder={placeholder || "Enter details here...."} value={value} onChange={onChange} disabled={disabled} />
            {error && (<p className="mt-1 text-sm text-red-600">{error}</p>)}
        </div>
    );
}

export default Input;