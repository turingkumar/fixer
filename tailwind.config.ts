import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
        'display': ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        'tank': {
          'cream': '#FFF8E7',
          'milk': '#FEFEFE',
          'caution': '#F59E0B',
          'danger': '#DC2626',
          'success': '#059669',
          'steel': '#1E293B',
          'gauge': '#0EA5E9',
        }
      }
    },
  },
  plugins: [],
}
export default config
