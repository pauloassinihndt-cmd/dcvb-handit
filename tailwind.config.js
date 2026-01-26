/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-tertiary': 'var(--bg-tertiary)',

                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',

                'primary': 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',

                'accent-success': 'var(--accent-success)',
                'accent-warning': 'var(--accent-warning)',
                'accent-danger': 'var(--accent-danger)',

                'border-color': 'var(--border-color)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fadeIn': 'fadeIn 0.5s ease-out',
                'ping': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
