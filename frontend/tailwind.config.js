/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
        fontFamily: {
            manrope: ['Manrope', 'sans-serif'],
            'dm-sans': ['DM Sans', 'sans-serif'],
        },
        keyframes: {
            fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
            }
        },
        animation: {
            'fade-in': 'fadeIn 150ms ease-in-out',
        },
        zIndex: {
            '10': '10',
            '20': '20',
            '50': '50',
        }
        },
    },
    plugins: [],
}