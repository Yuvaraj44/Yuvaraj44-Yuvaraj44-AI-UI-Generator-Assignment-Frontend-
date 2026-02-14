/**
 * DETERMINISTIC COMPONENT SCHEMA
 * 
 * This is the SINGLE SOURCE OF TRUTH for all UI components.
 * AI agents MUST use these exact variants - no variations allowed.
 * 
 * Visual consistency is mandatory per assignment requirements.
 */

export const DESIGN_SYSTEM = {
  // Fixed color palette
  colors: {
    primary: 'blue-600',
    secondary: 'gray-600',
    success: 'green-600',
    danger: 'red-600',
    warning: 'yellow-600',
    info: 'indigo-600'
  },

  // Fixed spacing scale
  spacing: {
    none: '',
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  },

  // Component definitions with EXACT variants
  components: {
    button: {
      base: 'font-medium rounded-md cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      variants: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
      },
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      },
      allowedProps: ['label', 'onClick', 'variant', 'size', 'disabled', 'fullWidth']
    },

    card: {
      base: 'rounded-lg overflow-hidden',
      variants: {
        default: 'bg-white border border-gray-200 shadow-sm',
        elevated: 'bg-white shadow-md',
        outlined: 'bg-white border-2 border-gray-300',
        filled: 'bg-gray-50 border border-gray-200'
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6'
      },
      allowedProps: ['title', 'subtitle', 'variant', 'padding', 'children']
    },

    input: {
      base: 'w-full rounded-md border transition-colors focus:outline-none ',
      variants: {
        default: 'bg-white border-black text-black focus:outline-none',
        filled: 'bg-white border-black text-black focus:outline-none',
        error: 'bg-white border-red-500 focus:border-red-500 focus:ring-red-500'
      },
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg'
      },
      allowedProps: ['placeholder', 'value', 'onChange', 'variant', 'size', 'type', 'label', 'error', 'disabled']
    },

    table: {
      base: 'w-full border-collapse',
      variants: {
        default: 'bg-white border border-gray-200',
        striped: 'bg-white border border-gray-200',
        bordered: 'bg-white'
      },
      allowedProps: ['headers', 'data', 'variant', 'hoverable']
    },

    modal: {
      base: 'fixed inset-0 z-50 overflow-y-auto',
      overlay: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
      container: 'flex min-h-screen items-center justify-center p-4',
      content: 'relative bg-white rounded-lg shadow-xl max-w-md w-full',
      sizes: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
      },
      allowedProps: ['isOpen', 'onClose', 'title', 'size', 'children']
    },

    sidebar: {
      base: 'h-screen fixed left-0 top-0 transition-transform duration-300',
      variants: {
        default: 'bg-gray-800 text-white w-64',
        light: 'bg-white border-r border-gray-200 text-gray-900 w-64',
        compact: 'bg-gray-800 text-white w-16'
      },
      allowedProps: ['variant', 'items', 'isOpen']
    },

    navbar: {
      base: 'w-full border-b',
      variants: {
        default: 'bg-white border-gray-200',
        dark: 'bg-gray-800 border-gray-700 text-white',
        transparent: 'bg-transparent border-transparent'
      },
      allowedProps: ['variant', 'title', 'items', 'logo']
    },

    chart: {
      base: 'w-full',
      types: {
        bar: 'Bar Chart',
        line: 'Line Chart',
        pie: 'Pie Chart',
        area: 'Area Chart'
      },
      sizes: {
        sm: 'h-48',
        md: 'h-64',
        lg: 'h-80',
        xl: 'h-96'
      },
      allowedProps: ['type', 'data', 'size', 'title', 'xLabel', 'yLabel']
    }
  }
};

/**
 * Validate if a component configuration matches the schema
 */
export function validateComponentConfig(component, props) {
  const schema = DESIGN_SYSTEM.components[component];
  
  if (!schema) {
    return { valid: false, error: `Unknown component: ${component}` };
  }

  // Check if all props are allowed
  const allowedProps = schema.allowedProps || [];
  const propKeys = Object.keys(props);
  
  for (const key of propKeys) {
    if (!allowedProps.includes(key) && key !== 'children' && key !== 'className') {
      return { valid: false, error: `Prop '${key}' not allowed for ${component}` };
    }
  }

  // Validate variant if present
  if (props.variant && schema.variants) {
    if (!Object.keys(schema.variants).includes(props.variant)) {
      return { 
        valid: false, 
        error: `Invalid variant '${props.variant}' for ${component}. Allowed: ${Object.keys(schema.variants).join(', ')}` 
      };
    }
  }

  // Validate size if present
  if (props.size && schema.sizes) {
    if (!Object.keys(schema.sizes).includes(props.size)) {
      return { 
        valid: false, 
        error: `Invalid size '${props.size}' for ${component}. Allowed: ${Object.keys(schema.sizes).join(', ')}` 
      };
    }
  }

  return { valid: true };
}

/**
 * Get the complete class string for a component
 */
export function getComponentClasses(component, props) {
  const schema = DESIGN_SYSTEM.components[component];
  if (!schema) return '';

  const classes = [schema.base];

  if (props.variant && schema.variants) {
    classes.push(schema.variants[props.variant]);
  }

  if (props.size && schema.sizes) {
    classes.push(schema.sizes[props.size]);
  }

  if (props.padding && schema.padding) {
    classes.push(schema.padding[props.padding]);
  }

  if (props.fullWidth) {
    classes.push('w-full');
  }

  return classes.filter(Boolean).join(' ');
}

export default DESIGN_SYSTEM;