/**
 * PostCSS Configuration
 * 
 * Purpose:
 * Processes CSS files to add vendor prefixes and handle Tailwind CSS compilation.
 * 
 * How it works:
 * It plugins 'tailwindcss' and 'autoprefixer' into the CSS processing pipeline 
 * used by Vite.
 */

export default {

  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}