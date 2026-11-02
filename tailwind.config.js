/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: {
      campus: { orange: '#FF6900', deep: '#E96500', navy: '#101828', muted: '#667085', pale: '#FFF7ED', border: '#E8EDF3' }
    },
    fontFamily: { sans: ['Inter', 'Poppins', 'sans-serif'] },
    boxShadow: { soft: '0 4px 14px rgba(16,24,40,.08)' }
  }},
  plugins: []
}
