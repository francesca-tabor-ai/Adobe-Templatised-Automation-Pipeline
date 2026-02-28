/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0a0a0b',
          muted: '#52525b',
          subtle: '#71717a',
          faint: '#a1a1aa',
        },
        paper: {
          DEFAULT: '#ffffff',
          subdued: '#fafafa',
          border: '#e4e4e7',
          divider: '#d4d4d8',
        },
      },
      borderRadius: {
        'ui': '0.75rem',
        'card': '1rem',
        'pill': '9999px',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 35%, #ec4899 70%, #f97316 100%)',
        'accent-gradient-subtle': 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.06) 35%, rgba(236,72,153,0.06) 70%, rgba(249,115,22,0.06) 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.04)',
        'soft-lg': '0 4px 20px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
