module.exports = {
  purge: [
    './pages/**/*.{js,ts,jsx,tsx}', 
    './Components/**/*.{js,ts,jsx,tsx}'],
  mode: 'jit',
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        'garmond': ['"EB Garamond"', 'serif'],    
       },
       minHeight: {
         '1': '1px'
       }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
