import baseConfig from '@terraviva/ui/tailwind.config'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/auth/src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  presets: [baseConfig],

}

export default config