Dashboard app (Angular + Tailwind)

Quick notes:

- This app was extended with a small task management UI, auth service, and a local fallback using localStorage.
- Tailwind directives were added to `src/styles.css` and `tailwind.config.cjs` / `postcss.config.cjs` were added.

To run locally (first time):

1. From workspace root, install missing dev deps (tailwind, postcss, autoprefixer):

```powershell
npm install -D tailwindcss postcss autoprefixer
```

2. Build and serve the app via Nx (from workspace root):

```powershell
npx nx serve dashboard
```

Notes:
- The UI expects a backend at `/api` for auth and tasks. If no backend is available, the UI will use localStorage for tasks and demo login may not authenticate against a backend.
- I can wire up proxy configuration or implement a simple mock backend if you want.
