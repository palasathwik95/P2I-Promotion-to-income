/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#0B0F19',
                    card: '#161F30',
                    blue: '#1E40AF',
                    purple: '#7C3AED',
                    accent: '#A78BFA',
                    light: '#F3F4F6'
                }
            },
            fontFamily: {
                sans: ['Poppins', 'Inter', 'sans-serif'],
            },
            boxShadow: {
                glow: '0 0 20px rgba(124, 58, 237, 0.15)',
                'glow-strong': '0 0 30px rgba(124, 58, 237, 0.3)',
            }
        },
    },
    plugins: [],
}
