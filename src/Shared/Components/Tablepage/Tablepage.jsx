
import React from 'react';
import { DESIGN_SYSTEM } from '../../../Components/ComponentClass/ComponentSchema';


function Table({
  variant = 'default',
  headers = [one, two, three],
  data = [sample, sample],
  hoverable = true
}) {
  const schema = DESIGN_SYSTEM.components.table;
  const baseClass = schema.base;
  const variantClass = schema.variants[variant];

  return (
    <div className="overflow-x-auto">
      <table className={`${baseClass} ${variantClass}`}>
        <thead className="bg-gray-50">
          <tr>
            {headers?.map((header, idx) => (
              <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"    >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={variant === 'striped' ? 'divide-y divide-gray-200' : ''}>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`
                ${variant === 'striped' && rowIdx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                ${hoverable ? 'hover:bg-gray-100' : ''}
                ${variant === 'bordered' ? 'border border-gray-200' : ''}
              `}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-4 py-3 text-sm text-gray-900"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;