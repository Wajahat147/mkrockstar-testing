/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "secondary": "#c6c6c7", "inverse-primary": "#5e5e5e", "tertiary-container": "#000000",
        "surface-bright": "#393939", "error": "#ffb4ab", "on-surface-variant": "#cfc4c5",
        "primary": "#c6c6c6", "on-primary-fixed-variant": "#474747", "outline-variant": "#4c4546",
        "on-primary-container": "#757575", "primary-fixed": "#e2e2e2", "on-primary": "#303030",
        "on-tertiary": "#3c2f00", "on-error": "#690005", "surface-tint": "#c6c6c6",
        "surface-container": "#201f1f", "tertiary": "#e9c349", "on-error-container": "#ffdad6",
        "inverse-on-surface": "#313030", "secondary-container": "#454747", "on-secondary": "#2f3131",
        "on-background": "#e5e2e1", "on-primary-fixed": "#1b1b1b", "secondary-fixed": "#e2e2e2",
        "surface-container-low": "#1c1b1b", "primary-container": "#000000", "error-container": "#93000a",
        "inverse-surface": "#e5e2e1", "on-tertiary-container": "#8f7200", "surface-container-high": "#2a2a2a",
        "on-surface": "#e5e2e1", "outline": "#988e90", "surface-dim": "#131313",
        "surface-container-lowest": "#0e0e0e", "background": "#131313", "on-secondary-container": "#b4b5b5",
        "surface-container-highest": "#353534", "tertiary-fixed": "#ffe088", "surface-variant": "#353534",
        "tertiary-fixed-dim": "#e9c349", "surface": "#131313"
      },
      fontFamily: { "headline-md": ["Anton"], "headline-lg": ["Anton"], "body-md": ["Hanken Grotesk"], "display-xl": ["Anton"], "body-lg": ["Hanken Grotesk"], "label-caps": ["Hanken Grotesk"] },
      fontSize: {
        "headline-md": ["32px", { "lineHeight": "40px", "letterSpacing": "0.05em", "fontWeight": "400" }],
        "headline-lg": ["64px", { "lineHeight": "72px", "letterSpacing": "0.02em", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.15em", "fontWeight": "700" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ]
}
