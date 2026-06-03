/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'oklch(13% 0.008 250)',
        surface: 'oklch(19% 0.008 250)',
        'surface-2': 'oklch(24% 0.008 250)',
        border: 'oklch(28% 0.008 250)',
        'border-dim': 'oklch(22% 0.008 250)',
        text: 'oklch(94% 0.005 250)',
        muted: 'oklch(60% 0.008 250)',
        dim: 'oklch(44% 0.008 250)',
        primary: 'oklch(72% 0.17 145)',
        'primary-fg': 'oklch(98% 0.005 145)',
        warning: 'oklch(78% 0.16 55)',
        'warning-fg': 'oklch(13% 0.008 250)',
        danger: 'oklch(62% 0.20 25)',
        'danger-fg': 'oklch(98% 0.005 25)',
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
