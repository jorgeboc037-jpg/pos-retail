/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'oklch(98.5% 0.003 250)',
        surface: 'oklch(100% 0 0)',
        'surface-2': 'oklch(95% 0.004 250)',
        border: 'oklch(65% 0.010 250)',
        'border-dim': 'oklch(85% 0.006 250)',
        text: 'oklch(22% 0.010 250)',
        muted: 'oklch(40% 0.012 250)',
        dim: 'oklch(50% 0.012 250)',
        primary: 'oklch(42% 0.14 145)',
        'primary-fg': 'oklch(98% 0.01 145)',
        warning: 'oklch(44% 0.15 55)',
        'warning-fg': 'oklch(98% 0.01 55)',
        danger: 'oklch(46% 0.20 25)',
        'danger-fg': 'oklch(98% 0.01 25)',
      },
      fontSize: {
        xs: ['14px', { lineHeight: '20px' }],
        sm: ['16px', { lineHeight: '24px' }],
        base: ['18px', { lineHeight: '28px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['24px', { lineHeight: '32px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['38px', { lineHeight: '44px' }],
      },
      minHeight: {
        touch: '52px',
        'touch-lg': '60px',
        nav: '64px',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        slow: '200ms',
      },
    },
  },
  plugins: [],
}
