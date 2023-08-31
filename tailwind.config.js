/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'MPLUS1p': ['MPLUS1p'],
        'MPLUS1p_b': ['MPLUS1p_b'],
        'MPLUS1p_black': ['MPLUS1p_black']
      }
    },
  },
  plugins: [],
}