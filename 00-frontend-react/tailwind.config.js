module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          blue: "#2463eb",
          background: "#e5fdff",
          foreground: "#000000",
        },
        secondary: {
          background: "#ffffff",
          foreground: "#333333",
        },
        accent: {
          DEFAULT: "#b7d8ec",
          foreground: "#ffffff",
        },
        border: {
          primary: "#b3b3b3",
          secondary: "#f2010126",
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inria: ['Inria Sans', 'sans-serif'],
      },
      boxShadow: {
        custom: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        custom: '30px',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideInLeft': 'slideInLeft 0.5s ease-out',
        'slideInRight': 'slideInRight 0.5s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        slideInLeft: {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        slideInRight: {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        scaleIn: {
          '0%': {
            transform: 'scale(0.9)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
};