module.exports = {
  // Use the @tailwindcss/postcss wrapper plugin to be compatible with Angular's PostCSS loader
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
