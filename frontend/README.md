Google Sign-In Setup
--------------------

1. Create a Google OAuth 2.0 Client ID (Web) in Google Cloud Console.
2. Add your dev origin (e.g., http://localhost:5173) to Authorized JavaScript origins.
3. Copy the Client ID.
4. Create a `.env` file in this folder and set:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

5. Ensure `index.html` includes the Google Identity Services script (already added).
6. Restart `npm run dev` after changing env.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
