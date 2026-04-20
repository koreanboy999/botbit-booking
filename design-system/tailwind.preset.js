/**
 * BotBit.cc Design System — Tailwind Preset
 * Synced 1:1 with tokens.css (extracted from Stitch)
 *
 * Usage in tailwind.config.js:
 *   presets: [require('./design-system/tailwind.preset.js')]
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      /* ─── Colors ─── */
      colors: {
        primary: '#00ff88',
        secondary: '#00D4FF',
        background: {
          light: '#f5f8f7',
          dark: '#0A0A0A',
        },
        terminal: {
          bg: '#0A0A0A',
          elevated: 'rgba(255, 255, 255, 0.03)',
          body: 'rgba(0, 0, 0, 0.6)',
          header: 'rgba(0, 0, 0, 0.4)',
        },
        // Expose alpha scale for bg-primary/10 etc.
        'primary-alpha': {
          5: 'rgba(0, 255, 136, 0.05)',
          10: 'rgba(0, 255, 136, 0.1)',
          15: 'rgba(0, 255, 136, 0.15)',
          20: 'rgba(0, 255, 136, 0.2)',
          30: 'rgba(0, 255, 136, 0.3)',
          40: 'rgba(0, 255, 136, 0.4)',
          50: 'rgba(0, 255, 136, 0.5)',
          60: 'rgba(0, 255, 136, 0.6)',
        },
        dot: {
          red: 'rgba(239, 68, 68, 0.8)',
          yellow: 'rgba(234, 179, 8, 0.8)',
          green: 'rgba(34, 197, 94, 0.8)',
        },
      },

      /* ─── Font Family (Space Grotesk from Stitch) ─── */
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['ui-monospace', 'Cascadia Code', 'Fira Code', 'Consolas', 'monospace'],
      },

      /* ─── Font Size ─── */
      fontSize: {
        'display-xl': ['3.75rem', { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '900' }],
        'display-lg': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '900' }],
      },

      /* ─── Border Radius (Stitch: ROUND_EIGHT) ─── */
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },

      /* ─── Box Shadow (exact Stitch values) ─── */
      boxShadow: {
        'glow-sm': '0 0 15px rgba(0, 255, 136, 0.3)',
        'glow-md': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 25px rgba(0, 255, 136, 0.5)',
        'glow-xl': '0 0 30px rgba(0, 255, 136, 0.5)',
        'glow-btn': '0 0 15px rgba(0, 255, 136, 0.3)',
        'glow-btn-hover': '0 0 25px rgba(0, 255, 136, 0.5)',
        'glow-cta': '0 0 15px rgba(0, 255, 136, 0.4)',
        'glow-cta-hover': '0 0 25px rgba(0, 255, 136, 0.6)',
        'glow-card': '0 0 20px rgba(0, 255, 136, 0.15)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'terminal': '0 25px 50px -12px rgba(0, 255, 136, 0.1)',
      },

      /* ─── Background Image (Grid pattern from Stitch) ─── */
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(to right, rgba(0, 255, 136, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 255, 136, 0.05) 1px, transparent 1px)
        `,
        'gradient-radial-green': 'radial-gradient(circle at 25% 25%, rgba(0, 255, 136, 0.1) 0%, transparent 50%)',
        'gradient-radial-cyan': 'radial-gradient(circle at 75% 75%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)',
      },

      backgroundSize: {
        grid: '50px 50px',
      },

      /* ─── Keyframes (synced with animations.css) ─── */
      keyframes: {
        'terminal-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'terminal-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)' },
        },
        'crt-flicker': {
          '0%': { opacity: '0.97' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.98' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },

      /* ─── Animation ─── */
      animation: {
        'terminal-pulse': 'terminal-pulse 2s ease-in-out infinite',
        'terminal-glow': 'terminal-glow 2s ease-in-out infinite',
        'crt-flicker': 'crt-flicker 0.15s infinite',
        blink: 'blink 1s step-end infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-left': 'slide-in-left 0.5s ease-out forwards',
        'slide-right': 'slide-in-right 0.5s ease-out forwards',
        'slide-up': 'slide-in-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
