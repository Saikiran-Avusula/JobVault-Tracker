# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Authentication Configuration

### Google Auth Branding (Fixing the URL issue)
> [!IMPORTANT]
> If you still see the Supabase URL instead of "JobVault Tracker", it is because **Supabase is not yet using your custom Google credentials.** You MUST complete both steps below.

#### Step 1: Create Credentials in Google Cloud
1.  In your [Google Cloud Console](https://console.cloud.google.com/), go to **APIs & Services > Credentials**.
2.  Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3.  Select **Web application** as the Application type.
4.  **Authorized Javascript origins**: `https://ispmmkjqoencvpptkhxy.supabase.co`
5.  **Authorized redirect URIs**: `https://ispmmkjqoencvpptkhxy.supabase.co/auth/v1/callback`
6.  Click **Create** and copy the **Client ID** and **Client Secret**.

#### Step 2: Connect to Supabase (The Fix)
1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/ispmmkjqoencvpptkhxy/auth/providers).
2.  Find **Google** in the Auth Providers list.
3.  **THIS IS THE CRITICAL STEP**: Paste your **Client ID** and **Client Secret** from Step 1 here.
4.  Ensure "Skip nonce check" is checked if you have issues, then click **Save**.

#### ♻️ Refresh to Verify
Wait 1-2 minutes for the cache to clear. Try logging in again (you might need to use an Incognito/Private window or clear your browser cache to see the change immediately).
