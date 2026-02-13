tailwind.config = {
  theme: {
    extend: {
      colors: {
        bg: '#eceae0',
        card: '#ffffff',
        text: '#2c2c2c',
        'text-secondary': '#555',
        border: '#d0cec6',
        'border-light': '#e0ded6',
        'selected-bg': '#eef0ff',
        'selected-border': '#b8bce0',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        's': '11px',
        'm': '13px',
        'l': '18px',
      },
      spacing: {
        'xs': '4px',
        's': '8px',
        'm': '12px',
        'l': '16px',
        'xl': '20px',
      },
      borderRadius: {
        DEFAULT: '10px',
        's': '6px',
      },
    },
  },
}
