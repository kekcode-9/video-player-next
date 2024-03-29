import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    colors: {
      'shocking-pink': '#FF1BB1',
      'dark-charcoal': '#0D1317',
      'jacarta': '#392F5A',
      'black': '#000000',
      'white': '#FFFFFF',
      'transparent': 'transparent',
      'gray': '#626262'
    },
  },
  plugins: [],
}
export default config
