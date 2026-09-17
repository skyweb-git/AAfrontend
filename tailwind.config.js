/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#C31D1D',
          50: '#FBE8E8',
          100: '#F5D0D0',
          400: '#E04A4A',
          500: '#C31D1D',
          600: '#C31D1D',
          700: '#9E1717',
          800: '#7A1212',
        },
      },
      animation: {
        'pencil-body1': 'pencilBody1 3s infinite',
        'pencil-body2': 'pencilBody2 3s infinite',
        'pencil-body3': 'pencilBody3 3s infinite',
        'pencil-eraser': 'pencilEraser 3s infinite',
        'pencil-eraser-skew': 'pencilEraserSkew 3s infinite',
        'pencil-point': 'pencilPoint 3s infinite',
        'pencil-rotate': 'pencilRotate 3s infinite',
        'pencil-stroke': 'pencilStroke 3s infinite',
      },
      keyframes: {
        pencilBody1: {
          'from, to': { strokeDashoffset: '351.86', transform: 'rotate(-90deg)' },
          '50%': { strokeDashoffset: '150.8', transform: 'rotate(-225deg)' },
        },
        pencilBody2: {
          'from, to': { strokeDashoffset: '406.84', transform: 'rotate(-90deg)' },
          '50%': { strokeDashoffset: '174.36', transform: 'rotate(-225deg)' },
        },
        pencilBody3: {
          'from, to': { strokeDashoffset: '296.88', transform: 'rotate(-90deg)' },
          '50%': { strokeDashoffset: '127.23', transform: 'rotate(-225deg)' },
        },
        pencilEraser: {
          'from, to': { transform: 'rotate(-45deg) translate(49px,0)' },
          '50%': { transform: 'rotate(0deg) translate(49px,0)' },
        },
        pencilEraserSkew: {
          'from, 32.5%, 67.5%, to': { transform: 'skewX(0)' },
          '35%, 65%': { transform: 'skewX(-4deg)' },
          '37.5%, 62.5%': { transform: 'skewX(8deg)' },
          '40%, 45%, 50%, 55%, 60%': { transform: 'skewX(-15deg)' },
          '42.5%, 47.5%, 52.5%, 57.5%': { transform: 'skewX(15deg)' },
        },
        pencilPoint: {
          'from, to': { transform: 'rotate(-90deg) translate(49px,-30px)' },
          '50%': { transform: 'rotate(-225deg) translate(49px,-30px)' },
        },
        pencilRotate: {
          from: { transform: 'translate(100px,100px) rotate(0)' },
          to: { transform: 'translate(100px,100px) rotate(720deg)' },
        },
        pencilStroke: {
          from: { strokeDashoffset: '439.82', transform: 'translate(100px,100px) rotate(-113deg)' },
          '50%': { strokeDashoffset: '164.93', transform: 'translate(100px,100px) rotate(-113deg)' },
          '75%, to': { strokeDashoffset: '439.82', transform: 'translate(100px,100px) rotate(112deg)' },
        },
      },
    },
  },
  plugins: [],
}
