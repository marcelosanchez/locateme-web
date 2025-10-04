# LocateMe Web - Real-Time Device Tracking PWA

A React 19-based Progressive Web Application for real-time device tracking and location monitoring with Google OAuth authentication and interactive map interfaces.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🗺️ Map Configuration

The application uses MapLibre GL for interactive mapping. By default, it uses a free OpenStreetMap-based theme.

### Setting up MapTiler (Premium Maps)

For enhanced map features and styles, you can use MapTiler's premium maps:

#### 1. Get a Free MapTiler API Key

1. Visit [MapTiler Cloud](https://cloud.maptiler.com/)
2. **Sign up for free** (no credit card required)
3. Once logged in, go to **API Keys** section
4. Copy your **Default Key** (starts with `pk.eyJ...`)

#### 2. Configure Map Style

1. Copy the template file:
   ```bash
   cp public/map-styles/findmy-dark.json.template public/map-styles/findmy-dark.json
   ```

2. Edit `public/map-styles/findmy-dark.json` and replace all instances of:
   ```
   get_your_own_OpIi9ZULNHzrESv6T2vL
   ```
   with your actual MapTiler API key.

3. Update your `.env` file:
   ```bash
   VITE_MAPTILER_URL=/map-styles/findmy-dark.json
   ```

#### 3. Fallback Configuration

If you don't set up MapTiler, the application will automatically use the free OSM dark theme:
```bash
VITE_MAPTILER_URL=/map-styles/osm-dark.json
```

### Map Themes Available
- `osm-dark.json` - Free OpenStreetMap dark theme ✅
- `findmy-dark.json` - Premium FindMy-style theme (requires MapTiler key) 🔑

## 🔧 Development

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
