const { theme } = require('@alegradev/smile-ui-next')

module.exports = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: theme(),
  plugins: [],
}
