import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond','Georgia','serif'],
        sans:  ['DM Sans','system-ui','sans-serif'],
      },
      colors: {
        sand:  { 50:'#fdf9f3',100:'#f9f0e3',200:'#f2dfc4',300:'#e8c99a',400:'#dcae6e',500:'#d09650',600:'#b97a3a',700:'#9a5f2e',800:'#7d4c27',900:'#653e21' },
        terra: { 50:'#fdf4f0',100:'#fae5db',200:'#f4c7b4',300:'#eca085',400:'#e27555',500:'#d4502e',600:'#bc3a1f',700:'#9c2e19',800:'#7e2718',900:'#682318' },
        stone: { 50:'#f8f7f5',100:'#f0ede8',200:'#ddd8cf',300:'#c4bbad',400:'#a89885',500:'#8f7d6a',600:'#7a6759',700:'#655549',800:'#52443b',900:'#443932' },
        ocean: { 400:'#5b9ec9',500:'#3d7fa8',600:'#2e6589' },
      },
      keyframes: {
        fadeIn: { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        fadeUp: { '0%':{ opacity:'0', transform:'translateY(40px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease forwards',
        'fade-up': 'fadeUp .9s cubic-bezier(.16,1,.3,1) forwards',
      },
    },
  },
  plugins: [],
}
export default config
