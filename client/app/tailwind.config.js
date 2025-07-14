/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Gruvbox Dark
        'gruvbox-dark-bg0': '#282828',
        'gruvbox-dark-bg0-h': '#1d2021',
        'gruvbox-dark-bg0-s': '#32302f',
        'gruvbox-dark-bg1': '#3c3836',
        'gruvbox-dark-bg2': '#504945',
        'gruvbox-dark-bg3': '#665c54',
        'gruvbox-dark-bg4': '#7c6f64',
        'gruvbox-dark-fg0': '#fbf1c7',
        'gruvbox-dark-fg1': '#ebdbb2',
        'gruvbox-dark-fg2': '#d5c4a1',
        'gruvbox-dark-fg3': '#bdae93',
        'gruvbox-dark-fg4': '#a89984',

        // Gruvbox Light
        'gruvbox-light-bg0': '#fbf1c7',
        'gruvbox-light-bg0-h': '#f9f5d7',
        'gruvbox-light-bg0-s': '#f2e5bc',
        'gruvbox-light-bg1': '#ebdbb2',
        'gruvbox-light-bg2': '#d5c4a1',
        'gruvbox-light-bg3': '#bdae93',
        'gruvbox-light-bg4': '#a89984',
        'gruvbox-light-fg0': '#282828',
        'gruvbox-light-fg1': '#3c3836',
        'gruvbox-light-fg2': '#504945',
        'gruvbox-light-fg3': '#665c54',
        'gruvbox-light-fg4': '#7c6f64',

        // Standard Gruvbox
        'gruvbox-red': '#cc241d',
        'gruvbox-red-light': '#9d0006',
        'gruvbox-red-dark': '#fb4934',
        'gruvbox-green': '#98971a',
        'gruvbox-green-light': '#79740e',
        'gruvbox-green-dark': '#b8bb26',
        'gruvbox-yellow': '#d79921',
        'gruvbox-yellow-light': '#b57614',
        'gruvbox-yellow-dark': '#fabd2f',
        'gruvbox-blue': '#458588',
        'gruvbox-blue-light': '#076678',
        'gruvbox-blue-dark': '#83a598',
        'gruvbox-purple': '#b16286',
        'gruvbox-purple-light': '#8f3f71',
        'gruvbox-purple-dark': '#d3869b',
        'gruvbox-aqua': '#689d6a',
        'gruvbox-aqua-light': '#427b58',
        'gruvbox-aqua-dark': '#8ec07c',
        'gruvbox-orange': '#d65d0e',
        'gruvbox-orange-light': '#af3a03',
        'gruvbox-orange-dark': '#fe8019',
        'gruvbox-gray': '#a89984',

        // Status
        'status-online': '#10b981',
        'status-offline': '#6b7280',

        // Scrollbar (if you want)
        'scrollbar-track': '#f1f1f1',
        'scrollbar-thumb': '#c1c1c1',
        'scrollbar-thumb-hover': '#a1a1a1',

        // Background/foreground for prefers-color-scheme
        background: '#0a0a0a',
        foreground: '#ededed',
      },
    },
  },
  plugins: [],
};
