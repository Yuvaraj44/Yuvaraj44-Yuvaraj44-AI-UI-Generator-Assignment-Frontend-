import React from 'react';
import { DESIGN_SYSTEM } from '../../../Components/ComponentClass/ComponentSchema';


function Chart({ 
  type = 'bar',
  data = [],
  size = 'md',
  title = "Chart Title",
  xLabel = '',
  yLabel = ''
}) {
  const schema = DESIGN_SYSTEM.components.chart;
  const sizeClass = schema.sizes[size];
  const maxValue = Math.max(...data.map(d => d.value || 0));

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className={`${sizeClass} bg-gray-50 border border-gray-200 rounded-lg p-4`}>
        {type === 'bar' && (
          <div className="h-full flex items-end justify-around gap-2">
            {data.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="w-full bg-blue-600 rounded-t transition-all"
                  style={{ 
                    height: `${(item.value / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {type === 'line' && (
          <div className="h-full flex items-center justify-center text-gray-500">
            Line chart visualization (mocked)
          </div>
        )}

        {type === 'pie' && (
          <div className="h-full flex items-center justify-center text-gray-500">
            Pie chart visualization (mocked)
          </div>
        )}

        {type === 'area' && (
          <div className="h-full flex items-center justify-center text-gray-500">
            Area chart visualization (mocked)
          </div>
        )}
      </div>

      {(xLabel || yLabel) && (
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{yLabel}</span>
          <span>{xLabel}</span>
        </div>
      )}
    </div>
  );
}

export default Chart;